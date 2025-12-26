"use client"

import { ref, computed } from "vue"
import { supabase } from "../config/supabaseConfig.js"

const user = ref(null)
const loading = ref(true)

supabase.auth.onAuthStateChange(async (event, session) => {
  console.log("[v0] Auth state changed:", event, session?.user?.email || "No user")
  user.value = session?.user || null
  loading.value = false
})

// Initialize auth state
supabase.auth.getSession().then(async ({ data: { session } }) => {
  user.value = session?.user || null
  loading.value = false
})

const isAdmin = computed(() => {
  return user.value && user.value.email && user.value.email.includes("jesusinmiddlexstyve")
})

export function useAuth() {
  const login = async (email, password) => {
    console.log("[v0] useAuth.login called with email:", email)
    try {
      console.log("[v0] Attempting Supabase signInWithPassword...")
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      console.log("[v0] Supabase login successful:", data.user.email)
      user.value = data.user

      return { success: true }
    } catch (error) {
      console.error("[v0] Supabase login error:", error)
      return { success: false, error: error.message }
    }
  }

  const register = async (email, password, displayName) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      return {
        success: true,
        requiresEmailConfirmation: true,
        message: "Un email de confirmation a été envoyé. Veuillez vérifier votre boîte de réception.",
      }
    } catch (error) {
      console.error("[v0] Supabase register error:", error)
      return { success: false, error: error.message }
    }
  }

  const verifyOTP = async (email, token) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "email",
      })

      if (error) throw error

      user.value = data.user

      return { success: true }
    } catch (error) {
      console.error("[v0] OTP verification error:", error)
      return { success: false, error: error.message }
    }
  }

  const resendOTP = async (email) => {
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      })

      if (error) throw error

      return { success: true, message: "Code de vérification renvoyé" }
    } catch (error) {
      console.error("[v0] Resend OTP error:", error)
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
      console.error("[v0] Supabase logout error:", error)
      return { success: false, error: error.message }
    }
  }

  return {
    user,
    loading,
    isAdmin,
    login,
    register,
    verifyOTP,
    resendOTP,
    logout,
  }
}
