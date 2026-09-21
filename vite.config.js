import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import fs from 'node:fs'

let proxyTarget = 'http://127.0.0.1:8001'
try {
  const configContent = fs.readFileSync(new URL('./config.json', import.meta.url), 'utf-8')
  const config = JSON.parse(configContent)
  if (config.backendUrl) {
    proxyTarget = config.backendUrl
  }
} catch (e) {
  console.warn('Could not read config.json for Vite proxy target, using default', e.message)
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag === 'webview'
        }
      }
    }),
    tailwindcss(),
    electron([
      {
        entry: 'electron/main.js',
        vite: {
          build: {
            rollupOptions: {
              external: ['electron', 'node-pty', 'node:child_process', 'node:os', 'node:path', 'node:url']
            }
          }
        }
      },
      {
        entry: 'electron/preload.js',
        onstart(options) {
          options.reload()
        },
        vite: {
          build: {
            rollupOptions: {
              output: {
                format: 'es',
                entryFileNames: '[name].mjs'
              }
            }
          }
        }
      }
    ]),
    renderer(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      '/api': {
        target: proxyTarget,
        changeOrigin: true
      }
    }
  }
})
