<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
    <div class="text-center p-8">
      <div v-if="status === 'loading'">
        <div class="w-16 h-16 bg-[var(--color-primary)] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-orange-500/30">
          <span class="text-white text-2xl font-black">R</span>
        </div>
        <div class="flex items-center justify-center gap-2 mb-3">
          <div class="w-2 h-2 bg-[var(--color-primary)] rounded-full animate-bounce" style="animation-delay:0ms"></div>
          <div class="w-2 h-2 bg-[var(--color-primary)] rounded-full animate-bounce" style="animation-delay:150ms"></div>
          <div class="w-2 h-2 bg-[var(--color-primary)] rounded-full animate-bounce" style="animation-delay:300ms"></div>
        </div>
        <p class="text-gray-600 dark:text-gray-400 font-medium">Connexion en cours…</p>
        <p class="text-sm text-gray-400 dark:text-gray-600 mt-1">Vous allez être redirigé automatiquement.</p>
      </div>

      <div v-else-if="status === 'success'">
        <div class="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <p class="text-gray-900 dark:text-white font-bold text-lg mb-1">Connexion réussie !</p>
        <p class="text-gray-500 dark:text-gray-400 text-sm">Bienvenue sur RestauCity 👋</p>
      </div>

      <div v-else-if="status === 'error'">
        <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <p class="text-gray-900 dark:text-white font-bold text-lg mb-1">Échec de la connexion</p>
        <p class="text-red-500 text-sm mb-4">{{ errorMessage }}</p>
        <button @click="$router.push('/auth')" class="px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-xl font-semibold hover:bg-[var(--color-primary-dark)] transition-colors">
          Retour à la connexion
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuth } from '../composables/useAuth'

export default {
  name: 'AuthCallback',
  setup() {
    const { user, authReady } = useAuth()
    return { user, authReady }
  },
  data() {
    return {
      status: 'loading',
      errorMessage: '',
    }
  },
  mounted() {
    this.handleCallback()
  },
  methods: {
    async handleCallback() {
      // Vérifier si l'URL contient une erreur OAuth
      const params = new URLSearchParams(window.location.hash.replace('#', '?'))
      const searchParams = new URLSearchParams(window.location.search)

      const errorParam = params.get('error') || searchParams.get('error')
      const errorDesc  = params.get('error_description') || searchParams.get('error_description')

      if (errorParam) {
        this.status = 'error'
        this.errorMessage = this.mapOAuthError(errorDesc || errorParam)
        return
      }

      // Attendre que Supabase traite le token de l'URL
      // onAuthStateChange dans useAuth s'en occupe automatiquement
      let attempts = 0
      const check = setInterval(() => {
        attempts++
        if (this.authReady && this.user) {
          clearInterval(check)
          this.status = 'success'
          setTimeout(() => {
            const redirect = new URLSearchParams(window.location.search).get('redirect') || '/'
            this.$router.replace(redirect)
          }, 1000)
        } else if (attempts > 20) {
          // Timeout après ~5 secondes
          clearInterval(check)
          if (!this.user) {
            this.status = 'error'
            this.errorMessage = 'Timeout lors de la vérification de session.'
          }
        }
      }, 250)
    },

    mapOAuthError(msg = '') {
      if (msg.includes('access_denied')) return 'Accès refusé par le fournisseur.'
      if (msg.includes('server_error')) return 'Erreur du serveur OAuth.'
      return msg || 'Erreur de connexion OAuth.'
    },
  },
}
</script>
