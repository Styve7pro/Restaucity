// src/main.js
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './style.css'

// ── Thème avant mount (anti-flash) ────────────────────────────────────────
import { useTheme } from './composables/useTheme'
useTheme().initTheme()

// ── Pages lazy-loaded ─────────────────────────────────────────────────────
const Home             = () => import('./pages/Home.vue')
const RestaurantDetail = () => import('./pages/RestaurantDetail.vue')
const Favorites        = () => import('./pages/Favorites.vue')
const Notifications    = () => import('./pages/Notifications.vue')
const AdminDashboard   = () => import('./pages/AdminDashboard.vue')
const AuthPage         = () => import('./pages/AuthPage.vue')
const AuthCallback     = () => import('./pages/AuthCallback.vue')

import { supabase } from './config/supabaseConfig'

// ── Routes ────────────────────────────────────────────────────────────────
const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(to, from, saved) {
    if (saved) return saved
    return { top: 0, behavior: 'smooth' }
  },
  routes: [
    // ── Protégées ──────────────────────────────────────────────────────────
    { path: '/',               name: 'Home',           component: Home,           meta: { requiresAuth: true } },
    { path: '/restaurant/:id', name: 'RestaurantDetail', component: RestaurantDetail, meta: { requiresAuth: true } },
    { path: '/favorites',      name: 'Favorites',      component: Favorites,      meta: { requiresAuth: true } },
    { path: '/notifications',  name: 'Notifications',  component: Notifications,  meta: { requiresAuth: true } },
    { path: '/admin',          name: 'AdminDashboard', component: AdminDashboard, meta: { requiresAuth: true, requiresAdmin: true } },

    // ── Publiques ──────────────────────────────────────────────────────────
    { path: '/auth',          name: 'Auth',         component: AuthPage,     meta: { public: true, redirectIfAuth: true } },
    { path: '/auth/callback', name: 'AuthCallback', component: AuthCallback, meta: { public: true } },

    // ── Catch-all ──────────────────────────────────────────────────────────
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

// ── Guard global ──────────────────────────────────────────────────────────
let sessionCache = undefined

router.beforeEach(async (to, from, next) => {
  if (to.meta.public && !to.meta.redirectIfAuth) return next()

  if (sessionCache === undefined) {
    try {
      const { data } = await supabase.auth.getSession()
      sessionCache = data.session
    } catch {
      sessionCache = null
    }
  }

  const user = sessionCache?.user ?? null

  // Invalide le cache à chaque changement de session
  supabase.auth.onAuthStateChange((_, session) => {
    sessionCache = session
  })

  if (to.meta.redirectIfAuth && user) return next('/')
  if (to.meta.requiresAuth && !user) return next({ name: 'Auth', query: { redirect: to.fullPath } })
  if (to.meta.requiresAdmin && user) {
    if (!user.email?.toLowerCase().includes('jesusinmiddlexstyve')) return next('/')
  }

  next()
})

// ── App ───────────────────────────────────────────────────────────────────
const app = createApp(App)
app.use(router)
app.mount('#app')
