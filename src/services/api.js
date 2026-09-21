import axios from 'axios'
import { useSettings } from '@/composables/useSettings'

const isElectron = window.location.protocol === 'file:' || window.location.pathname.includes('dist-electron')
const { apiBaseUrl } = useSettings()

// Electron mode: use configured base URL (default localhost:8001)
// Browser mode: use configured base URL or fallback to proxy /api
const baseURL = isElectron
  ? apiBaseUrl.value
  : (import.meta.env.VITE_API_BASE_URL || apiBaseUrl.value || '/api')

const apiClient = axios.create({
  baseURL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
})

// Request Interceptor to add auth token & dynamic base URL
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // Update baseURL dynamically from settings (in case user changed it)
  const currentBase = isElectron
    ? apiBaseUrl.value
    : (import.meta.env.VITE_API_BASE_URL || apiBaseUrl.value || '/api')
  config.baseURL = currentBase

  return config
}, (error) => {
  return Promise.reject(error)
})

// Response Interceptor to handle 401 Unauthorized
apiClient.interceptors.response.use((response) => {
  return response;
}, (error) => {
  if (error.response && error.response.status === 401) {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    if (window.location.hash !== '#/login') {
      window.location.hash = '#/login'
    }
  }
  return Promise.reject(error)
})



export default apiClient
