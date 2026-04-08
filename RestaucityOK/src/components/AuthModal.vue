<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
    <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-8 overflow-hidden">
      <!-- Close Button -->
      <button @click="close" class="absolute top-4 right-4 p-2 hover:bg-[var(--color-surface)] rounded-lg transition-colors">
        <svg class="w-5 h-5 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Title -->
      <h2 class="text-2xl font-bold text-[var(--color-text)] mb-6">
        {{ showOTPVerification ? 'Vérification Email' : (isLogin ? 'Connexion' : 'Inscription') }}
      </h2>

      <!-- Success Message for Email Sent -->
      <div v-if="successMessage" class="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <p class="text-sm text-green-600 dark:text-green-400">{{ successMessage }}</p>
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p class="text-sm text-red-600 dark:text-red-400">{{ errorMessage }}</p>
      </div>

      <!-- OTP Verification Form -->
      <form v-if="showOTPVerification" @submit.prevent="handleOTPVerification" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-[var(--color-text)] mb-2">Code de vérification</label>
          <input
            v-model="otpCode"
            type="text"
            required
            maxlength="6"
            class="w-full px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--color-text)] text-center text-2xl tracking-widest"
            placeholder="000000"
          />
          <p class="text-xs text-[var(--color-text-secondary)] mt-2">
            Entrez le code à 6 chiffres envoyé à {{ email }}
          </p>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Vérification...' : 'Vérifier' }}
        </button>

        <button
          type="button"
          @click="handleResendOTP"
          :disabled="loading"
          class="w-full px-6 py-3 bg-[var(--color-surface)] text-[var(--color-text)] rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Renvoyer le code
        </button>
      </form>

      <!-- Regular Login/Register Form -->
      <form v-else @submit.prevent="handleSubmit" class="space-y-4 overflow-y-auto max-h-[90vh]">
        <!-- Display Name (only for registration) -->
        <div v-if="!isLogin">
          <label class="block text-sm font-medium text-[var(--color-text)] mb-2">Nom complet</label>
          <input
            v-model="displayName"
            type="text"
            required
            class="w-full px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--color-text)]"
            placeholder="Jean Dupont"
          />
        </div>

        <!-- Email -->
        <div>
          <label class="block text-sm font-medium text-[var(--color-text)] mb-2">Email</label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--color-text)]"
            placeholder="exemple@email.com"
          />
        </div>

        <!-- Password -->
        <div>
          <label class="block text-sm font-medium text-[var(--color-text)] mb-2">Mot de passe</label>
          <input
            v-model="password"
            type="password"
            required
            :minlength="isLogin ? 1 : 6"
            class="w-full px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--color-text)]"
            :placeholder="isLogin ? 'Votre mot de passe' : 'Minimum 6 caractères'"
          />
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="loading"
          class="w-full px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Chargement...' : (isLogin ? 'Se connecter' : "S'inscrire") }}
        </button>
      </form>

      <!-- Toggle Login/Register -->
      <div v-if="!showOTPVerification" class="mt-4 text-center">
        <button @click="toggleMode" class="text-sm text-[var(--color-primary)] hover:underline">
          {{ isLogin ? "Pas encore de compte ? S'inscrire" : 'Déjà un compte ? Se connecter' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuth } from '../composables/useAuth'

export default {
  name: 'AuthModal',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'success'],
  setup() {
    const { login, register, verifyOTP, resendOTP } = useAuth()
    return { login, register, verifyOTP, resendOTP }
  },
  data() {
    return {
      isLogin: true,
      email: '',
      password: '',
      displayName: '',
      loading: false,
      errorMessage: '',
      showOTPVerification: false,
      otpCode: '',
      successMessage: ''
    }
  },
  methods: {
    close() {
      this.$emit('close')
      this.resetForm()
    },
    toggleMode() {
      this.isLogin = !this.isLogin
      this.errorMessage = ''
      this.successMessage = ''
    },
    resetForm() {
      this.email = ''
      this.password = ''
      this.displayName = ''
      this.errorMessage = ''
      this.successMessage = ''
      this.loading = false
      this.showOTPVerification = false
      this.otpCode = ''
    },
    async handleSubmit() {
      this.loading = true
      this.errorMessage = ''
      this.successMessage = ''

      try {
        let result
        if (this.isLogin) {
          result = await this.login(this.email, this.password)
          
          if (result.success) {
            this.$emit('success')
            this.close()
          } else {
            this.errorMessage = this.getErrorMessage(result.error)
          }
        } else {
          if (!this.displayName.trim()) {
            this.errorMessage = 'Veuillez entrer votre nom complet'
            this.loading = false
            return
          }
          
          result = await this.register(this.email, this.password, this.displayName)
          
          if (result.success && result.requiresEmailConfirmation) {
            this.successMessage = result.message
            this.showOTPVerification = true
          } else if (result.success) {
            this.$emit('success')
            this.close()
          } else {
            this.errorMessage = this.getErrorMessage(result.error)
          }
        }
      } catch (error) {
        this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.'
      } finally {
        this.loading = false
      }
    },
    async handleOTPVerification() {
      this.loading = true
      this.errorMessage = ''

      try {
        const result = await this.verifyOTP(this.email, this.otpCode)
        
        if (result.success) {
          this.successMessage = 'Email vérifié avec succès !'
          setTimeout(() => {
            this.$emit('success')
            this.close()
          }, 1500)
        } else {
          this.errorMessage = 'Code de vérification invalide'
        }
      } catch (error) {
        this.errorMessage = 'Une erreur est survenue lors de la vérification'
      } finally {
        this.loading = false
      }
    },
    async handleResendOTP() {
      this.loading = true
      this.errorMessage = ''
      this.successMessage = ''

      try {
        const result = await this.resendOTP(this.email)
        
        if (result.success) {
          this.successMessage = result.message
        } else {
          this.errorMessage = 'Erreur lors du renvoi du code'
        }
      } catch (error) {
        this.errorMessage = 'Une erreur est survenue'
      } finally {
        this.loading = false
      }
    },
    getErrorMessage(error) {
      const errorMessages = {
        'auth/email-already-in-use': 'Cet email est déjà utilisé',
        'auth/invalid-email': 'Email invalide',
        'auth/weak-password': 'Le mot de passe doit contenir au moins 6 caractères',
        'auth/user-not-found': 'Aucun compte trouvé avec cet email',
        'auth/wrong-password': 'Email ou mot de passe incorrect',
        'auth/invalid-credential': 'Email ou mot de passe incorrect',
        'auth/too-many-requests': 'Trop de tentatives. Réessayez plus tard'
      }
      
      for (const [key, message] of Object.entries(errorMessages)) {
        if (error && error.includes(key)) return message
      }
      
      return 'Une erreur est survenue. Veuillez réessayer.'
    }
  }
}
</script>
