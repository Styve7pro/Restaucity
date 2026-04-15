<template>
  <nav class="bg-white dark:bg-gray-900 border-b border-[var(--color-border)] sticky top-0 z-30">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">

        <!-- Logo mobile -->
        <router-link to="/" class="flex items-center gap-1.5 lg:hidden">
          <div class="w-7 h-7 bg-[var(--color-primary)] rounded-lg flex items-center justify-center">
            <span class="text-white text-base font-bold">R</span>
          </div>
          <span class="text-base font-bold text-[var(--color-text)]">RestauCity</span>
        </router-link>

        <!-- Titre desktop -->
        <h2 class="text-lg font-semibold text-[var(--color-text)] hidden lg:block">
          {{ pageTitle }}
        </h2>

        <!-- Actions slot + thème -->
        <div class="flex items-center gap-2">
          <slot name="actions" />

          <button
            @click="toggleTheme"
            class="p-2 hover:bg-[var(--color-surface)] rounded-lg transition-colors"
            :aria-label="isDark ? 'Mode clair' : 'Mode sombre'"
          >
            <svg v-if="isDark" class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
            <svg v-else class="w-5 h-5 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { useTheme } from '../composables/useTheme'

export default {
  name: 'Navbar',
  setup() {
    const { isDark, toggleTheme } = useTheme()
    return { isDark, toggleTheme }
  },
  computed: {
    pageTitle() {
      const titles = { '/': 'Découvrir les restaurants', '/favorites': 'Mes favoris', '/admin': 'Dashboard Admin' }
      return titles[this.$route.path] || 'RestauCity'
    },
  },
}
</script>
