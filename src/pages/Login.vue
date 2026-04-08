<template>
  <div class="min-h-screen bg-[var(--color-surface)] flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-[var(--color-primary)] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span class="text-white text-3xl font-bold">R</span>
        </div>
        <h1 class="text-2xl font-bold text-[var(--color-text)]">RestauCity Admin</h1>
        <p class="text-[var(--color-text-secondary)] mt-1">Connectez-vous pour gérer les restaurants</p>
      </div>

      <!-- Form -->
      <div class="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-800">
        <form @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-[var(--color-text)] mb-2">Email</label>
            <input
              v-model="email"
              type="email"
              required
              placeholder="admin@restaucity.com"
              class="w-full px-4 py-3 rounded-lg border border-[var(--color-border)] bg-white dark:bg-gray-800 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-20 transition-all"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-[var(--color-text)] mb-2">Mot de passe</label>
            <input
              v-model="password"
              type="password"
              required
              placeholder="••••••••"
              class="w-full px-4 py-3 rounded-lg border border-[var(--color-border)] bg-white dark:bg-gray-800 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-20 transition-all"
            />
          </div>

          <!-- Error -->
          <div v-if="error" class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p class="text-sm text-red-700 dark:text-red-400 font-medium">{{ getErrorMessage(error) }}</p>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg v-if="loading" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {{ loading ? 'Connexion...' : 'Se connecter' }}
          </button>
        </form>

        <div class="mt-6 text-center">
          <router-link to="/" class="text-sm text-[var(--color-primary)] hover:underline">
            ← Retour à l'accueil
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuth } from '../composables/useAuth'
import { useToast } from '../composables/useToast'

export default {
  name: 'Login',
  setup() {
    const { login } = useAuth()
    const toast = useToast()
    return { loginFn: login, toast }
  },
  data() {
    return { email: '', password: '', loading: false, error: '' }
  },
  methods: {
    async handleLogin() {
      this.loading = true
      this.error = ''
      try {
        const result = await this.loginFn(this.email, this.password)
        if (result.success) {
          const isAdmin = this.email.toLowerCase().includes('jesusinmiddlexstyve')
          if (isAdmin) {
            this.toast.success('Connexion admin réussie !')
            await this.$router.push('/admin')
          } else {
            this.error = 'access-denied'
            setTimeout(() => this.$router.replace('/'), 2000)
          }
        } else {
          this.error = result.error
        }
      } catch {
        this.error = 'unknown-error'
      } finally {
        this.loading = false
      }
    },
    getErrorMessage(code) {
      const map = {
        'auth/invalid-credential': 'Email ou mot de passe incorrect',
        'auth/user-not-found': 'Aucun compte trouvé avec cet email',
        'auth/wrong-password': 'Mot de passe incorrect',
        'auth/too-many-requests': 'Trop de tentatives. Réessayez plus tard',
        'access-denied': 'Accès refusé. Seuls les administrateurs peuvent accéder ici',
        'unknown-error': 'Une erreur est survenue. Veuillez réessayer',
      }
      return map[code] || map['unknown-error']
    },
  },
}
</script>
