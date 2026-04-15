<template>
  <div id="app" class="min-h-screen bg-[var(--color-background)] flex flex-col">

    <!-- ── Loader global session ───────────────────────────────── -->
    <Transition name="loader-fade">
      <div
        v-if="loading && !isAuthRoute"
        class="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white dark:bg-gray-950"
      >
        <div class="w-16 h-16 bg-[var(--color-primary)] rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-orange-500/30">
          <span class="text-white text-2xl font-black">R</span>
        </div>
        <div class="flex items-center gap-1.5">
          <div class="w-2 h-2 bg-[var(--color-primary)] rounded-full animate-bounce" style="animation-delay:0ms"></div>
          <div class="w-2 h-2 bg-[var(--color-primary)] rounded-full animate-bounce" style="animation-delay:150ms"></div>
          <div class="w-2 h-2 bg-[var(--color-primary)] rounded-full animate-bounce" style="animation-delay:300ms"></div>
        </div>
        <p class="text-sm text-gray-400 dark:text-gray-600 mt-4">Vérification de la session…</p>
      </div>
    </Transition>

    <!-- Toasts -->
    <ToastContainer />

    <!-- Sidebar desktop (connecté + hors /auth) -->
    <aside
      v-if="!isMobile && isAuthenticated && !isAuthRoute"
      class="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-900 border-r border-[var(--color-border)] z-40 flex flex-col"
    >
      <div class="p-6 flex flex-col h-full">
        <!-- Logo -->
        <router-link to="/" class="flex items-center gap-3 mb-8">
          <div class="w-10 h-10 bg-[var(--color-primary)] rounded-lg flex items-center justify-center shadow-md shadow-orange-500/30">
            <span class="text-white text-xl font-bold">R</span>
          </div>
          <div>
            <h1 class="text-xl font-bold text-[var(--color-text)]">RestauCity</h1>
            <p class="text-xs text-[var(--color-text-secondary)]">Find it</p>
          </div>
        </router-link>

        <!-- Nav -->
        <nav class="space-y-1 flex-1">
          <router-link
            v-for="item in navItems" :key="item.to" :to="item.to"
            class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-[var(--color-text)] font-medium"
            :class="$route.path === item.to
              ? 'bg-orange-50 dark:bg-orange-900/20 text-[var(--color-primary)]'
              : 'hover:bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'"
          >
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon"/>
            </svg>
            {{ item.label }}
          </router-link>
        </nav>

        <!-- Theme toggle -->
        <button
          @click="toggleTheme"
          class="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-[var(--color-surface)] transition-colors text-[var(--color-text-secondary)] hover:text-[var(--color-text)] font-medium mb-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path v-if="isDark" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
          </svg>
          {{ isDark ? 'Mode clair' : 'Mode sombre' }}
        </button>

        <!-- Séparateur -->
        <div class="border-t border-[var(--color-border)] pt-4">
          <!-- Avatar + nom -->
          <div class="flex items-center gap-3 px-3 py-2 mb-1">
            <div class="w-9 h-9 rounded-full bg-[var(--color-primary)] flex items-center justify-center flex-shrink-0 overflow-hidden ring-2 ring-orange-200 dark:ring-orange-800">
              <img v-if="avatarUrl" :src="avatarUrl" :alt="displayName" class="w-full h-full object-cover" />
              <span v-else class="text-white text-sm font-bold">{{ displayName.charAt(0).toUpperCase() }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-[var(--color-text)] truncate">{{ displayName }}</p>
              <p class="text-xs text-[var(--color-text-secondary)] truncate">{{ user?.email }}</p>
            </div>
          </div>
          <button
            @click="handleLogout"
            class="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors text-sm font-medium"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            Déconnexion
          </button>
        </div>
      </div>
    </aside>

    <!-- Main content -->
    <main
      :class="{
        'lg:ml-64': !isMobile && isAuthenticated && !isAuthRoute,
        'pb-20': isMobile && isAuthenticated && !isAuthRoute,
      }"
      class="flex-1"
    >
      <router-view />
    </main>

    <!-- Bottom nav mobile -->
    <nav
      v-if="isMobile && isAuthenticated && !isAuthRoute"
      class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-[var(--color-border)] z-50"
      style="padding-bottom: env(safe-area-inset-bottom, 0)"
    >
      <div class="flex items-center justify-around py-1">
        <router-link
          v-for="item in navItems" :key="item.to" :to="item.to"
          class="flex flex-col items-center gap-0.5 px-4 py-2 rounded-lg transition-colors"
          :class="$route.path === item.to ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon"/>
          </svg>
          <span class="text-xs font-medium">{{ item.label }}</span>
        </router-link>
        <!-- Theme toggle mobile -->
        <button
          @click="toggleTheme"
          class="flex flex-col items-center gap-0.5 px-4 py-2 text-[var(--color-text-secondary)]"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path v-if="isDark" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
          </svg>
          <span class="text-xs font-medium">Thème</span>
        </button>
      </div>
    </nav>

    <Footer v-if="isAuthenticated && !isAuthRoute && (!isMobile || $route.path !== '/admin')" />
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from './composables/useAuth'
import { useTheme } from './composables/useTheme'
import { useToast } from './composables/useToast'
import Footer from './components/Footer.vue'
import ToastContainer from './components/ui/ToastContainer.vue'

export default {
  name: 'App',
  components: { Footer, ToastContainer },
  setup() {
    const { user, loading, isAuthenticated, isAdmin, displayName, avatarUrl, logout } = useAuth()
    const { isDark, toggleTheme } = useTheme()
    const toast  = useToast()
    const route  = useRoute()
    const router = useRouter()
    const isAuthRoute = computed(() => route.path.startsWith('/auth'))
    return { user, loading, isAuthenticated, isAdmin, displayName, avatarUrl, logout, isDark, toggleTheme, toast, isAuthRoute, route, router }
  },
  data() {
    return { isMobile: false }
  },
  computed: {
    navItems() {
      const items = [
        { to: '/', label: 'Accueil', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { to: '/favorites', label: 'Favoris', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
      ]
      if (this.isAdmin) {
        items.push({ to: '/admin', label: 'Admin', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' })
      }
      return items
    },
  },
  mounted() {
    this.checkMobile()
    window.addEventListener('resize', this.checkMobile)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkMobile)
  },
  methods: {
    checkMobile() { this.isMobile = window.innerWidth < 1024 },
    async handleLogout() {
      await this.logout()
      this.toast.success('Déconnexion réussie')
      this.router.push('/auth')
    },
  },
}
</script>

<style scoped>
.loader-fade-enter-active { transition: opacity 0.25s; }
.loader-fade-leave-active { transition: opacity 0.4s ease 0.15s; }
.loader-fade-enter-from, .loader-fade-leave-to { opacity: 0; }
</style>
