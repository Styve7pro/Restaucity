// src/composables/useAuth.js
import { ref, computed } from 'vue'
import { authService } from '../services/authService.js'

// ── State global singleton (partagé entre tous les composants) ─────────────
const user      = ref(null)
const loading   = ref(true)   // true jusqu'à la 1ère vérification de session
const authReady = ref(false)  // true une fois la session connue

// Init : vérification session au démarrage de l'app
authService.getSession()
  .then(session => { user.value = session?.user ?? null })
  .catch(() => { user.value = null })
  .finally(() => { loading.value = false; authReady.value = true })

// Écoute en temps réel : LOGIN, LOGOUT, TOKEN_REFRESHED, PASSWORD_RECOVERY…
authService.onAuthStateChange((event, session) => {
  user.value    = session?.user ?? null
  loading.value = false
  authReady.value = true
})

// ── Computed globaux ───────────────────────────────────────────────────────
const isAdmin         = computed(() => authService.isAdmin(user.value))
const isAuthenticated = computed(() => !!user.value)
const displayName     = computed(() => authService.getDisplayName(user.value))
const avatarUrl       = computed(() =>
  user.value?.user_metadata?.avatar_url ||
  user.value?.user_metadata?.picture ||
  null
)
// Profil public : nom + avatar, PAS d'email
const publicProfile   = computed(() => authService.getPublicProfile(user.value))

// ── Composable exporté ─────────────────────────────────────────────────────
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

  const register = async (email, password, name) => {
    try {
      const data = await authService.register(email, password, name)
      const needsConfirm = !data.session
      return {
        success: true,
        requiresEmailConfirmation: needsConfirm,
        message: needsConfirm ? 'Un email de confirmation vous a été envoyé.' : null,
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

  // Apple intentionnellement supprimé
  const loginWithGoogle = async () => {
    try {
      await authService.loginWithGoogle()
      return { success: true }
      // Note : la page sera redirigée par Supabase, ce return n'est jamais atteint en cas de succès
    } catch (err) {
      return { success: false, error: mapAuthError(err.message) }
    }
  }

  const verifyOTP = async (email, token) => {
    try {
      const data = await authService.verifyOTP(email, token)
      user.value = data.user
      return { success: true }
    } catch {
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
    // State (réactif)
    user,
    loading,
    authReady,
    isAdmin,
    isAuthenticated,
    displayName,
    avatarUrl,
    publicProfile,   // ← nom + avatar, sans email
    // Actions
    login,
    register,
    logout,
    loginWithGoogle, // Apple supprimé
    verifyOTP,
    resendOTP,
    resetPassword,
  }
}

// ── Mapping erreurs Supabase → messages français ──────────────────────────
function mapAuthError(msg = '') {
  const m = msg.toLowerCase()
  if (m.includes('invalid login') || m.includes('invalid credential') || m.includes('wrong password'))
    return 'Email ou mot de passe incorrect.'
  if (m.includes('email not confirmed'))
    return 'Confirmez votre email avant de vous connecter.'
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
  return msg || 'Une erreur est survenue. Veuillez réessayer.'
}
