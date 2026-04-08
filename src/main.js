// src/main.js
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './style.css'

// ── Initialiser le thème AVANT createApp pour éviter le flash ──────────────
import { useTheme } from './composables/useTheme'
const { initTheme } = useTheme()
initTheme()

// ── Pages ──────────────────────────────────────────────────────────────────
import Home from './pages/Home.vue'
import RestaurantDetail from './pages/RestaurantDetail.vue'
import Favorites from './pages/Favorites.vue'
import AdminDashboard from './pages/AdminDashboard.vue'
import Login from './pages/Login.vue'

import { supabase } from './config/supabaseConfig'

// ── Router ─────────────────────────────────────────────────────────────────
const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0, behavior: 'smooth' }
  },
  routes: [
    { path: '/', name: 'Home', component: Home },
    { path: '/restaurant/:id', name: 'RestaurantDetail', component: RestaurantDetail },
    { path: '/favorites', name: 'Favorites', component: Favorites },
    {
      path: '/admin',
      name: 'AdminDashboard',
      component: AdminDashboard,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    { path: '/login', name: 'Login', component: Login },
    // Catch-all → redirect accueil
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

// ── Navigation guard ───────────────────────────────────────────────────────
router.beforeEach(async (to, from, next) => {
  if (!to.meta.requiresAuth) return next()

  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  if (!user) {
    console.log('[Router] Non authentifié, redirection accueil')
    return next('/')
  }

  if (to.meta.requiresAdmin) {
    const isAdmin = user.email?.toLowerCase().includes('jesusinmiddlexstyve')
    if (!isAdmin) {
      console.log('[Router] Pas admin, redirection accueil')
      return next('/')
    }
  }

  next()
})

// ── App ────────────────────────────────────────────────────────────────────
const app = createApp(App)
app.use(router)
app.mount('#app')
