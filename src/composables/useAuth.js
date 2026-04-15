// src/composables/useAuth.js
// State global partagé entre tous les composants
import { ref, computed } from 'vue'
import { authService } from '../services/authService.js'

// ── State singleton ─────────────────────────────────────────────────────────
const user       = ref(null)
const loading    = ref(true)   // true jusqu'à ce que la session soit vérifiée
const authReady  = ref(false)  // true une fois la vérification initiale terminée

// ── Initialisation (une seule fois au démarrage) ────────────────────────────
authService.getSession()
  .then((session) => {
    user.value    = session?.user ?? null
  })
  .catch(() => {
    user.value    = null
  })
  .finally(() => {
    loading.value  = false
    authReady.value = true
  })

// Écoute tous les changements de session (login, logout, refresh token…)
authService.onAuthStateChange((event, session) => {
  user.value     = session?.user ?? null
  loading.value  = false
  authReady.value = true

  if (event === 'TOKEN_REFRESHED') {
    console.log('[Auth] Token rafraîchi automatiquement')
  }
})

// ── Computed globaux ────────────────────────────────────────────────────────
const isAdmin         = computed(() => authService.isAdmin(user.value))
const isAuthenticated = computed(() => !!user.value)
const displayName     = computed(() => authService.getDisplayName(user.value))
const avatarUrl       = computed(() =>
  user.value?.user_metadata?.avatar_url ||
  user.value?.user_metadata?.picture ||
  null
)

// ── Composable exporté ──────────────────────────────────────────────────────
export function useAuth() {

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password)
      user.value = data.user
      return { success: true }
    } catch (err) {
      return { success: false, error: mapAuthError(err.message) }
    }
  }

  const register = async (email, password, displayName) => {
    try {
      const data = await authService.register(email, password, displayName)
      const needsConfirm = !data.session   // Supabase renvoie session=null si confirmation requise
      return {
        success: true,
        requiresEmailConfirmation: needsConfirm,
        message: needsConfirm
          ? 'Un email de confirmation vous a été envoyé. Vérifiez votre boîte mail.'
          : null,
      }
    } catch (err) {
      return { success: false, error: mapAuthError(err.message) }
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
      user.value = null
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  const loginWithGoogle = async () => {
    try {
      await authService.loginWithGoogle()
      return { success: true }
    } catch (err) {
      return { success: false, error: mapAuthError(err.message) }
    }
  }

  const loginWithApple = async () => {
    try {
      await authService.loginWithApple()
      return { success: true }
    } catch (err) {
      return { success: false, error: mapAuthError(err.message) }
    }
  }

  const verifyOTP = async (email, token) => {
    try {
      const data = await authService.verifyOTP(email, token)
      user.value = data.user
      return { success: true }
    } catch (err) {
      return { success: false, error: 'Code invalide ou expiré.' }
    }
  }

  const resendOTP = async (email) => {
    try {
      await authService.resendOTP(email)
      return { success: true, message: 'Nouveau code envoyé !' }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  const resetPassword = async (email) => {
    try {
      await authService.resetPassword(email)
      return { success: true, message: 'Email de réinitialisation envoyé !' }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  return {
    // State
    user,
    loading,
    authReady,
    isAdmin,
    isAuthenticated,
    displayName,
    avatarUrl,
    // Actions
    login,
    register,
    logout,
    loginWithGoogle,
    loginWithApple,
    verifyOTP,
    resendOTP,
    resetPassword,
  }
}

// ── Mapping erreurs Supabase → messages lisibles ────────────────────────────
function mapAuthError(message = '') {
  const m = message.toLowerCase()
  if (m.includes('invalid login') || m.includes('invalid credential') || m.includes('wrong password'))
    return 'Email ou mot de passe incorrect.'
  if (m.includes('email not confirmed'))
    return 'Veuillez confirmer votre email avant de vous connecter.'
  if (m.includes('user already registered') || m.includes('already been registered'))
    return 'Un compte existe déjà avec cet email.'
  if (m.includes('password should be at least'))
    return 'Le mot de passe doit contenir au moins 6 caractères.'
  if (m.includes('unable to validate email'))
    return 'Adresse email invalide.'
  if (m.includes('too many requests') || m.includes('rate limit'))
    return 'Trop de tentatives. Patientez quelques minutes.'
  if (m.includes('network') || m.includes('fetch'))
    return 'Erreur réseau. Vérifiez votre connexion internet.'
  return message || 'Une erreur est survenue. Veuillez réessayer.'
}
