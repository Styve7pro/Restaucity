// src/main.js
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './style.css'

// ── Thème avant mount (anti-flash) ─────────────────────────────────────────
import { useTheme } from './composables/useTheme'
useTheme().initTheme()

// ── Pages (lazy-loaded pour perf) ─────────────────────────────────────────
const Home             = () => import('./pages/Home.vue')
const RestaurantDetail = () => import('./pages/RestaurantDetail.vue')
const Favorites        = () => import('./pages/Favorites.vue')
const AdminDashboard   = () => import('./pages/AdminDashboard.vue')
const AuthPage         = () => import('./pages/AuthPage.vue')
const AuthCallback     = () => import('./pages/AuthCallback.vue')

import { supabase } from './config/supabaseConfig'

// ── Routes ─────────────────────────────────────────────────────────────────
const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(to, from, saved) {
    if (saved) return saved
    return { top: 0, behavior: 'smooth' }
  },
  routes: [
    // Routes protégées (connexion obligatoire)
    {
      path: '/',
      name: 'Home',
      component: Home,
      meta: { requiresAuth: true },
    },
    {
      path: '/restaurant/:id',
      name: 'RestaurantDetail',
      component: RestaurantDetail,
      meta: { requiresAuth: true },
    },
    {
      path: '/favorites',
      name: 'Favorites',
      component: Favorites,
      meta: { requiresAuth: true },
    },
    {
      path: '/admin',
      name: 'AdminDashboard',
      component: AdminDashboard,
      meta: { requiresAuth: true, requiresAdmin: true },
    },

    // Routes publiques
    {
      path: '/auth',
      name: 'Auth',
      component: AuthPage,
      meta: { public: true, redirectIfAuth: true },
    },
    {
      path: '/auth/callback',
      name: 'AuthCallback',
      component: AuthCallback,
      meta: { public: true },
    },

    // Catch-all
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

// ── Navigation Guard global ─────────────────────────────────────────────────
// On vérifie la session Supabase UNE seule fois et on la met en cache
let sessionCache = undefined

router.beforeEach(async (to, from, next) => {

  // Route publique sans aucune règle → laisser passer
  if (to.meta.public && !to.meta.redirectIfAuth) return next()

  // Récupérer la session (cache pour éviter les appels répétés)
  if (sessionCache === undefined) {
    try {
      const { data } = await supabase.auth.getSession()
      sessionCache = data.session
    } catch {
      sessionCache = null
    }
  }

  const user = sessionCache?.user ?? null

  // Invalider le cache à chaque changement de session
  supabase.auth.onAuthStateChange((_, session) => {
    sessionCache = session
  })

  // Si connecté et tente d'accéder à /auth → rediriger vers accueil
  if (to.meta.redirectIfAuth && user) return next('/')

  // Route protégée + non connecté → page auth
  if (to.meta.requiresAuth && !user) {
    return next({ name: 'Auth', query: { redirect: to.fullPath } })
  }

  // Route admin + non admin → accueil
  if (to.meta.requiresAdmin && user) {
    const isAdmin = user.email?.toLowerCase().includes('jesusinmiddlexstyve')
    if (!isAdmin) return next('/')
  }

  next()
})

// ── App ─────────────────────────────────────────────────────────────────────
const app = createApp(App)
app.use(router)
app.mount('#app')
