// src/composables/useAuth.js
import { ref, computed } from 'vue'
import { supabase } from '../config/supabaseConfig.js'

const user = ref(null)
const loading = ref(true)

// Init session
supabase.auth.getSession().then(({ data: { session } }) => {
  user.value = session?.user || null
  loading.value = false
})

// Écoute les changements d'auth
supabase.auth.onAuthStateChange((event, session) => {
  console.log('[Auth] State changed:', event, session?.user?.email || 'No user')
  user.value = session?.user || null
  loading.value = false
})

const isAdmin = computed(() =>
  !!(user.value?.email?.toLowerCase().includes('jesusinmiddlexstyve'))
)

export function useAuth() {
  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      user.value = data.user
      return { success: true }
    } catch (error) {
      console.error('[Auth] Login error:', error)
      return { success: false, error: error.message }
    }
  }

  const register = async (email, password, displayName) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
      return {
        success: true,
        requiresEmailConfirmation: true,
        message: 'Un email de confirmation a été envoyé. Vérifiez votre boîte mail.',
      }
    } catch (error) {
      console.error('[Auth] Register error:', error)
      return { success: false, error: error.message }
    }
  }

  const verifyOTP = async (email, token) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' })
      if (error) throw error
      user.value = data.user
      return { success: true }
    } catch (error) {
      console.error('[Auth] OTP error:', error)
      return { success: false, error: error.message }
    }
  }

  const resendOTP = async (email) => {
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email })
      if (error) throw error
      return { success: true, message: 'Code de vérification renvoyé' }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      user.value = null
      return { success: true }
    } catch (error) {
      console.error('[Auth] Logout error:', error)
      return { success: false, error: error.message }
    }
  }

  return { user, loading, isAdmin, login, register, verifyOTP, resendOTP, logout }
}
