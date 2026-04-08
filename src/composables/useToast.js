// src/composables/useToast.js
import { ref } from 'vue'

const toasts = ref([])
let idCounter = 0

export function useToast() {
  const show = (message, type = 'info', duration = 4000) => {
    const id = ++idCounter
    toasts.value.push({ id, message, type })
    setTimeout(() => dismiss(id), duration)
    return id
  }

  const dismiss = (id) => {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  const dismissAll = () => {
    toasts.value = []
  }

  return {
    toasts,
    success: (msg, duration) => show(msg, 'success', duration),
    error: (msg, duration) => show(msg, 'error', duration),
    info: (msg, duration) => show(msg, 'info', duration),
    warning: (msg, duration) => show(msg, 'warning', duration),
    dismiss,
    dismissAll,
  }
}
