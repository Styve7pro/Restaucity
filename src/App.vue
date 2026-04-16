<template>
  <div id="app" class="min-h-screen bg-[var(--color-background)] flex flex-col">

    <!-- ── Splash loader ─────────────────────────────────────────────────── -->
    <Transition name="loader-fade">
      <div
        v-if="loading && !isAuthRoute"
        class="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white dark:bg-gray-950"
      >
        <div class="w-16 h-16 bg-[var(--color-primary)] rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-orange-500/30">
          <span class="text-white text-2xl font-black">R</span>
        </div>
        <div class="flex items-center gap-1.5">
          <div v-for="i in 3" :key="i"
            class="w-2 h-2 bg-[var(--color-primary)] rounded-full animate-bounce"
            :style="`animation-delay:${(i-1)*150}ms`"
          ></div>
        </div>
        <p class="text-sm text-gray-400 dark:text-gray-600 mt-4">Chargement…</p>
      </div>
    </Transition>

    <!-- ── Toast system ──────────────────────────────────────────────────── -->
    <ToastContainer />

    <!-- ── Notification toasts flottants (Realtime) ──────────────────────── -->
    <NotificationToasts v-if="isAuthenticated && !isAuthRoute" />

    <!-- ══════════════════════════════════════════════════════════════════════
         SIDEBAR DESKTOP
    ═══════════════════════════════════════════════════════════════════════ -->
    <aside
      v-if="!isMobile && isAuthenticated && !isAuthRoute"
      class="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-900 border-r border-[var(--color-border)] z-40 flex flex-col"
    >
      <div class="p-5 flex flex-col h-full overflow-y-auto">

        <!-- Logo -->
        <router-link to="/" class="flex items-center gap-3 mb-8 flex-shrink-0">
          <div class="w-10 h-10 bg-[var(--color-primary)] rounded-xl flex items-center justify-center shadow-md shadow-orange-500/30">
            <span class="text-white text-xl font-bold">R</span>
          </div>
          <div>
            <h1 class="text-lg font-black text-[var(--color-text)] leading-tight">RestauCity</h1>
            <p class="text-xs text-[var(--color-text-secondary)]">Congo-Brazzaville</p>
          </div>
        </router-link>

        <!-- Nav principale -->
        <nav class="space-y-0.5 flex-1">
          <router-link
            v-for="item in navItems" :key="item.to" :to="item.to"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-medium text-sm relative"
            :class="isActive(item.to)
              ? 'bg-orange-50 dark:bg-orange-900/20 text-[var(--color-primary)]'
              : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]'"
          >
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon"/>
            </svg>
            <span>{{ item.label }}</span>
            <!-- Badge non lus (notifications uniquement) -->
            <span
              v-if="item.badge && unreadCount > 0"
              class="ml-auto text-xs font-bold bg-[var(--color-primary)] text-white rounded-full min-w-[1.1rem] h-[1.1rem] flex items-center justify-center px-1"
            >
              {{ unreadCount > 99 ? '99+' : unreadCount }}
            </span>
          </router-link>
        </nav>

        <!-- Thème (desktop uniquement) -->
        <button @click="toggleTheme"
          class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-[var(--color-surface)] transition-colors text-[var(--color-text-secondary)] hover:text-[var(--color-text)] text-sm font-medium mb-1"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path v-if="isDark" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
          </svg>
          {{ isDark ? 'Mode clair' : 'Mode sombre' }}
        </button>

        <!-- Profil + déconnexion (desktop) -->
        <div class="border-t border-[var(--color-border)] pt-4 flex-shrink-0">
          <div class="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1">
            <div class="w-9 h-9 rounded-full bg-[var(--color-primary)] flex items-center justify-center flex-shrink-0 overflow-hidden ring-2 ring-orange-200 dark:ring-orange-800">
              <img v-if="avatarUrl" :src="avatarUrl" :alt="displayName" class="w-full h-full object-cover" />
              <span v-else class="text-white text-sm font-bold select-none">{{ displayName.charAt(0).toUpperCase() }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-[var(--color-text)] truncate">{{ displayName }}</p>
              <p class="text-xs" :class="isAdmin ? 'text-[var(--color-primary)] font-medium' : 'text-[var(--color-text-secondary)]'">
                {{ isAdmin ? 'Administrateur' : 'Membre' }}
              </p>
            </div>
          </div>
          <!-- Déconnexion desktop -->
          <button @click="handleLogout"
            class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors text-sm font-medium"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            Déconnexion
          </button>
        </div>
      </div>
    </aside>

    <!-- ── Main ──────────────────────────────────────────────────────────── -->
    <main
      :class="{
        'lg:ml-64': !isMobile && isAuthenticated && !isAuthRoute,
        'pb-20':    isMobile  && isAuthenticated && !isAuthRoute,
      }"
      class="flex-1 min-w-0"
    >
      <router-view />
    </main>

    <!-- ══════════════════════════════════════════════════════════════════════
         BOTTOM NAV MOBILE
         → Sans thème, sans déconnexion, avec Notifications + badge
    ═══════════════════════════════════════════════════════════════════════ -->
    <nav
      v-if="isMobile && isAuthenticated && !isAuthRoute"
      class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-[var(--color-border)] z-50"
      style="padding-bottom: env(safe-area-inset-bottom, 0px)"
    >
      <div class="flex items-stretch">
        <router-link
          v-for="item in navItems" :key="item.to" :to="item.to"
          class="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors relative"
          :class="isActive(item.to)
            ? 'text-[var(--color-primary)]'
            : 'text-[var(--color-text-secondary)]'"
        >
          <!-- Icône + badge -->
          <div class="relative">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon"/>
            </svg>
            <!-- Badge notifications -->
            <span
              v-if="item.badge && unreadCount > 0"
              class="absolute -top-1.5 -right-2 text-[.6rem] font-black bg-[var(--color-primary)] text-white rounded-full min-w-[1rem] h-4 flex items-center justify-center px-0.5 leading-none shadow"
            >
              {{ unreadCount > 9 ? '9+' : unreadCount }}
            </span>
          </div>
          <span class="text-[.68rem] font-medium leading-none mt-0.5">{{ item.label }}</span>
        </router-link>
      </div>
    </nav>

    <Footer v-if="isAuthenticated && !isAuthRoute && (!isMobile || $route.path !== '/admin')" />
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from './composables/useAuth.js'
import { useTheme } from './composables/useTheme.js'
import { useToast } from './composables/useToast.js'
import { useNotifications } from './composables/useNotifications.js'
import Footer from './components/Footer.vue'
import ToastContainer from './components/ui/ToastContainer.vue'
import NotificationToasts from './components/NotificationToasts.vue'

export default {
  name: 'App',
  components: { Footer, ToastContainer, NotificationToasts },

  setup() {
    const { user, loading, isAuthenticated, isAdmin, displayName, avatarUrl, logout } = useAuth()
    const { isDark, toggleTheme } = useTheme()
    const toast = useToast()
    const route = useRoute()
    const router = useRouter()
    const { subscribe, unsubscribe, unreadCount } = useNotifications()
    const isAuthRoute = computed(() => route.path.startsWith('/auth'))

    return {
      user, loading, isAuthenticated, isAdmin, displayName, avatarUrl, logout,
      isDark, toggleTheme,
      toast, route, router, isAuthRoute,
      subscribe, unsubscribe, unreadCount,
    }
  },

  data() {
    return { isMobile: false }
  },

  computed: {
    navItems() {
      const items = [
        {
          to: '/', label: 'Accueil',
          icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
        },
        {
          to: '/favorites', label: 'Favoris',
          icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
        },
        {
          to: '/notifications', label: 'Notifs', badge: true,
          icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
        },
      ]
      if (this.isAdmin) {
        items.push({
          to: '/admin', label: 'Admin',
          icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
        })
      }
      return items
    },
  },

  mounted() {
    this.checkMobile()
    window.addEventListener('resize', this.checkMobile)
    if (this.isAuthenticated) this.subscribe()
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.checkMobile)
    this.unsubscribe()
  },

  watch: {
    isAuthenticated(val) {
      if (val) this.subscribe()
      else this.unsubscribe()
    },
  },

  methods: {
    checkMobile() { this.isMobile = window.innerWidth < 1024 },
    isActive(path) { return this.$route.path === path },
    async handleLogout() {
      await this.logout()
      this.unsubscribe()
      this.toast.success('Déconnexion réussie')
      this.router.push('/auth')
    },
  },
}
</script>

<style scoped>
.loader-fade-enter-active { transition: opacity .25s; }
.loader-fade-leave-active { transition: opacity .4s ease .1s; }
.loader-fade-enter-from, .loader-fade-leave-to { opacity: 0; }
</style>
