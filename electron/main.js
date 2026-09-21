import { app, BrowserWindow, Menu, dialog, ipcMain, shell, clipboard, nativeImage } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import os from 'node:os'
import fs from 'node:fs/promises'
import fsSync from 'node:fs'
import pty from 'node-pty'
import chokidar from 'chokidar'
import { exec } from 'node:child_process'
import util from 'node:util'

import http from 'node:http'
import axios from 'axios'
import { streamText, tool } from 'ai'
import { z } from 'zod'
import { createOpenAI } from '@ai-sdk/openai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createAnthropic } from '@ai-sdk/anthropic'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

const execPromise = util.promisify(exec)

let mcpClient = null;

async function setupMCPClient() {
  try {
    const transport = new StdioClientTransport({
      command: process.platform === 'win32' ? 'npx.cmd' : 'npx',
      args: ['-y', '@modelcontextprotocol/server-filesystem', 'C:\\', 'D:\\', process.cwd()]
    });

    mcpClient = new Client({
      name: "makarya-ide",
      version: "1.0.0"
    }, {
      capabilities: {}
    });

    await mcpClient.connect(transport);
    console.log('[MCP] Connected to filesystem server');
  } catch (err) {
    console.error('[MCP] Failed to setup client:', err);
  }
}

ipcMain.handle('app:proxyRequest', async (event, config) => {
  const start = performance.now();
  try {
    const res = await axios({
      url: config.url,
      method: config.method || 'GET',
      headers: config.headers || {},
      params: config.query || {},
      data: config.body || undefined,
      timeout: config.timeout ? config.timeout * 1000 : 30000,
      responseType: 'text',
      validateStatus: () => true // Resolve on all statuses
    });
    
    const elapsed = Math.round(performance.now() - start);
    
    // Generate cURL for UI
    let curl = `curl -X ${config.method || 'GET'} "${config.url}"`;
    if (config.headers) {
      for (const [k, v] of Object.entries(config.headers)) {
        curl += ` -H "${k}: ${v}"`;
      }
    }
    if (config.body) {
      if (typeof config.body === 'object') {
        curl += ` -d '${JSON.stringify(config.body)}'`;
      } else {
        curl += ` -d '${config.body}'`;
      }
    }

    return {
      success: true,
      data: {
        status: res.status,
        status_text: res.statusText,
        elapsed_ms: elapsed,
        body: res.data,
        curl: curl,
        headers: res.headers
      }
    };
  } catch (error) {
    const elapsed = Math.round(performance.now() - start);
    return {
      success: false,
      error: {
        message: error.message,
        status: error.response?.status || 0,
        status_text: error.response?.statusText || 'ERROR',
        body: error.response?.data || error.message,
        elapsed_ms: elapsed
      }
    };
  }
})

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')

let win
const terminals = new Map()
let currentWatcher = null
const recentlyWrittenFiles = new Set()
const fileCache = new Map()

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - SystemJS interoperability
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webviewTag: true,
      webSecurity: false, // Allow CORS requests from file:// in production
    },
  })

  // Window Controls Handlers
  ipcMain.on('window:minimize', () => { if (win) win.minimize() })
  ipcMain.on('window:maximize', () => {
    if (win) {
      if (win.isMaximized()) win.unmaximize()
      else win.maximize()
    }
  })
  ipcMain.on('window:close', () => { if (win) win.close() })


  // Terminal connection handler using node-pty
  ipcMain.on('terminal.connect', async (event, id, cwd, colsArg, rowsArg) => {
    if (terminals.has(id)) {
      try { terminals.get(id).kill() } catch (e) { }
    }

    if (cwd) {
      try {
        await fs.mkdir(cwd, { recursive: true })
      } catch (e) {
        console.error('Failed to create directory:', cwd, e)
      }
    }

    // Determine shell based on platform
    const isWindows = os.platform() === 'win32'
    const shell = isWindows ? process.env.COMSPEC || 'cmd.exe' : process.env.SHELL || 'bash'

    const cols = colsArg || 80
    const rows = rowsArg || 30

    const ptyProcess = pty.spawn(shell, [], {
      name: 'xterm-color',
      cols,
      rows,
      cwd: cwd || process.env.HOME || process.env.USERPROFILE || process.cwd(),
      env: process.env,
      encoding: 'utf8',
      // Windows-specific: useConpty for better compatibility
      useConpty: isWindows,
    })

    terminals.set(id, ptyProcess)

    ptyProcess.on('error', (err) => {
      console.error(`Terminal spawn error for ${id}:`, err)
      if (win && !win.isDestroyed()) {
        win.webContents.send('terminal.incomingData', id, `\r\nError starting terminal: ${err.message}\r\n`)
      }
    })

    ptyProcess.on('data', (data) => {
      if (win && !win.isDestroyed()) {
        win.webContents.send('terminal.incomingData', id, data)
      }
    })

    ptyProcess.on('exit', (code) => {
      // Only handle exit if this process is still the active one for this ID
      if (terminals.get(id) === ptyProcess) {
        if (win && !win.isDestroyed()) {
          win.webContents.send('terminal.exit', id, code)
        }
        terminals.delete(id)
      }
    })

  })

  // Handle incoming keystrokes from frontend
  ipcMain.on('terminal.keystroke', (_event, id, key) => {
    const proc = terminals.get(id)
    if (proc) proc.write(key)
  })

  // Handle terminal resize from frontend
  ipcMain.on('terminal.resize', (_event, id, cols, rows) => {
    const proc = terminals.get(id)
    if (proc) proc.resize(cols, rows)
  })

  // Handle kill terminal request from frontend
  ipcMain.on('terminal.kill', (_event, id) => {
    const proc = terminals.get(id)
    if (proc) {
      try { proc.kill() } catch (e) { }
      terminals.delete(id)
    }
  })


  // File System Handlers
  ipcMain.handle('dialog:openDirectory', async (event, defaultPath) => {
    const options = {
      properties: ['openDirectory']
    }
    if (defaultPath) {
      options.defaultPath = defaultPath
    }
    const result = await dialog.showOpenDialog(win, options)
    if (result.canceled || result.filePaths.length === 0) {
      return null
    }
    const dirPath = result.filePaths[0]

    // Setup File Watcher using native recursive watch (blazing fast, 0ms init)
    if (currentWatcher) {
      currentWatcher.close()
    }

    currentWatcher = fsSync.watch(dirPath, { recursive: true }, async (eventType, filename) => {
      if (!filename) return

      const filePath = path.join(dirPath, filename)
      const IGNORE = new Set(['node_modules', '.git', 'vendor', 'dist', '.idea', '.vscode'])
      const parts = filename.split(path.sep)
      if (parts.some(p => IGNORE.has(p) || p.startsWith('.'))) return

      if (recentlyWrittenFiles.has(filePath)) return

      try {
        const stat = await fs.stat(filePath)
        if (stat.isDirectory()) return

        const content = await fs.readFile(filePath, 'utf-8')
        const normalizedPath = filePath.replace(/\\/g, '/')

        const oldContent = fileCache.has(normalizedPath) ? fileCache.get(normalizedPath) : content
        fileCache.set(normalizedPath, content)

        if (win && !win.isDestroyed()) {
          win.webContents.send('ide:external-file-change', {
            path: normalizedPath,
            rawPath: filePath,
            content: content,
            oldContent: oldContent
          })
        }
      } catch (err) {
        console.error('Error reading changed file:', err)
      }
    })

    return {
      path: dirPath,
      name: path.basename(dirPath)
    }
  })

  ipcMain.handle('fs:readDirectory', async (_event, dirPath) => {
    try {
      const list = await fs.readdir(dirPath, { withFileTypes: true })
      const IGNORE = new Set(['node_modules', '.git', 'vendor', 'dist', '.idea', '.vscode'])
      return list
        .filter(item => !IGNORE.has(item.name))
        .map(item => ({
          name: item.name,
          isDirectory: item.isDirectory(),
          path: path.join(dirPath, item.name)
        }))
        .sort((a, b) => {
          // Folders first
          if (a.isDirectory && !b.isDirectory) return -1
          if (!a.isDirectory && b.isDirectory) return 1
          return a.name.localeCompare(b.name)
        })
    } catch (err) {
      console.error('Error reading directory:', err)
      return []
    }
  })

  ipcMain.handle('fs:readFile', async (_event, filePath) => {
    try {
      const content = await fs.readFile(filePath, 'utf-8')
      fileCache.set(filePath.replace(/\\/g, '/'), content)
      return content
    } catch (err) {
      console.error('Error reading file:', err)
      return null
    }
  })

  ipcMain.handle('git:run', async (_event, cwd, args) => {
    try {
      // Basic security: only allow git commands
      const command = `git ${args.join(' ')}`
      const { stdout, stderr } = await execPromise(command, { cwd })
      return { success: true, stdout, stderr }
    } catch (err) {
      console.error('Error running git:', err)
      return { success: false, error: err.message, stdout: err.stdout, stderr: err.stderr }
    }
  })

  ipcMain.handle('mcp:listTools', async () => {
    if (!mcpClient) return { success: false, error: 'MCP Client not initialized' };
    try {
      const response = await mcpClient.listTools();
      return { success: true, tools: response.tools };
    } catch (err) {
      console.error('[MCP] Error listing tools:', err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('mcp:callTool', async (_event, name, args) => {
    if (!mcpClient) return { success: false, error: 'MCP Client not initialized' };
    try {
      const response = await mcpClient.callTool({
        name,
        arguments: args
      });
      return { success: true, result: response };
    } catch (err) {
      console.error(`[MCP] Error calling tool ${name}:`, err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('cmd:run', async (_event, command, cwd) => {
    try {
      // Menambahkan batasan eksekusi untuk mencegah memory leak atau zombie process
      const options = {
         cwd: cwd || process.cwd(),
         timeout: 10000, // Timeout 10 detik (auto-kill process jika melebihi batas)
         maxBuffer: 1024 * 1024, // Max output 1MB
         windowsHide: true // Sembunyikan jendela CMD di Windows
      }
      const { stdout, stderr } = await execPromise(command, options)
      return { success: true, stdout, stderr }
    } catch (err) {
      console.error('Error running cmd:', command, err)
      return { success: false, error: err.message, stdout: err.stdout, stderr: err.stderr }
    }
  })

  const IGNORE_DIRS = new Set(['node_modules', '.git', 'vendor', 'dist', '.idea', '.vscode'])
  async function walkDir(dir, baseDir, depth = 0, state = { count: 0 }) {
    let results = []
    if (depth > 15 || state.count > 30000) return results

    try {
      const list = await fs.readdir(dir, { withFileTypes: true })

      for (const entry of list) {
        if (IGNORE_DIRS.has(entry.name)) continue
        const res = path.join(dir, entry.name)

        if (entry.isDirectory()) {
          results = results.concat(await walkDir(res, baseDir, depth + 1, state))
        } else {
          state.count++
          results.push({
            name: entry.name,
            path: res,
            relativePath: path.relative(baseDir, res).replace(/\\/g, '/')
          })
        }
        if (state.count > 30000) break
      }

      return results
    } catch (e) {
      return []
    }
  }

  ipcMain.handle('fs:searchFiles', async (_event, dirPath, query) => {
    query = query.toLowerCase()
    const allFiles = backendAllFilesCache.length > 0 ? backendAllFilesCache : await walkDir(dirPath, dirPath)
    const results = []
    const SEARCHABLE_EXTS = new Set(['.php', '.js', '.ts', '.vue', '.html', '.css', '.scss', '.json', '.md', '.txt', '.xml', '.yaml', '.yml', '.env', '.sql'])
    const filesToSearch = allFiles.filter(f => SEARCHABLE_EXTS.has(path.extname(f.name).toLowerCase()) || f.name.startsWith('.'))

    for (let i = 0; i < filesToSearch.length; i += 100) {
      const batch = filesToSearch.slice(i, i + 100)
      await Promise.all(batch.map(async (file) => {
        try {
          const stat = await fs.stat(file.path)
          if (stat.size < 1024 * 512) { // limit 512KB
            const content = await fs.readFile(file.path, 'utf-8')
            const lowerContent = content.toLowerCase()

            // EARLY RETURN: 99% of files won't match, so we skip them fast before splitting into arrays
            if (!lowerContent.includes(query)) return

            const lines = content.split('\n')
            const lowerLines = lowerContent.split('\n')
            const matches = []
            for (let j = 0; j < lines.length; j++) {
              if (lowerLines[j].includes(query)) {
                matches.push({ line: j + 1, preview: lines[j].trim() })
              }
            }
            if (matches.length > 0) {
              results.push({ path: file.relativePath, matches })
            }
          }
        } catch (e) { }
      }))
    }
    return results
  })

  // Backend caching for file list to avoid IPC floods
  let backendAllFilesCache = []

  ipcMain.handle('fs:getAllFiles', async (_event, dirPath) => {
    // We cache this in the backend and only return a small slice if requested
    backendAllFilesCache = await walkDir(dirPath, dirPath)
    return backendAllFilesCache.slice(0, 100) // only send first 100 to frontend for initial quick open
  })

  ipcMain.handle('fs:searchFileNames', async (_event, query) => {
    if (!query || query.trim() === '') return backendAllFilesCache.slice(0, 100);
    
    const parts = query.trim().split(/[\\/\\s]+/);
    const escapedParts = parts.map(p => p.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&'));
    const regex = new RegExp(escapedParts.join('.*'), 'i');
    const q = query.toLowerCase();
    
    const results = backendAllFilesCache.filter(f => regex.test(f.relativePath));
    
    results.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      const aNameMatch = aName.includes(q) ? 1 : 0;
      const bNameMatch = bName.includes(q) ? 1 : 0;
      if (aNameMatch !== bNameMatch) return bNameMatch - aNameMatch;
      
      const aNameExact = aName === q ? 1 : 0;
      const bNameExact = bName === q ? 1 : 0;
      if (aNameExact !== bNameExact) return bNameExact - aNameExact;
      
      return a.relativePath.length - b.relativePath.length;
    });
    
    return results.slice(0, 100);
  })

  ipcMain.handle('fs:writeFile', async (_event, filePath, content) => {
    try {
      recentlyWrittenFiles.add(filePath)
      await fs.writeFile(filePath, content, 'utf-8')
      fileCache.set(filePath.replace(/\\/g, '/'), content)

      // Remove from recently written after a delay to allow watcher to fire and be ignored
      setTimeout(() => recentlyWrittenFiles.delete(filePath), 2000)

      return true
    } catch (err) {
      console.error('Error writing file:', err)
      return false
    }
  })

  ipcMain.handle('fs:renameFile', async (_event, oldPath, newPath) => {
    try {
      await fs.rename(oldPath, newPath)
      if (fileCache.has(oldPath.replace(/\\/g, '/'))) {
        fileCache.set(newPath.replace(/\\/g, '/'), fileCache.get(oldPath.replace(/\\/g, '/')))
        fileCache.delete(oldPath.replace(/\\/g, '/'))
      }
      return true
    } catch (err) {
      console.error('Error renaming file:', err)
      return false
    }
  })
  ipcMain.handle('fs:createDirectory', async (_event, dirPath) => {
    try {
      await fs.mkdir(dirPath, { recursive: true })
      return true
    } catch (err) {
      console.error('Error creating directory:', err)
      return false
    }
  })

  ipcMain.handle('fs:createFile', async (_event, filePath) => {
    try {
      // Create empty file
      await fs.writeFile(filePath, '', 'utf-8')
      fileCache.set(filePath.replace(/\\/g, '/'), '')
      return true
    } catch (err) {
      console.error('Error creating file:', err)
      return false
    }
  })

  ipcMain.handle('fs:deleteItem', async (_event, itemPath) => {
    try {
      await fs.rm(itemPath, { recursive: true, force: true })
      fileCache.delete(itemPath.replace(/\\/g, '/'))
      return true
    } catch (err) {
      console.error('Error deleting item:', err)
      return false
    }
  })

  ipcMain.on('fs:revealInExplorer', (_event, filePath) => {
    shell.showItemInFolder(filePath)
  })

  // Image Upload for Plugin (Claude Agent)
  ipcMain.handle('dialog:openImageFile', async () => {
    const result = await dialog.showOpenDialog(win, {
      title: 'Pilih Gambar',
      filters: [
        { name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'] }
      ],
      properties: ['openFile']
    })
    if (result.canceled || result.filePaths.length === 0) return null
    return result.filePaths[0]
  })

  ipcMain.handle('fs:copyFile', async (_event, srcPath, destPath) => {
    try {
      const destDir = path.dirname(destPath)
      await fs.mkdir(destDir, { recursive: true })
      await fs.copyFile(srcPath, destPath)
      return true
    } catch (err) {
      console.error('Error copying file:', err)
      return false
    }
  })

  // Read image from Electron clipboard (bypasses iframe Permissions Policy)
  ipcMain.handle('clipboard:readImage', async () => {
    try {
      const img = clipboard.readImage()
      if (img.isEmpty()) return null
      const pngBuffer = img.toPNG()
      return { base64: pngBuffer.toString('base64'), ext: 'png' }
    } catch (err) {
      console.error('Error reading clipboard image:', err)
      return null
    }
  })

  // Save image from clipboard (base64) as binary file
  ipcMain.handle('fs:writeFileBase64', async (_event, filePath, base64Data) => {
    try {
      const destDir = path.dirname(filePath)
      await fs.mkdir(destDir, { recursive: true })
      const buffer = Buffer.from(base64Data, 'base64')
      await fs.writeFile(filePath, buffer)
      return true
    } catch (err) {
      console.error('Error writing base64 file:', err)
      return false
    }
  })

  // Config API Handler
  ipcMain.handle('app:getConfig', async () => {
    try {
      // In production, config.json will be in process.resourcesPath. In dev, it's in the project root.
      const isPackaged = app.isPackaged;
      const configPath = isPackaged 
        ? path.join(process.resourcesPath, 'config.json') 
        : path.join(__dirname, '../config.json');
      
      if (fsSync.existsSync(configPath)) {
        const rawConfig = await fs.readFile(configPath, 'utf-8');
        return JSON.parse(rawConfig);
      } else {
        console.warn('config.json not found at:', configPath);
        return {
          backendUrl: 'http://127.0.0.1:8001',
          adminerPath: '/adminer.php',
          apiPath: '/api',
          providers: {}
        };
      }
    } catch (err) {
      console.error('Error reading config.json:', err);
      return null;
    }
  })

  ipcMain.handle('app:saveConfig', async (_event, configData) => {
    try {
      const isPackaged = app.isPackaged;
      const configPath = isPackaged 
        ? path.join(process.resourcesPath, 'config.json') 
        : path.join(__dirname, '../config.json');
      
      await fs.writeFile(configPath, JSON.stringify(configData, null, 2), 'utf-8');
      return true;
    } catch (err) {
      console.error('Error saving config.json:', err);
      return false;
    }
  })


  // Agent API Handlers
  ipcMain.handle('agent:getProviders', async (_event, projectPath) => {
    try {
      const aiConfigPath1 = path.join(projectPath, 'config/ai.php');
      const aiConfigPath2 = path.join(projectPath, '../config/ai.php');
      const actualPath = fsSync.existsSync(aiConfigPath1) ? aiConfigPath1 : (fsSync.existsSync(aiConfigPath2) ? aiConfigPath2 : null);
      
      if (!actualPath) return ['groq', 'openai', 'gemini', 'ollama', 'anthropic'];
      
      const content = await fs.readFile(actualPath, 'utf-8');
      const matches = [...content.matchAll(/'driver'\s*=>\s*'([^']+)'/g)];
      return matches.map(m => m[1]);
    } catch(e) {
      return ['groq', 'openai', 'gemini', 'ollama', 'anthropic']; // fallback
    }
  });

  ipcMain.handle('agent:getOpencodeModels', async () => {
    try {
      const { stdout } = await execPromise('opencode models', { timeout: 10000 })
      return stdout.trim().split('\n').map(line => line.trim()).filter(Boolean)
    } catch (err) {
      console.error('[DEBUG] Failed to fetch opencode models:', err)
      return []
    }
  })

  ipcMain.handle('agent:chat', async (_event, projectPath, agentProvider, messages) => {
    try {
      // 1. Read .env file from project root (try current and parent dir)
      const envPath1 = path.join(projectPath, '.env');
      const envPath2 = path.join(projectPath, '../.env');
      let envData = '';
      if (fsSync.existsSync(envPath1)) {
        envData = await fs.readFile(envPath1, 'utf-8');
      } else if (fsSync.existsSync(envPath2)) {
        envData = await fs.readFile(envPath2, 'utf-8');
      } else {
        throw new Error('Could not read .env file in project root');
      }

      // Simple .env parser
      const envVars = {};
      envData.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          let val = match[2] || '';
          val = val.replace(/^['"](.*)['"]$/, '$1').trim();
          envVars[match[1]] = val;
        }
      });

      // 2. Determine API Key and Base URL based on agentProvider
      let apiKey = '';
      let baseURL = '';
      let model = 'gpt-4o'; // default

      const provider = agentProvider.toLowerCase();
      if (provider === 'groq') {
        apiKey = envVars['GROQ_API_KEY'];
        baseURL = 'https://api.groq.com/openai/v1';
        model = envVars['GROQ_MODEL'] || 'llama3-70b-8192';
      } else if (provider === 'openai') {
        apiKey = envVars['OPENAI_API_KEY'];
        baseURL = envVars['OPENAI_URL'] || 'https://api.openai.com/v1';
        model = envVars['OPENAI_MODEL'] || 'gpt-4o';
      } else if (provider === 'ollama') {
        apiKey = envVars['OLLAMA_API_KEY'] || 'ollama';
        baseURL = (envVars['OLLAMA_URL'] || 'http://localhost:11434') + '/v1';
        model = envVars['OLLAMA_MODEL'] || 'llama3';
      } else if (provider === 'gemini') {
         apiKey = envVars['GEMINI_API_KEY'];
         baseURL = 'https://generativelanguage.googleapis.com/v1beta/openai';
         model = 'gemini-1.5-flash';
      } else if (provider === 'anthropic') {
         // Note: Anthropic doesn't natively support OpenAI format without a proxy, but some proxies exist.
         // Better to just fallback to standard OpenAI format for custom providers.
         apiKey = envVars['ANTHROPIC_API_KEY'];
         baseURL = envVars['ANTHROPIC_URL'] || 'https://api.anthropic.com/v1';
         model = 'claude-3-5-sonnet-20240620';
      }

      if (!apiKey && provider !== 'ollama') {
        throw new Error(`API Key for ${provider} not found in .env`);
      }

      // 3. Make fetch request to the LLM API
      const tools = [
        {
          type: "function",
          function: {
            name: "propose_edit",
            description: "Propose a code edit to a specific file. This will open a diff view for the user to approve.",
            parameters: {
              type: "object",
              properties: {
                path: { type: "string", description: "Relative path to the file from project root" },
                new_content: { type: "string", description: "The complete new content of the file" }
              },
              required: ["path", "new_content"]
            }
          }
        }
      ];

      // Add system prompt to messages
      const systemPrompt = {
        role: "system",
        content: `You are an AI coding assistant inside Makarya Editor.
You have access to the user's project at: ${projectPath}
When the user asks you to modify code, use the propose_edit tool to propose the changes.
Always explain briefly what you are changing before calling the tool.`
      };
      
      const fullMessages = [systemPrompt, ...messages];

      const requestBody = {
        model: model,
        messages: fullMessages,
        tools: tools,
        tool_choice: "auto"
      };

      const response = await fetch(`${baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errText}`);
      }

      const data = await response.json();
      const choice = data.choices[0];
      const message = choice.message;

      // 4. Handle tool calls
      if (message.tool_calls && message.tool_calls.length > 0) {
        let proposedFiles = [];
        for (const tc of message.tool_calls) {
          if (tc.function.name === 'propose_edit') {
            const args = JSON.parse(tc.function.arguments);
            const absolutePath = path.join(projectPath, args.path);
            const normalizedPath = absolutePath.replace(/\\/g, '/');
            
            const oldContent = fileCache.has(normalizedPath) ? fileCache.get(normalizedPath) : '';
            
            // Fire event to frontend
            if (win && !win.isDestroyed()) {
              win.webContents.send('ide:external-file-change', {
                path: normalizedPath,
                rawPath: absolutePath,
                content: args.new_content,
                oldContent: oldContent
              });
            }
            proposedFiles.push(args.path);
          }
        }
        return `${message.content || ''}\n\nI have proposed changes to the following files:\n- ${proposedFiles.join('\n- ')}\n\nPlease review them in the editor.`;
      }

      // 5. Return response text
      return message.content || '';
    } catch (err) {
      console.error('[DEBUG] Failed agent chat:', err);
      return `Error: ${err.message}`;
    }
  })

  // Plugin System IPC Handlers
  ipcMain.handle('app:restart', () => {
    app.relaunch()
    app.exit(0)
  })

  ipcMain.handle('plugin:getMarketplace', async (_event, _projectPath) => {
    // Check Makarya Editor's own root .env, not the opened project's .env
    const editorRoot = path.join(__dirname, '../../')
    const envPath = path.join(editorRoot, '.env')
    console.log('[DEBUG] plugin:getMarketplace called for:', envPath)
    let useLocal = false
    try {
      const envData = await fs.readFile(envPath, 'utf-8')
      if (envData.includes('APP_DEBUG=true')) {
        useLocal = true
        console.log('[DEBUG] APP_DEBUG=true found, using local mode.')
      } else {
        console.log('[DEBUG] APP_DEBUG=true NOT found.')
      }
    } catch(e) {
      console.log('[DEBUG] Error reading .env:', e.message)
    }

    if (!useLocal) return { mode: 'github' }

    const pluginsDir = path.join(editorRoot, 'Plugins')
    try {
      const items = await fs.readdir(pluginsDir, { withFileTypes: true })
      const plugins = []
      for (const item of items) {
        if (item.isDirectory() && !item.name.startsWith('.')) {
          const pkgPath = path.join(pluginsDir, item.name, 'package.json')
          try {
            const pkgData = await fs.readFile(pkgPath, 'utf-8')
            const pkg = JSON.parse(pkgData)
            plugins.push({
              id: pkg.id || item.name,
              name: pkg.name || item.name,
              description: pkg.description || 'No description',
              author: pkg.author || 'Unknown',
              downloads: pkg.downloads || '0',
              rating: pkg.rating || 0,
              icon: pkg.icon || 'pi-box',
              iconBg: pkg.iconBg || 'bg-gray-500',
              iconColor: pkg.iconColor || 'text-white',
              contributes: pkg.contributes || {},
              repository: 'local',
              folder: item.name
            })
          } catch(e) {}
        }
      }
      return { mode: 'local', plugins }
    } catch(e) {
      console.log('[DEBUG] Error reading Plugins folder:', e)
      return { mode: 'github' }
    }
  })

  ipcMain.handle('plugin:getList', async (_event) => {
    const pluginDir = path.join(os.homedir(), '.makarya', 'plugins')
    const pluginFile = path.join(pluginDir, 'plugins.json')
    
    // 1. Read existing plugins.json state (for enabled/disabled status)
    let savedState = {}
    try {
      const data = await fs.readFile(pluginFile, 'utf-8')
      savedState = JSON.parse(data)
    } catch (e) {
      savedState = {}
    }

    // 2. Scan pluginDir for plugin folders
    const discoveredPlugins = {}
    try {
      const list = await fs.readdir(pluginDir, { withFileTypes: true })
      for (const item of list) {
        if (item.isDirectory()) {
          const pkgPath = path.join(pluginDir, item.name, 'package.json')
          try {
            const pkgData = await fs.readFile(pkgPath, 'utf-8')
            const pkg = JSON.parse(pkgData)
            
            if (pkg.id) {
              discoveredPlugins[pkg.id] = {
                ...pkg,
                repository: 'local',
                folder: item.name,
                // Prioritize saved state for 'enabled', fallback to package.json default
                enabled: savedState[pkg.id] !== undefined ? savedState[pkg.id].enabled : (pkg.enabled !== false)
              }
            }
          } catch (err) {
            // Ignore folders without a valid package.json
          }
        }
      }
    } catch (e) {
      // Ignore if pluginDir doesn't exist
    }

    return discoveredPlugins
  })

  ipcMain.handle('plugin:install', async (_event, projectPath, pluginId, pluginData) => {
    console.log('[DEBUG] plugin:install started for:', pluginId)
    const pluginDir = path.join(os.homedir(), '.makarya', 'plugins')
    const pluginFile = path.join(pluginDir, 'plugins.json')
    try {
      console.log('[DEBUG] Creating directory:', pluginDir)
      await fs.mkdir(pluginDir, { recursive: true })

      if (pluginData.repository === 'local') {
        const editorRoot = path.join(__dirname, '../../')
        console.log('[DEBUG] Copying local plugin:', pluginData.folder)
        const targetDir = path.join(pluginDir, pluginId)
        const sourceFolder = path.join(editorRoot, 'Plugins', pluginData.folder)
        try {
          await fs.rm(targetDir, { recursive: true, force: true })
        } catch (e) {}
        await fs.cp(sourceFolder, targetDir, { recursive: true })
      } else if (pluginData.repository) {
        console.log('[DEBUG] Cloning repository:', pluginData.repository)
        const targetDir = path.join(pluginDir, pluginId)
        const tempDir = path.join(pluginDir, `_temp_${pluginId}_${Date.now()}`)
        try {
          await fs.rm(targetDir, { recursive: true, force: true })
        } catch (e) {}
        
        await execPromise(`git clone --depth 1 ${pluginData.repository} "${tempDir}"`)
        
        if (pluginData.folder) {
          const sourceFolder = path.join(tempDir, pluginData.folder)
          await fs.rename(sourceFolder, targetDir)
          try {
            await fs.rm(tempDir, { recursive: true, force: true })
          } catch (e) {}
        } else {
          await fs.rename(tempDir, targetDir)
        }
      }

      let registry = {}
      try {
        console.log('[DEBUG] Reading registry file:', pluginFile)
        const data = await fs.readFile(pluginFile, 'utf-8')
        registry = JSON.parse(data)
      } catch (e) {
        console.log('[DEBUG] Registry file not found or invalid, starting fresh.')
      }

      registry[pluginId] = {
        ...pluginData,
        installedAt: new Date().toISOString(),
        enabled: true
      }

      if (!pluginData.repository) {
        console.log('[DEBUG] Simulating delay for dummy plugin...')
        await new Promise(resolve => setTimeout(resolve, 1500))
      }

      console.log('[DEBUG] Writing to registry file...')
      await fs.writeFile(pluginFile, JSON.stringify(registry, null, 2), 'utf-8')
      console.log('[DEBUG] Install successful.')
      return true
    } catch (e) {
      console.error('[DEBUG] Error installing plugin:', e)
      return false
    }
  })

  ipcMain.handle('plugin:uninstall', async (_event, projectPath, pluginId) => {
    const pluginDir = path.join(os.homedir(), '.makarya', 'plugins')
    const pluginFile = path.join(pluginDir, 'plugins.json')
    try {
      let registry = {}
      try {
        const data = await fs.readFile(pluginFile, 'utf-8')
        registry = JSON.parse(data)
      } catch (e) { }

      delete registry[pluginId]

      await fs.writeFile(pluginFile, JSON.stringify(registry, null, 2), 'utf-8')
      
      const targetDir = path.join(pluginDir, pluginId)
      try {
        await fs.rm(targetDir, { recursive: true, force: true })
      } catch (e) {}
      
      return true
    } catch (e) {
      console.error('Failed to uninstall plugin:', e)
      return false
    }
  })

  ipcMain.handle('plugin:readCode', async (_event, projectPath, pluginId) => {
    try {
      const indexPath = path.join(os.homedir(), '.makarya', 'plugins', pluginId, 'index.js')
      return await fs.readFile(indexPath, 'utf-8')
    } catch (e) {
      console.error('[DEBUG] Failed to read plugin code:', e)
      return null
    }
  })

  ipcMain.on('preload-loaded', () => {
    console.log('====== PRELOAD IS LOADED SUCCESSFULLY ======')
  })

  // Membuat jendela aplikasi default maximize seperti VS Code
  win.maximize()

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
    // Buka DevTools secara otomatis di mode development (opsional)
    // win.webContents.openDevTools()
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(process.env.DIST, 'index.html'))
  }

  // Daftarkan shortcut Ctrl+Shift+I khusus untuk inspect element editor utama
  win.webContents.on('before-input-event', (event, input) => {
    if (input.control && input.shift && input.key.toLowerCase() === 'i') {
      win.webContents.toggleDevTools()
      event.preventDefault()
    }
  })

  // Start AI HTTP Server for streaming
  let aiServerPort = 0
  const aiServer = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', '*')

    if (req.method === 'OPTIONS') {
      res.writeHead(200)
      res.end()
      return
    }

    if (req.url === '/api/chat' && req.method === 'POST') {
      let body = ''
      req.on('data', chunk => body += chunk.toString())
      req.on('end', async () => {
        try {
          const { messages, projectPath, agentProvider, agentModel, activeFileContent } = JSON.parse(body)
          
          if (activeFileContent && messages.length > 0) {
            messages[messages.length - 1].content += activeFileContent
          }
          
          const isPackaged = app.isPackaged;
          const configPath = isPackaged 
            ? path.join(process.resourcesPath, 'config.json') 
            : path.join(__dirname, '../config.json');
            
          let envVars = {}
          if (fsSync.existsSync(configPath)) {
            const rawConfig = await fs.readFile(configPath, 'utf-8')
            envVars = JSON.parse(rawConfig)
          } else {
            console.warn('[AI Server] config.json not found at:', configPath)
          }

          const provider = (agentProvider || 'openai').toLowerCase()
          let modelClient

          const providerConfig = envVars.providers?.[provider] || {}
          const apiKey = providerConfig.key || envVars[`${provider.toUpperCase()}_API_KEY`] || ''
          const baseURL = providerConfig.url || envVars[`${provider.toUpperCase()}_URL`]
          const driver = (providerConfig.driver || provider).toLowerCase()

          if (driver === 'groq') {
            const openai = createOpenAI({
              baseURL: baseURL || 'https://api.groq.com/openai/v1',
              apiKey: apiKey,
              compatibility: 'compatible'
            })
            modelClient = openai(agentModel || providerConfig.model || 'llama3-70b-8192')
          } else if (driver === 'openai') {
            const openai = createOpenAI({
              baseURL: baseURL || 'https://api.openai.com/v1',
              apiKey: apiKey,
              compatibility: 'compatible'
            })
            modelClient = openai(agentModel || providerConfig.model || 'gpt-4o')
          } else if (driver === 'ollama') {
            const openai = createOpenAI({
              baseURL: (baseURL || 'http://localhost:11434') + (baseURL?.endsWith('/v1') ? '' : '/v1'),
              apiKey: apiKey || 'ollama',
              compatibility: 'compatible'
            })
            modelClient = openai(agentModel || providerConfig.model || 'llama3')
          } else if (driver === 'gemini') {
            const google = createGoogleGenerativeAI({
              apiKey: apiKey,
              baseURL: baseURL || 'https://generativelanguage.googleapis.com/v1beta/',
            })
            modelClient = google(agentModel || providerConfig.model || 'gemini-1.5-flash')
          } else if (driver === 'anthropic') {
            const anthropic = createAnthropic({
              apiKey: apiKey,
              baseURL: baseURL || 'https://api.anthropic.com/v1',
            })
            modelClient = anthropic(agentModel || providerConfig.model || 'claude-3-5-sonnet-20240620')
          }

          if (!modelClient) throw new Error("Invalid or unconfigured provider")

          let result
          try {
            result = await streamText({
              model: modelClient,
              messages,
              system: `You are an AI coding assistant inside Makarya Editor.\nYou have access to the user's project at: ${projectPath}\nWhen the user asks you to modify code, suggest it clearly.`,
              tools: {
                propose_edit: tool({
                  description: 'Propose a code edit to a specific file. This will open a diff view for the user to approve.',
                  parameters: z.object({
                    path: z.string().describe('Relative path to the file from project root'),
                    new_content: z.string().describe('The complete new content of the file')
                  }),
                  execute: async ({ path: filePath, new_content }) => {
                    const absolutePath = path.join(projectPath, filePath);
                    const normalizedPath = absolutePath.replace(/\\/g, '/');
                    const oldContent = fileCache.has(normalizedPath) ? fileCache.get(normalizedPath) : '';
                    if (win && !win.isDestroyed()) {
                      win.webContents.send('ide:external-file-change', {
                        path: normalizedPath,
                        rawPath: absolutePath,
                        content: new_content,
                        oldContent: oldContent
                      });
                    }
                    return `Change proposed for ${filePath}.`;
                  }
                })
              }
            })
          } catch (err) {
            console.warn("[AI Server] Failed with tools, retrying without tools...", err.message);
            result = await streamText({
              model: modelClient,
              messages,
              system: `You are an AI coding assistant inside Makarya Editor.\nYou have access to the user's project at: ${projectPath}\nWhen the user asks you to modify code, suggest it clearly.`
            });
          }

          result.pipeUIMessageStreamToResponse(res)
        } catch (err) {
          console.error("[AI Server Error]", err)
          require('fs').writeFileSync(require('path').join(process.cwd(), 'ai-server-error.log'), err.stack || err.message)
          res.writeHead(500)
          res.end(JSON.stringify({ error: err.message }))
        }
      })
    } else {
      res.writeHead(404)
      res.end()
    }
  })

  aiServer.listen(0, '127.0.0.1', () => {
    aiServerPort = aiServer.address().port
    console.log('[AI Server] Started on port', aiServerPort)
  })

  ipcMain.handle('agent:getAiPort', () => aiServerPort)
}

let phpProcess = null

app.on('before-quit', () => {
  if (phpProcess) {
    try {
      phpProcess.kill()
    } catch (e) {}
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.whenReady().then(() => {
  // Remove default menu bar
  Menu.setApplicationMenu(null)

  // Start PHP server for Adminer
  try {
    const isPackaged = app.isPackaged;
    const resourcesPath = isPackaged 
      ? path.join(process.resourcesPath, 'resources') 
      : path.join(__dirname, '../resources');
      
    const configPath = isPackaged 
      ? path.join(process.resourcesPath, 'config.json') 
      : path.join(__dirname, '../config.json');
      
    let adminerPort = 8002;
    if (fsSync.existsSync(configPath)) {
      try {
        const rawConfig = fsSync.readFileSync(configPath, 'utf-8');
        const configData = JSON.parse(rawConfig);
        if (configData.adminerPort) {
          adminerPort = configData.adminerPort;
        }
      } catch (e) {
        console.error('Failed to parse config.json for adminerPort', e);
      }
    }
      
    if (fsSync.existsSync(resourcesPath)) {
      phpProcess = require('node:child_process').spawn('php', ['-S', `127.0.0.1:${adminerPort}`, '-t', resourcesPath], {
        stdio: 'ignore'
      })
      console.log(`[PHP Server] Started on 127.0.0.1:${adminerPort} serving`, resourcesPath)
    } else {
      console.warn('[PHP Server] Resources path not found:', resourcesPath)
    }
  } catch (err) {
    console.error('[PHP Server Error]', err)
  }

  setupMCPClient().then(() => {
    createWindow()
  });
})
