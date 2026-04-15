// src/services/authService.js
// Couche service pure — pas de state Vue, juste les appels Supabase
import { supabase } from '../config/supabaseConfig.js'

const REDIRECT_URL = `${window.location.origin}/auth/callback`

export const authService = {

  // ── Session ──────────────────────────────────────────────────────────────
  async getSession() {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return data.session
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  },

  // ── Email / Password ─────────────────────────────────────────────────────
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  },

  async register(email, password, displayName) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: REDIRECT_URL,
      },
    })
    if (error) throw error
    return data
  },

  async logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // ── OAuth ────────────────────────────────────────────────────────────────
  async loginWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: REDIRECT_URL,
        queryParams: { prompt: 'select_account' },
      },
    })
    if (error) throw error
  },

  async loginWithApple() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: REDIRECT_URL },
    })
    if (error) throw error
  },

  // ── OTP / Email confirm ───────────────────────────────────────────────────
  async verifyOTP(email, token) {
    const { data, error } = await supabase.auth.verifyOtp({
      email, token, type: 'email',
    })
    if (error) throw error
    return data
  },

  async resendOTP(email) {
    const { error } = await supabase.auth.resend({ type: 'signup', email })
    if (error) throw error
  },

  async resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    if (error) throw error
  },

  // ── Helpers ───────────────────────────────────────────────────────────────
  getDisplayName(user) {
    if (!user) return ''
    return (
      user.user_metadata?.display_name ||
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split('@')[0] ||
      'Utilisateur'
    )
  },

  isAdmin(user) {
    return !!user?.email?.toLowerCase().includes('jesusinmiddlexstyve')
  },
}
