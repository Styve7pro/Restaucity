<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        @click.self="close"
      >
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
        >
          <div
            v-if="isOpen"
            class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-8 relative max-h-[90vh] overflow-y-auto"
          >
            <!-- Close -->
            <button
              @click="close"
              class="absolute top-4 right-4 p-2 hover:bg-[var(--color-surface)] rounded-lg transition-colors"
            >
              <svg class="w-5 h-5 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <!-- Titre -->
            <h2 class="text-2xl font-bold text-[var(--color-text)] mb-6">
              {{ showOTPVerification ? 'Vérification Email' : (isLogin ? 'Connexion' : 'Inscription') }}
            </h2>

            <!-- Messages -->
            <div v-if="successMessage" class="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p class="text-sm text-green-600 dark:text-green-400">{{ successMessage }}</p>
            </div>
            <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p class="text-sm text-red-600 dark:text-red-400">{{ errorMessage }}</p>
            </div>

            <!-- OTP -->
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
                  Entrez le code envoyé à {{ email }}
                </p>
              </div>
              <button type="submit" :disabled="loading" class="w-full px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors font-medium disabled:opacity-50">
                {{ loading ? 'Vérification...' : 'Vérifier' }}
              </button>
              <button type="button" @click="handleResendOTP" :disabled="loading" class="w-full px-6 py-3 bg-[var(--color-surface)] text-[var(--color-text)] rounded-lg hover:bg-[var(--color-surface-dark)] transition-colors font-medium disabled:opacity-50">
                Renvoyer le code
              </button>
            </form>

            <!-- Login / Register -->
            <form v-else @submit.prevent="handleSubmit" class="space-y-4">
              <div v-if="!isLogin">
                <label class="block text-sm font-medium text-[var(--color-text)] mb-2">Nom complet</label>
                <input v-model="displayName" type="text" required class="input-field" placeholder="Jean Dupont" />
              </div>
              <div>
                <label class="block text-sm font-medium text-[var(--color-text)] mb-2">Email</label>
                <input v-model="email" type="email" required class="input-field" placeholder="exemple@email.com" />
              </div>
              <div>
                <label class="block text-sm font-medium text-[var(--color-text)] mb-2">Mot de passe</label>
                <input v-model="password" type="password" required :minlength="isLogin ? 1 : 6" class="input-field" :placeholder="isLogin ? 'Votre mot de passe' : 'Minimum 6 caractères'" />
              </div>
              <button type="submit" :disabled="loading" class="w-full px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors font-medium disabled:opacity-50">
                {{ loading ? 'Chargement...' : (isLogin ? 'Se connecter' : "S'inscrire") }}
              </button>
            </form>

            <div v-if="!showOTPVerification" class="mt-4 text-center">
              <button @click="toggleMode" class="text-sm text-[var(--color-primary)] hover:underline">
                {{ isLogin ? "Pas encore de compte ? S'inscrire" : 'Déjà un compte ? Se connecter' }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import { useAuth } from '../composables/useAuth'

export default {
  name: 'AuthModal',
  props: {
    isOpen: { type: Boolean, default: false },
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
      successMessage: '',
      showOTPVerification: false,
      otpCode: '',
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
      Object.assign(this.$data, this.$options.data.call(this))
    },
    async handleSubmit() {
      this.loading = true
      this.errorMessage = ''
      this.successMessage = ''
      try {
        if (this.isLogin) {
          const result = await this.login(this.email, this.password)
          if (result.success) {
            this.$emit('success')
            this.close()
          } else {
            this.errorMessage = this.getErrorMessage(result.error)
          }
        } else {
          if (!this.displayName.trim()) {
            this.errorMessage = 'Veuillez entrer votre nom complet'
            return
          }
          const result = await this.register(this.email, this.password, this.displayName)
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
      } catch {
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
          setTimeout(() => { this.$emit('success'); this.close() }, 1200)
        } else {
          this.errorMessage = 'Code de vérification invalide'
        }
      } finally {
        this.loading = false
      }
    },
    async handleResendOTP() {
      this.loading = true
      const result = await this.resendOTP(this.email)
      this.loading = false
      if (result.success) this.successMessage = result.message
      else this.errorMessage = 'Erreur lors du renvoi du code'
    },
    getErrorMessage(error) {
      const map = {
        'auth/email-already-in-use': 'Cet email est déjà utilisé',
        'auth/invalid-email': 'Email invalide',
        'auth/weak-password': 'Le mot de passe doit contenir au moins 6 caractères',
        'auth/user-not-found': 'Aucun compte trouvé avec cet email',
        'auth/wrong-password': 'Email ou mot de passe incorrect',
        'auth/invalid-credential': 'Email ou mot de passe incorrect',
        'auth/too-many-requests': 'Trop de tentatives. Réessayez plus tard',
      }
      for (const [key, msg] of Object.entries(map)) {
        if (error?.includes(key)) return msg
      }
      return 'Une erreur est survenue. Veuillez réessayer.'
    },
  },
}
</script>

<style scoped>
.input-field {
  @apply w-full px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--color-text)];
}
</style>
