import { ref, computed } from 'vue'

const STORAGE_KEY = 'app_settings'

const defaultSettings = {
  apiBaseUrl: 'http://127.0.0.1:8001/api',
  theme: 'light',
  language: 'id'
}

const settings = ref({ ...defaultSettings })

/**
 * Parse a full URL into its components.
 * @param {string} url
 * @returns {{ protocol: string, host: string, port: string, path: string }}
 */
export function parseUrl(url) {
  try {
    const u = new URL(url)
    return {
      protocol: u.protocol.replace(':', ''),
      host: u.hostname,
      port: u.port,
      path: u.pathname.replace(/\/$/, '') // strip trailing slash
    }
  } catch {
    return { protocol: 'http', host: '127.0.0.1', port: '8001', path: '/api' }
  }
}

/**
 * Reconstruct a full URL from components.
 * @param {{ protocol: string, host: string, port: string, path: string }} parts
 * @returns {string}
 */
export function buildUrl({ protocol, host, port, path }) {
  const p = path && !path.startsWith('/') ? '/' + path : path
  const portPart = port ? `:${port}` : ''
  return `${protocol}://${host}${portPart}${p || ''}`
}

// Load from localStorage on init
const loadSettings = async () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      settings.value = { ...defaultSettings, ...JSON.parse(stored) }
    }
    
    // Override with config.json if running in Electron and no local storage overrides it yet
    if (window.electronAPI && window.electronAPI.getConfig) {
      const config = await window.electronAPI.getConfig()
      if (config && config.backendUrl) {
        const fullApiUrl = config.backendUrl + (config.apiPath || '/api')
        const adminerPort = config.adminerPort || 8002
        settings.value.adminerUrl = `http://127.0.0.1:${adminerPort}` + (config.adminerPath || '/adminer.php')
        
        // If user hasn't explicitly saved a different setting, use config.json
        if (!stored) {
          settings.value.apiBaseUrl = fullApiUrl
        }
      }
    }
  } catch (e) {
    console.error('Failed to load settings:', e)
  }
}

const saveSettings = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings.value))
  } catch (e) {
    console.error('Failed to save settings:', e)
  }
}

loadSettings()

export function useSettings() {
  const apiBaseUrl = computed({
    get: () => settings.value.apiBaseUrl,
    set: (val) => {
      settings.value.apiBaseUrl = val
      saveSettings()
    }
  })

  // adminerUrl is now completely reactive to settings.value.adminerUrl
  // and we don't need a hardcoded fallback 8002 here because loadSettings handles it.
  // We'll leave the fallback just in case loadSettings hasn't finished yet.
  const adminerUrl = computed(() => settings.value.adminerUrl || 'http://127.0.0.1:8002/adminer.php')

  const resetToDefault = () => {
    settings.value = { ...defaultSettings }
    saveSettings()
  }

  return {
    settings,
    apiBaseUrl,
    adminerUrl,
    resetToDefault,
    loadSettings,
    saveSettings
  }
}