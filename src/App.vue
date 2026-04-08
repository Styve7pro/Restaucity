<template>
  <div
    id="app"
    class="min-h-screen bg-[var(--color-background)] flex flex-col"
  >
    <!-- Toast notifications globales -->
    <ToastContainer />

    <!-- Desktop Sidebar -->
    <aside
      v-if="!isMobile"
      class="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-900 border-r border-[var(--color-border)] z-40"
    >
      <div class="p-6">
        <router-link to="/" class="flex items-center gap-3 mb-8">
          <div class="w-10 h-10 bg-[var(--color-primary)] rounded-lg flex items-center justify-center">
            <span class="text-white text-xl font-bold">R</span>
          </div>
          <div>
            <h1 class="text-xl font-bold text-[var(--color-text)]">RestauCity</h1>
            <p class="text-xs text-[var(--color-text-secondary)]">Find it</p>
          </div>
        </router-link>

        <nav class="space-y-2">
          <router-link
            to="/"
            class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[var(--color-surface)] transition-colors text-[var(--color-text)]"
            :class="{ 'bg-[var(--color-surface)] text-[var(--color-primary)]': $route.path === '/' }"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span class="font-medium">Accueil</span>
          </router-link>

          <router-link
            to="/favorites"
            class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[var(--color-surface)] transition-colors text-[var(--color-text)]"
            :class="{ 'bg-[var(--color-surface)] text-[var(--color-primary)]': $route.path === '/favorites' }"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span class="font-medium">Favoris</span>
          </router-link>

          <router-link
            v-if="isAdmin"
            to="/admin"
            class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[var(--color-surface)] transition-colors text-[var(--color-text)]"
            :class="{ 'bg-[var(--color-surface)] text-[var(--color-primary)]': $route.path === '/admin' }"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span class="font-medium">Admin</span>
          </router-link>
        </nav>
      </div>
    </aside>

    <!-- Main Content -->
    <main
      :class="{ 'lg:ml-64': !isMobile, 'pb-20 lg:pb-0': isMobile }"
      class="flex-1"
    >
      <router-view />
    </main>

    <!-- Mobile Bottom Navigation -->
    <nav
      v-if="isMobile"
      class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-[var(--color-border)] z-50 safe-area-bottom"
    >
      <div class="flex items-center justify-around py-2">
        <router-link
          to="/"
          class="flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors"
          :class="$route.path === '/' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span class="text-xs font-medium">Accueil</span>
        </router-link>

        <router-link
          to="/favorites"
          class="flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors"
          :class="$route.path === '/favorites' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span class="text-xs font-medium">Favoris</span>
        </router-link>

        <router-link
          v-if="isAdmin"
          to="/admin"
          class="flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors"
          :class="$route.path === '/admin' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span class="text-xs font-medium">Admin</span>
        </router-link>
      </div>
    </nav>

    <!-- Footer -->
    <Footer v-if="!isMobile || $route.path !== '/admin'" />
  </div>
</template>

<script>
import { useAuth } from './composables/useAuth'
import Footer from './components/Footer.vue'
import ToastContainer from './components/ui/ToastContainer.vue'

export default {
  name: 'App',
  components: { Footer, ToastContainer },
  setup() {
    const { isAdmin } = useAuth()
    // Le thème est déjà initialisé dans main.js — pas besoin de le gérer ici
    return { isAdmin }
  },
  data() {
    return { isMobile: false }
  },
  mounted() {
    this.checkMobile()
    window.addEventListener('resize', this.checkMobile)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkMobile)
  },
  methods: {
    checkMobile() {
      this.isMobile = window.innerWidth < 1024
    },
  },
}
</script>
