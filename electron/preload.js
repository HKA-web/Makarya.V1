const { contextBridge, ipcRenderer } = require('electron')

console.log('====== PRELOAD IS LOADED SUCCESSFULLY ======')

contextBridge.exposeInMainWorld('electronAPI', {
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
  onMainMessage: (callback) => {
    ipcRenderer.removeAllListeners('main-process-message');
    ipcRenderer.on('main-process-message', (_event, ...args) => callback(...args));
  },

  // Terminal methods
  connectTerminal: (id, cwd, cols, rows) => ipcRenderer.send('terminal.connect', id, cwd, cols, rows),
  onTerminalData: (callback) => {
    ipcRenderer.removeAllListeners('terminal.incomingData');
    ipcRenderer.on('terminal.incomingData', (_event, ...args) => callback(...args));
  },
  onTerminalExit: (callback) => {
    ipcRenderer.removeAllListeners('terminal.exit');
    ipcRenderer.on('terminal.exit', (_event, ...args) => callback(...args));
  },
  sendTerminalKeystroke: (id, key) => ipcRenderer.send('terminal.keystroke', id, key),
  resizeTerminal: (id, cols, rows) => ipcRenderer.send('terminal.resize', id, cols, rows),
  killTerminal: (id) => ipcRenderer.send('terminal.kill', id),

  // Window Controls
  windowMinimize: () => ipcRenderer.send('window:minimize'),
  windowMaximize: () => ipcRenderer.send('window:maximize'),
  windowClose: () => ipcRenderer.send('window:close'),

  // File System methods
  openDirectory: (defaultPath) => ipcRenderer.invoke('dialog:openDirectory', defaultPath),
  readDirectory: (dirPath) => ipcRenderer.invoke('fs:readDirectory', dirPath),
  readFile: (filePath) => ipcRenderer.invoke('fs:readFile', filePath),
  gitRun: (cwd, args) => ipcRenderer.invoke('git:run', cwd, args),
  runCommand: (command, cwd) => ipcRenderer.invoke('cmd:run', command, cwd),
  mcpListTools: () => ipcRenderer.invoke('mcp:listTools'),
  mcpCallTool: (name, args) => ipcRenderer.invoke('mcp:callTool', name, args),
  writeFile: (filePath, content) => ipcRenderer.invoke('fs:writeFile', filePath, content),
  createFile: (filePath) => ipcRenderer.invoke('fs:createFile', filePath),
  createDirectory: (dirPath) => ipcRenderer.invoke('fs:createDirectory', dirPath),
  renameFile: (oldPath, newPath) => ipcRenderer.invoke('fs:renameFile', oldPath, newPath),
  deleteItem: (itemPath) => ipcRenderer.invoke('fs:deleteItem', itemPath),
  revealInExplorer: (filePath) => ipcRenderer.send('fs:revealInExplorer', filePath),
  
  // Search
  searchFiles: (dirPath, query) => ipcRenderer.invoke('fs:searchFiles', dirPath, query),
  getAllFiles: (dirPath) => ipcRenderer.invoke('fs:getAllFiles', dirPath),
  searchFileNames: (query) => ipcRenderer.invoke('fs:searchFileNames', query),

  // Image Upload (Plugin Claude Agent)
  openImageFile: () => ipcRenderer.invoke('dialog:openImageFile'),
  copyFile: (srcPath, destPath) => ipcRenderer.invoke('fs:copyFile', srcPath, destPath),
  writeFileBase64: (filePath, base64Data) => ipcRenderer.invoke('fs:writeFileBase64', filePath, base64Data),
  readClipboardImage: () => ipcRenderer.invoke('clipboard:readImage'),

  // App Config
  getConfig: () => ipcRenderer.invoke('app:getConfig'),
  saveConfig: (config) => ipcRenderer.invoke('app:saveConfig', config),
  proxyRequest: (config) => ipcRenderer.invoke('app:proxyRequest', config),

  // Agent API
  getProviders: (projectPath) => ipcRenderer.invoke('agent:getProviders', projectPath),
  getOpencodeModels: () => ipcRenderer.invoke('agent:getOpencodeModels'),
  chatAgent: (projectPath, agentProvider, messages) => ipcRenderer.invoke('agent:chat', projectPath, agentProvider, messages),
  getAiPort: () => ipcRenderer.invoke('agent:getAiPort'),

  // File Watcher events
  onExternalFileChange: (callback) => {
    ipcRenderer.removeAllListeners('ide:external-file-change');
    ipcRenderer.on('ide:external-file-change', (_event, data) => callback(data));
  },
  onFileTreeChange: (callback) => {
    ipcRenderer.removeAllListeners('ide:file-tree-changed');
    ipcRenderer.on('ide:file-tree-changed', (_event, data) => callback(data));
  }
})
