<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
    <div class="text-center p-8 max-w-sm w-full">

      <!-- Loading -->
      <Transition name="fade" mode="out-in">
        <div v-if="status === 'loading'" key="loading">
          <div class="w-16 h-16 bg-[var(--color-primary)] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-orange-500/30">
            <span class="text-white text-2xl font-black">R</span>
          </div>
          <div class="flex items-center justify-center gap-1.5 mb-3">
            <div v-for="i in 3" :key="i"
              class="w-2 h-2 bg-[var(--color-primary)] rounded-full animate-bounce"
              :style="`animation-delay:${(i-1)*150}ms`"
            ></div>
          </div>
          <p class="text-gray-700 dark:text-gray-300 font-semibold">Connexion en cours…</p>
          <p class="text-sm text-gray-400 mt-1">Redirection automatique dans un instant.</p>
        </div>

        <!-- Succès -->
        <div v-else-if="status === 'success'" key="success">
          <div class="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <p class="text-lg font-bold text-gray-900 dark:text-white mb-1">Connexion réussie !</p>
          <p class="text-gray-500 dark:text-gray-400 text-sm">Bienvenue sur RestauCity 👋</p>
        </div>

        <!-- Erreur -->
        <div v-else-if="status === 'error'" key="error">
          <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <p class="text-lg font-bold text-gray-900 dark:text-white mb-1">Échec de la connexion</p>
          <p class="text-red-500 text-sm mb-5">{{ errorMessage }}</p>
          <button
            @click="$router.replace('/auth')"
            class="px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            ← Retour à la connexion
          </button>
        </div>
      </Transition>

    </div>
  </div>
</template>

<script>
import { supabase } from '../config/supabaseConfig.js'

export default {
  name: 'AuthCallback',
  data() {
    return {
      status: 'loading',
      errorMessage: '',
    }
  },
  async mounted() {
    await this.handleCallback()
  },
  methods: {
    async handleCallback() {
      try {
        // ── 1. Vérifier erreurs OAuth dans l'URL ─────────────────────────
        // Les erreurs peuvent être dans le hash (#error=...) ou la query (?error=...)
        const hash   = new URLSearchParams(window.location.hash.slice(1))
        const query  = new URLSearchParams(window.location.search)
        const error  = hash.get('error')  || query.get('error')
        const desc   = hash.get('error_description') || query.get('error_description')

        if (error) {
          this.status       = 'error'
          this.errorMessage = this.translateOAuthError(error, desc)
          return
        }

        // ── 2. Laisser Supabase traiter le token dans l'URL ───────────────
        // Supabase JS détecte automatiquement le hash #access_token=... ou
        // le code PKCE ?code=... et échange le token.
        // On attend que onAuthStateChange confirme la session.
        const session = await this.waitForSession(8000) // timeout 8s

        if (session) {
          this.status = 'success'
          // Nettoyer l'URL (retirer le hash/token) puis rediriger
          const redirect = query.get('redirect') || '/'
          setTimeout(() => {
            this.$router.replace(redirect)
          }, 900)
        } else {
          throw new Error('Session introuvable après connexion OAuth.')
        }

      } catch (err) {
        this.status       = 'error'
        this.errorMessage = err.message || 'Une erreur inattendue est survenue.'
      }
    },

    /**
     * Attend qu'une session Supabase soit disponible (polling + event).
     * Résout dès que la session est là, rejette après timeout ms.
     */
    waitForSession(timeoutMs = 8000) {
      return new Promise((resolve) => {
        // Vérifier si la session est déjà là
        supabase.auth.getSession().then(({ data }) => {
          if (data.session) return resolve(data.session)
        })

        // Sinon écouter onAuthStateChange
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (session) {
            subscription.unsubscribe()
            resolve(session)
          }
        })

        // Timeout de sécurité
        setTimeout(() => {
          subscription.unsubscribe()
          resolve(null) // null = pas de session → affiche l'erreur
        }, timeoutMs)
      })
    },

    translateOAuthError(error, desc = '') {
      const e = (error + desc).toLowerCase()
      if (e.includes('access_denied'))    return 'Accès refusé par Google.'
      if (e.includes('server_error'))     return 'Erreur serveur OAuth. Réessayez.'
      if (e.includes('temporarily'))      return 'Service temporairement indisponible.'
      if (e.includes('redirect_uri'))     return 'URL de redirection non autorisée (config Supabase).'
      return desc || error || 'Erreur de connexion OAuth.'
    },
  },
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.fade-enter-from { opacity: 0; transform: scale(0.95); }
.fade-leave-to   { opacity: 0; transform: scale(1.05); }
</style>
