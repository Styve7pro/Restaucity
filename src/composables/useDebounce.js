// src/composables/useDebounce.js
import { ref, watch } from 'vue'

export function useDebounce(value, delay = 300) {
  const debouncedValue = ref(value.value !== undefined ? value.value : value)
  let timer = null

  watch(
    () => (value.value !== undefined ? value.value : value),
    (newVal) => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        debouncedValue.value = newVal
      }, delay)
    }
  )

  return debouncedValue
}

// Version utilitaire standalone
export function debounce(fn, delay = 300) {
  let timer = null
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
