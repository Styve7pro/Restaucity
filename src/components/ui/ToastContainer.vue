<template>
  <div class="fixed top-4 right-4 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4">
    <TransitionGroup
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-x-full"
      enter-to-class="opacity-100 translate-x-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-x-0"
      leave-to-class="opacity-0 translate-x-full"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border pointer-events-auto"
        :class="toastClasses[toast.type]"
      >
        <span class="text-lg flex-shrink-0 mt-0.5">{{ icons[toast.type] }}</span>
        <p class="text-sm font-medium flex-1 leading-relaxed">{{ toast.message }}</p>
        <button
          @click="dismiss(toast.id)"
          class="opacity-60 hover:opacity-100 transition-opacity text-sm flex-shrink-0 mt-0.5"
        >
          ✕
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script>
import { useToast } from '../../composables/useToast'

export default {
  name: 'ToastContainer',
  setup() {
    const { toasts, dismiss } = useToast()
    return { toasts, dismiss }
  },
  data() {
    return {
      icons: {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
        warning: '⚠️',
      },
      toastClasses: {
        success:
          'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/40 dark:border-green-700 dark:text-green-200',
        error:
          'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/40 dark:border-red-700 dark:text-red-200',
        info:
          'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/40 dark:border-blue-700 dark:text-blue-200',
        warning:
          'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/40 dark:border-yellow-700 dark:text-yellow-200',
      },
    }
  },
}
</script>
