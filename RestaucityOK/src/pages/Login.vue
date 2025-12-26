<template>
  <div class="min-h-screen bg-[var(--color-surface)] flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-[var(--color-primary)] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span class="text-white text-3xl font-bold">R</span>
        </div>
        <h1 class="text-2xl font-bold text-[var(--color-text)]">RestauCity Admin</h1>
        <p class="text-[var(--color-text-secondary)] mt-1">Connectez-vous pour gérer les restaurants</p>
      </div>

      <!-- Login Form -->
      <div class="bg-white rounded-xl shadow-[var(--shadow-lg)] p-8">
        <form @submit.prevent="handleLogin">
          <div class="mb-4">
            <label class="block text-sm font-medium text-[var(--color-text)] mb-2">Email</label>
            <input
              v-model="email"
              type="email"
              required
              placeholder="admin@restaucity.com"
              class="w-full px-4 py-3 rounded-lg border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-20 transition-all"
            />
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium text-[var(--color-text)] mb-2">Mot de passe</label>
            <input
              v-model="password"
              type="password"
              required
              placeholder="••••••••"
              class="w-full px-4 py-3 rounded-lg border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-20 transition-all"
            />
          </div>

          <!-- Error Message -->
          <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-700 font-medium">{{ getErrorMessage(error) }}</p>
            <!-- Show technical error details for debugging -->
            <p class="text-xs text-red-600 mt-1">Code: {{ error }}</p>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Connexion...' : 'Se connecter' }}
          </button>
        </form>

        <div class="mt-6 text-center">
          <router-link to="/" class="text-sm text-[var(--color-primary)] hover:underline">
            Retour à l'accueil
          </router-link>
        </div>
      </div>

      <!-- Info Box -->
      <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p class="text-sm text-blue-800">
          <strong>Important:</strong> Le compte doit être créé dans Firebase Authentication avec un mot de passe défini.
        </p>
        <p class="text-xs text-blue-700 mt-2">
          Si vous avez créé le compte manuellement, assurez-vous d'avoir défini un mot de passe via "Reset password" dans la console Firebase.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuth } from '../composables/useAuth'

export default {
  name: 'Login',
  setup() {
    const { login } = useAuth()
    return { loginWithFirebase: login }
  },
  data() {
    return {
      email: '',
      password: '',
      loading: false,
      error: ''
    }
  },
  methods: {
    async handleLogin() {
      this.loading = true
      this.error = ''
      
      console.log('[v0] Login attempt with email:', this.email)

      try {
        const result = await this.loginWithFirebase(this.email, this.password)
        
        console.log('[v0] Login result:', result)
        
        if (result.success) {
          // Check if email contains "admin" to determine access
          const isAdminEmail = this.email.toLowerCase().includes('admin')
          console.log('[v0] Is admin email:', isAdminEmail)
          
          if (isAdminEmail) {
            console.log('[v0] Redirecting to admin dashboard')
            await new Promise(resolve => setTimeout(resolve, 1000))
            console.log('[v0] Attempting router push to /admin')
            await this.$router.push('/admin')
            console.log('[v0] Router push completed')
          } else {
            this.error = 'access-denied'
            console.log('[v0] Access denied: not an admin email')
            setTimeout(() => {
              this.$router.replace('/')
            }, 2000)
          }
        } else {
          console.log('[v0] Login failed:', result.error)
          this.error = result.error
        }
      } catch (err) {
        this.error = 'unknown-error'
        console.error('[v0] Login error:', err)
      } finally {
        this.loading = false
      }
    },
    getErrorMessage(errorCode) {
      const errorMessages = {
        'auth/invalid-email': 'Adresse email invalide',
        'auth/user-disabled': 'Ce compte a été désactivé',
        'auth/user-not-found': 'Aucun compte trouvé avec cet email',
        'auth/wrong-password': 'Mot de passe incorrect',
        'auth/invalid-credential': 'Email ou mot de passe incorrect. Vérifiez que le mot de passe est bien défini dans Firebase.',
        'auth/too-many-requests': 'Trop de tentatives. Réessayez plus tard',
        'auth/network-request-failed': 'Erreur réseau. Vérifiez votre connexion',
        'auth/missing-password': 'Le mot de passe est requis',
        'access-denied': 'Accès refusé. Seuls les administrateurs peuvent se connecter ici',
        'unknown-error': 'Erreur de connexion. Veuillez réessayer'
      }
      return errorMessages[errorCode] || errorMessages['unknown-error']
    }
  }
}
</script>
