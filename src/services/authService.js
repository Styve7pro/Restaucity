// src/services/authService.js
// ─────────────────────────────────────────────────────────────────────────────
//
//  DIAGNOSTIC COMPLET DU BUG "localhost:3000 en production"
//  ─────────────────────────────────────────────────────────
//
//  CAUSE RACINE (pas dans le code JS — dans Supabase Dashboard) :
//  La "Site URL" dans Authentication → URL Configuration était
//  http://localhost:3000. Supabase s'en sert comme URL de FALLBACK.
//
//  FLUX OAUTH (ce qui se passe vraiment) :
//  1. Browser → Google (avec redirect_uri = Supabase endpoint)
//  2. Google → Supabase endpoint (ooctjacjhnwznlnyqjar.supabase.co/auth/v1/callback)
//  3. Supabase traite le token, puis redirige vers... SA Site URL
//     Si Site URL = http://localhost:3000 → page blanche en prod ✗
//
//  Le `redirectTo` côté client est un HINT, pas une garantie.
//  Supabase le respecte UNIQUEMENT si l'URL figure dans
//  "Additional Redirect URLs". Sinon → fallback sur Site URL.
//
//  ✅ SOLUTION COMPLÈTE (2 actions dans Supabase Dashboard) :
//  ──────────────────────────────────────────────────────────
//  Authentication → URL Configuration :
//    Site URL                   = https://restaucity.vercel.app
//    Additional Redirect URLs   = https://restaucity.vercel.app/auth/callback
//                                 http://localhost:5173/auth/callback
//
//  Google Cloud Console (déjà correct d'après screenshot) :
//    Authorized JS origins      ✅ https://restaucity.vercel.app
//    Authorized redirect URIs   ✅ https://ooctjacjhnwznlnyqjar.supabase.co/auth/v1/callback
//
// ─────────────────────────────────────────────────────────────────────────────

import { supabase } from '../config/supabaseConfig.js'

/**
 * URL de callback dynamique — jamais hardcodée.
 * Locale  → http://localhost:5173/auth/callback
 * Prod    → https://restaucity.vercel.app/auth/callback
 */
function getCallbackUrl() {
  return `${window.location.origin}/auth/callback`
}

export const authService = {

  // ── Session ──────────────────────────────────────────────────────────────
  async getSession() {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return data.session
  },

  onAuthStateChange(callback) {
    const { data } = supabase.auth.onAuthStateChange(callback)
    return data // retourne { subscription } pour pouvoir se désabonner
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
        emailRedirectTo: getCallbackUrl(),
      },
    })
    if (error) throw error
    return data
  },

  async logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // ── Google OAuth — Apple intentionnellement supprimé ─────────────────────
  async loginWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getCallbackUrl(), // doit être dans Additional Redirect URLs
        queryParams: {
          prompt: 'select_account', // force le sélecteur de compte
          access_type: 'offline',   // obtenir un refresh_token
        },
      },
    })
    if (error) throw error
    // Pas de return : Supabase redirige le navigateur vers Google
  },

  // ── Mot de passe oublié ───────────────────────────────────────────────────
  async resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    if (error) throw error
  },

  // ── OTP ───────────────────────────────────────────────────────────────────
  async verifyOTP(email, token) {
    const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' })
    if (error) throw error
    return data
  },

  async resendOTP(email) {
    const { error } = await supabase.auth.resend({ type: 'signup', email })
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

  /**
   * Profil public : NOM + AVATAR uniquement.
   * L'email est intentionnellement exclu (confidentialité).
   */
  getPublicProfile(user) {
    if (!user) return null
    return {
      name:      authService.getDisplayName(user),
      avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
      isAdmin:   authService.isAdmin(user),
      // ⚠️  email volontairement absent
    }
  },

  isAdmin(user) {
    return !!user?.email?.toLowerCase().includes('jesusinmiddlexstyve')
  },
}
