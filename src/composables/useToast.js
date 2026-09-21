import { ref } from 'vue'

const toasts = ref([])
let toastId = 0

export function useToast() {
  const addToast = ({ title, message, type = 'info', duration = 3000 }) => {
    const id = toastId++
    toasts.value.push({ id, title, message, type })
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }

  const removeToast = (id) => {
    const index = toasts.value.findIndex((t) => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  const error = (message, title = 'Error') => addToast({ title, message, type: 'error' })
  const success = (message, title = 'Success') => addToast({ title, message, type: 'success' })
  const warning = (message, title = 'Warning') => addToast({ title, message, type: 'warning' })
  const info = (message, title = 'Info') => addToast({ title, message, type: 'info' })

  return {
    toasts,
    addToast,
    removeToast,
    error,
    success,
    warning,
    info
  }
}
