<template>
  <nav class="bg-white dark:bg-gray-900 border-b border-[var(--color-border)] sticky top-0 z-30">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo (mobile only) -->
        <router-link to="/" class="flex items-center gap-1.5 lg:hidden">
          <div class="w-7 h-7 bg-[var(--color-primary)] rounded-lg flex items-center justify-center">
            <span class="text-white text-base font-bold">R</span>
          </div>
          <span class="text-base font-bold text-[var(--color-text)]">RestauCity</span>
        </router-link>

        <!-- Page Title -->
        <h2 class="text-lg font-semibold text-[var(--color-text)] hidden lg:block">
          {{ pageTitle }}
        </h2>

        <!-- Actions -->
        <div class="flex items-center gap-2">
          <!-- Added user authentication status and login/logout buttons -->
          <!-- User Menu -->
          <div v-if="!authLoading" class="flex items-center gap-2">
            <div v-if="user" class="flex items-center gap-2">
              <span class="text-xs sm:text-sm text-[var(--color-text-secondary)] hidden sm:block">
                {{ isAdmin ? 'Administrateur' : (user.displayName || user.email) }}
              </span>
              <button
                @click="handleLogout"
                class="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-[var(--color-surface)] hover:bg-[var(--color-surface-dark)] text-[var(--color-text)] rounded-lg transition-colors"
              >
                Déconnexion
              </button>
            </div>
            <button
              v-else
              @click="openAuthModal"
              class="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-lg transition-colors"
            >
              Connexion
            </button>
          </div>

          <!-- Fixed dark mode toggle to work properly -->
          <button 
            @click="toggleDarkMode"
            class="p-1.5 sm:p-2 hover:bg-[var(--color-surface)] rounded-lg transition-colors"
            aria-label="Toggle dark mode"
          >
            <svg v-if="!isDarkMode" class="w-5 h-5 sm:w-6 sm:h-6 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            <svg v-else class="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </button>
          
          <slot name="actions"></slot>
        </div>
      </div>
    </div>

    <!-- Added AuthModal component -->
    <AuthModal :isOpen="showAuthModal" @close="showAuthModal = false" @success="handleAuthSuccess" />
  </nav>
</template>

<script>
import { useAuth } from '../composables/useAuth'
import AuthModal from './AuthModal.vue'

export default {
  name: 'Navbar',
  components: {
    AuthModal
  },
  setup() {
    const { user, loading: authLoading, logout, isAdmin } = useAuth()
    return { user, authLoading, logout, isAdmin }
  },
  data() {
    return {
      isDarkMode: false,
      showAuthModal: false
    }
  },
  computed: {
    pageTitle() {
      const titles = {
        '/': 'Découvrir les restaurants',
        '/favorites': 'Mes favoris',
        '/admin': 'Dashboard Admin'
      }
      return titles[this.$route.path] || 'RestauCity'
    }
  },
  mounted() {
    const savedTheme = localStorage.getItem('theme')
    this.isDarkMode = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
    this.applyTheme()
  },
  methods: {
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode
      localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light')
      this.applyTheme()
      
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'))
      }, 50)
    },
    applyTheme() {
      const root = document.documentElement
      if (this.isDarkMode) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    },
    openAuthModal() {
      this.showAuthModal = true
    },
    async handleLogout() {
      const result = await this.logout()
      if (result.success) {
        console.log('[v0] User logged out successfully')
      }
    },
    handleAuthSuccess() {
      console.log('[v0] User authenticated successfully')
    }
  }
}
</script>
