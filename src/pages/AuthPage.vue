<template>
  <div class="auth-page min-h-screen flex items-center justify-center p-4">

    <!-- Fond décoratif -->
    <div aria-hidden="true" class="auth-blobs">
      <div class="blob blob-a"></div>
      <div class="blob blob-b"></div>
    </div>

    <!-- Card -->
    <div class="auth-card w-full max-w-md relative z-10">

      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="w-14 h-14 bg-[var(--color-primary)] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-orange-500/30">
          <span class="text-white text-2xl font-black">R</span>
        </div>
        <h1 class="text-2xl font-black text-gray-900 dark:text-white">RestauCity</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Découvrez les meilleurs restaurants du Congo</p>
      </div>

      <!-- Tabs -->
      <div class="tab-bar" v-if="activeTab !== 'otp'">
        <button class="tab-btn" :class="{ active: activeTab === 'login' }"    @click="setTab('login')">Connexion</button>
        <button class="tab-btn" :class="{ active: activeTab === 'register' }" @click="setTab('register')">Inscription</button>
      </div>

      <!-- Alert globale -->
      <Transition name="alert-slide">
        <div v-if="alertMsg" class="auth-alert" :class="`auth-alert--${alertType}`" role="alert">
          <svg class="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path v-if="alertType==='success'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p class="text-sm">{{ alertMsg }}</p>
        </div>
      </Transition>

      <!-- ══════════ CONNEXION ══════════ -->
      <Transition name="tab-slide" mode="out-in">
      <div v-if="activeTab === 'login'" key="login" class="space-y-4">

        <!-- Google OAuth uniquement (Apple supprimé) -->
        <button @click="handleGoogle" :disabled="oauthLoading" class="oauth-btn">
          <span v-if="oauthLoading" class="spinner"></span>
          <svg v-else class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span>{{ oauthLoading ? 'Redirection…' : 'Continuer avec Google' }}</span>
        </button>

        <div class="divider"><span>ou</span></div>

        <!-- Formulaire -->
        <form @submit.prevent="handleLogin" novalidate class="space-y-4">
          <!-- Email -->
          <div>
            <label class="field-label">Email</label>
            <input v-model="f.email" type="email" autocomplete="email" placeholder="vous@exemple.com"
              class="field-input" :class="{ error: fe.email }" @blur="vl('email')" />
            <p v-if="fe.email" class="field-err">{{ fe.email }}</p>
          </div>

          <!-- Mot de passe -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="field-label mb-0">Mot de passe</label>
              <button type="button" @click="openForgot" class="text-xs text-[var(--color-primary)] hover:underline">
                Mot de passe oublié ?
              </button>
            </div>
            <div class="relative">
              <input v-model="f.password" :type="showPwd ? 'text' : 'password'"
                autocomplete="current-password" placeholder="••••••••"
                class="field-input pr-10" :class="{ error: fe.password }" @blur="vl('password')" />
              <button type="button" @click="showPwd=!showPwd" class="eye-btn" tabindex="-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path v-if="showPwd" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                  <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
              </button>
            </div>
            <p v-if="fe.password" class="field-err">{{ fe.password }}</p>
          </div>

          <!-- Se souvenir de moi -->
          <label class="flex items-center gap-2 cursor-pointer select-none">
            <input v-model="f.remember" type="checkbox"
              class="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400 focus:ring-2" />
            <span class="text-sm text-gray-600 dark:text-gray-400">Se souvenir de moi</span>
          </label>

          <button type="submit" :disabled="formLoading" class="submit-btn">
            <span v-if="formLoading" class="spinner spinner--white"></span>
            {{ formLoading ? 'Connexion…' : 'Se connecter' }}
          </button>
        </form>
      </div>

      <!-- ══════════ INSCRIPTION ══════════ -->
      <div v-else-if="activeTab === 'register'" key="register" class="space-y-4">

        <button @click="handleGoogle" :disabled="oauthLoading" class="oauth-btn">
          <span v-if="oauthLoading" class="spinner"></span>
          <svg v-else class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span>{{ oauthLoading ? 'Redirection…' : "S'inscrire avec Google" }}</span>
        </button>

        <div class="divider"><span>ou</span></div>

        <form @submit.prevent="handleRegister" novalidate class="space-y-4">
          <div>
            <label class="field-label">Prénom & Nom</label>
            <input v-model="r.name" type="text" autocomplete="name" placeholder="Jean Dupont"
              class="field-input" :class="{ error: re.name }" @blur="vr('name')" />
            <p v-if="re.name" class="field-err">{{ re.name }}</p>
          </div>
          <div>
            <label class="field-label">Email</label>
            <input v-model="r.email" type="email" autocomplete="email" placeholder="vous@exemple.com"
              class="field-input" :class="{ error: re.email }" @blur="vr('email')" />
            <p v-if="re.email" class="field-err">{{ re.email }}</p>
          </div>
          <div>
            <label class="field-label">Mot de passe</label>
            <div class="relative">
              <input v-model="r.password" :type="showRegPwd ? 'text' : 'password'"
                autocomplete="new-password" placeholder="Minimum 6 caractères"
                class="field-input pr-10" :class="{ error: re.password }" @blur="vr('password')" />
              <button type="button" @click="showRegPwd=!showRegPwd" class="eye-btn" tabindex="-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
              </button>
            </div>
            <!-- Indicateur force -->
            <div v-if="r.password" class="mt-2">
              <div class="flex gap-1 mb-1">
                <div v-for="i in 4" :key="i" class="h-1 flex-1 rounded-full transition-all duration-300"
                  :class="pwdStrength >= i ? strengthColors[pwdStrength] : 'bg-gray-200 dark:bg-gray-700'"></div>
              </div>
              <p class="text-xs" :class="strengthTextColors[pwdStrength]">{{ strengthLabels[pwdStrength] }}</p>
            </div>
            <p v-if="re.password" class="field-err">{{ re.password }}</p>
          </div>
          <div>
            <label class="field-label">Confirmer le mot de passe</label>
            <div class="relative">
              <input v-model="r.confirm" :type="showConfirmPwd ? 'text' : 'password'"
                autocomplete="new-password" placeholder="••••••••"
                class="field-input pr-10" :class="{ error: re.confirm }" @blur="vr('confirm')" />
              <button type="button" @click="showConfirmPwd=!showConfirmPwd" class="eye-btn" tabindex="-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
              </button>
            </div>
            <p v-if="re.confirm" class="field-err">{{ re.confirm }}</p>
          </div>

          <button type="submit" :disabled="formLoading" class="submit-btn">
            <span v-if="formLoading" class="spinner spinner--white"></span>
            {{ formLoading ? 'Création…' : 'Créer mon compte' }}
          </button>
        </form>
      </div>

      <!-- ══════════ OTP ══════════ -->
      <div v-else-if="activeTab === 'otp'" key="otp" class="space-y-5">
        <div class="text-center">
          <div class="w-14 h-14 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <svg class="w-7 h-7 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
          </div>
          <h2 class="text-lg font-bold text-gray-900 dark:text-white">Vérifiez votre email</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Code envoyé à <strong class="text-gray-700 dark:text-gray-300">{{ otpEmail }}</strong>
          </p>
        </div>

        <form @submit.prevent="handleOTP" class="space-y-4">
          <div>
            <label class="field-label text-center block">Code à 6 chiffres</label>
            <input v-model="otpCode" type="text" inputmode="numeric" maxlength="6" pattern="[0-9]*"
              class="field-input text-center text-2xl tracking-[0.5em] font-mono" placeholder="000000" />
          </div>
          <button type="submit" :disabled="formLoading || otpCode.length < 6" class="submit-btn">
            <span v-if="formLoading" class="spinner spinner--white"></span>
            {{ formLoading ? 'Vérification…' : 'Vérifier le code' }}
          </button>
        </form>

        <div class="text-center space-y-1.5">
          <p class="text-sm text-gray-500">Code non reçu ?</p>
          <button @click="handleResend" :disabled="resendCooldown > 0"
            class="text-sm text-[var(--color-primary)] hover:underline disabled:opacity-40 disabled:no-underline transition-opacity">
            {{ resendCooldown > 0 ? `Renvoyer dans ${resendCooldown}s` : 'Renvoyer le code' }}
          </button>
        </div>

        <button @click="setTab('register')" class="w-full text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-center">
          ← Retour à l'inscription
        </button>
      </div>
      </Transition>

      <!-- Footer légal -->
      <p class="text-center text-xs text-gray-400 dark:text-gray-600 mt-6 leading-relaxed">
        En continuant, vous acceptez nos
        <a href="#" class="underline decoration-dotted">CGU</a> et notre
        <a href="#" class="underline decoration-dotted">politique de confidentialité</a>.
      </p>
    </div>

    <!-- Modal mot de passe oublié -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="forgotOpen"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          @click.self="forgotOpen=false"
        >
          <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 relative">
            <button @click="forgotOpen=false" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-1">Mot de passe oublié</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Entrez votre email, vous recevrez un lien de réinitialisation.
            </p>
            <form @submit.prevent="handleForgot" class="space-y-4">
              <input v-model="forgotEmail" type="email" required
                class="field-input" placeholder="vous@exemple.com" />
              <Transition name="alert-slide">
                <div v-if="forgotMsg" class="auth-alert" :class="`auth-alert--${forgotMsgType}`">
                  <p class="text-sm">{{ forgotMsg }}</p>
                </div>
              </Transition>
              <div class="flex gap-3">
                <button type="button" @click="forgotOpen=false"
                  class="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  Annuler
                </button>
                <button type="submit" :disabled="forgotLoading" class="flex-1 submit-btn">
                  {{ forgotLoading ? '…' : 'Envoyer' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script>
import { useAuth } from '../composables/useAuth.js'
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'AuthPage',
  setup() {
    const auth   = useAuth()
    const route  = useRoute()
    const router = useRouter()
    return { auth, route, router }
  },
  data() {
    return {
      activeTab: 'login',

      // Login
      f:       { email: '', password: '', remember: false },
      fe:      {},
      showPwd: false,

      // Register
      r:            { name: '', email: '', password: '', confirm: '' },
      re:           {},
      showRegPwd:   false,
      showConfirmPwd: false,

      // OTP
      otpEmail: '',
      otpCode: '',
      resendCooldown: 0,
      resendTimer: null,

      // UI
      formLoading:  false,
      oauthLoading: false,
      alertMsg:  '',
      alertType: 'error',

      // Mot de passe oublié
      forgotOpen:    false,
      forgotEmail:   '',
      forgotMsg:     '',
      forgotMsgType: 'success',
      forgotLoading: false,

      // Force mot de passe
      strengthColors:    ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'],
      strengthTextColors:['', 'text-red-500', 'text-orange-500', 'text-yellow-600', 'text-green-600'],
      strengthLabels:    ['', 'Faible', 'Moyen', 'Bon', 'Fort'],
    }
  },
  computed: {
    pwdStrength() {
      const p = this.r.password
      if (!p || p.length < 6) return p.length > 0 ? 1 : 0
      let s = 1
      if (p.length >= 8) s++
      if (/[A-Z]/.test(p) && /[0-9]/.test(p)) s++
      if (/[^A-Za-z0-9]/.test(p)) s++
      return Math.min(s, 4)
    },
  },
  beforeUnmount() {
    if (this.resendTimer) clearInterval(this.resendTimer)
  },
  methods: {
    setTab(tab) {
      this.activeTab = tab
      this.alertMsg  = ''
      this.fe        = {}
      this.re        = {}
    },

    flash(msg, type = 'error') {
      this.alertMsg  = msg
      this.alertType = type
      if (type === 'success') setTimeout(() => { if (this.alertMsg === msg) this.alertMsg = '' }, 5000)
    },

    // ── Validation login ────────────────────────────────────────────────────
    vl(field) {
      const e = { ...this.fe }
      if (field === 'email')
        e.email = !this.f.email ? 'Email requis.' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.f.email) ? 'Email invalide.' : ''
      if (field === 'password')
        e.password = !this.f.password ? 'Mot de passe requis.' : ''
      this.fe = e
    },
    loginValid() {
      this.vl('email'); this.vl('password')
      return !this.fe.email && !this.fe.password
    },

    // ── Validation register ─────────────────────────────────────────────────
    vr(field) {
      const e = { ...this.re }
      if (field === 'name')     e.name     = !this.r.name.trim() ? 'Nom requis.' : ''
      if (field === 'email')    e.email    = !this.r.email ? 'Email requis.' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.r.email) ? 'Email invalide.' : ''
      if (field === 'password') e.password = !this.r.password ? 'Mot de passe requis.' : this.r.password.length < 6 ? 'Minimum 6 caractères.' : ''
      if (field === 'confirm')  e.confirm  = this.r.confirm !== this.r.password ? 'Les mots de passe ne correspondent pas.' : ''
      this.re = e
    },
    registerValid() {
      ['name','email','password','confirm'].forEach(f => this.vr(f))
      return !this.re.name && !this.re.email && !this.re.password && !this.re.confirm
    },

    // ── Handlers ────────────────────────────────────────────────────────────
    async handleLogin() {
      if (!this.loginValid()) return
      this.formLoading = true
      this.alertMsg    = ''
      const res = await this.auth.login(this.f.email, this.f.password)
      this.formLoading = false
      if (res.success) {
        this.router.push(this.route.query.redirect || '/')
      } else {
        this.flash(res.error)
      }
    },

    async handleRegister() {
      if (!this.registerValid()) return
      this.formLoading = true
      this.alertMsg    = ''
      const res = await this.auth.register(this.r.email, this.r.password, this.r.name)
      this.formLoading = false
      if (res.success) {
        if (res.requiresEmailConfirmation) {
          this.otpEmail  = this.r.email
          this.activeTab = 'otp'
          this.startCooldown()
        } else {
          this.router.push(this.route.query.redirect || '/')
        }
      } else {
        this.flash(res.error)
      }
    },

    async handleOTP() {
      this.formLoading = true
      const res = await this.auth.verifyOTP(this.otpEmail, this.otpCode)
      this.formLoading = false
      if (res.success) {
        this.flash('Email vérifié ! Bienvenue 🎉', 'success')
        setTimeout(() => this.router.push(this.route.query.redirect || '/'), 1200)
      } else {
        this.flash(res.error)
      }
    },

    async handleResend() {
      const res = await this.auth.resendOTP(this.otpEmail)
      res.success ? this.flash('Code renvoyé !', 'success') : this.flash(res.error)
      if (res.success) this.startCooldown()
    },

    async handleGoogle() {
      this.oauthLoading = true
      this.alertMsg     = ''
      const res = await this.auth.loginWithGoogle()
      // En cas de succès, la page est redirigée par Supabase — pas de reset
      if (!res.success) {
        this.oauthLoading = false
        this.flash(res.error)
      }
    },

    async handleForgot() {
      this.forgotLoading = true
      this.forgotMsg     = ''
      const res = await this.auth.resetPassword(this.forgotEmail)
      this.forgotLoading = false
      this.forgotMsgType = res.success ? 'success' : 'error'
      this.forgotMsg     = res.success ? res.message : res.error
      if (res.success) setTimeout(() => { this.forgotOpen = false }, 2500)
    },

    openForgot() {
      this.forgotOpen = true
      this.forgotMsg  = ''
      this.forgotEmail = this.f.email || ''
    },

    startCooldown(s = 60) {
      this.resendCooldown = s
      if (this.resendTimer) clearInterval(this.resendTimer)
      this.resendTimer = setInterval(() => {
        this.resendCooldown--
        if (this.resendCooldown <= 0) clearInterval(this.resendTimer)
      }, 1000)
    },
  },
}
</script>

<style scoped>
.auth-page {
  background: #f8fafc;
  position: relative;
  overflow: hidden;
}
.dark .auth-page { background: #030712; }

.auth-blobs { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
.blob { position: absolute; border-radius: 50%; filter: blur(90px); opacity: .2; }
.blob-a { width: 520px; height: 520px; background: radial-gradient(#f97316, #fb923c); top: -220px; right: -160px; }
.blob-b { width: 420px; height: 420px; background: radial-gradient(#3b82f6, #8b5cf6); bottom: -160px; left: -120px; }

.auth-card {
  background: rgba(255,255,255,.88);
  backdrop-filter: blur(18px);
  border: 1px solid rgba(255,255,255,.7);
  border-radius: 1.5rem;
  padding: 2rem;
  box-shadow: 0 20px 60px rgba(0,0,0,.11), 0 0 0 1px rgba(255,255,255,.5);
}
.dark .auth-card {
  background: rgba(17,24,39,.88);
  border-color: rgba(55,65,81,.6);
  box-shadow: 0 20px 60px rgba(0,0,0,.5);
}

/* Tabs */
.tab-bar { display:flex; background:#f3f4f6; border-radius:.875rem; padding:3px; margin-bottom:1.5rem; gap:3px; }
.dark .tab-bar { background:#1f2937; }
.tab-btn { flex:1; padding:.5rem 1rem; font-size:.875rem; font-weight:600; border-radius:.75rem; color:#6b7280; transition:all .2s; }
.dark .tab-btn { color:#9ca3af; }
.tab-btn.active { background:#fff; color:#111827; box-shadow:0 1px 4px rgba(0,0,0,.1); }
.dark .tab-btn.active { background:#374151; color:#f9fafb; }

/* Alert */
.auth-alert { display:flex; align-items:flex-start; gap:.5rem; padding:.75rem 1rem; border-radius:.75rem; }
.auth-alert--error   { background:#fef2f2; border:1px solid #fecaca; color:#b91c1c; }
.auth-alert--success { background:#f0fdf4; border:1px solid #bbf7d0; color:#15803d; }
.dark .auth-alert--error   { background:rgba(239,68,68,.15); border-color:rgba(239,68,68,.3); color:#fca5a5; }
.dark .auth-alert--success { background:rgba(34,197,94,.15); border-color:rgba(34,197,94,.3); color:#86efac; }

/* OAuth */
.oauth-btn {
  width:100%; display:flex; align-items:center; justify-content:center; gap:.75rem;
  padding:.75rem 1rem; border-radius:.875rem; border:1.5px solid #e5e7eb;
  background:#fff; color:#374151; font-size:.9rem; font-weight:600;
  transition:all .18s; cursor:pointer;
}
.oauth-btn:hover:not(:disabled) { background:#f9fafb; border-color:#d1d5db; box-shadow:0 2px 8px rgba(0,0,0,.08); transform:translateY(-1px); }
.oauth-btn:disabled { opacity:.6; cursor:not-allowed; }
.dark .oauth-btn { background:#1f2937; border-color:#374151; color:#f9fafb; }
.dark .oauth-btn:hover:not(:disabled) { background:#374151; }

/* Divider */
.divider { display:flex; align-items:center; gap:.75rem; color:#9ca3af; font-size:.8rem; }
.divider::before,.divider::after { content:''; flex:1; height:1px; background:#e5e7eb; }
.dark .divider::before,.dark .divider::after { background:#374151; }

/* Fields */
.field-label { display:block; font-size:.8rem; font-weight:600; color:#374151; margin-bottom:.375rem; }
.dark .field-label { color:#d1d5db; }
.field-input {
  width:100%; padding:.65rem .875rem; border-radius:.75rem; border:1.5px solid #e5e7eb;
  background:#fff; color:#111827; font-size:.875rem; outline:none;
  transition:border-color .15s, box-shadow .15s;
}
.field-input::placeholder { color:#9ca3af; }
.field-input:focus { border-color:#f97316; box-shadow:0 0 0 3px rgba(249,115,22,.12); }
.field-input.error { border-color:#f87171; }
.dark .field-input { background:#1f2937; border-color:#374151; color:#f9fafb; }
.dark .field-input:focus { box-shadow:0 0 0 3px rgba(249,115,22,.2); }
.field-err { font-size:.75rem; color:#ef4444; margin-top:.25rem; }

/* Eye toggle */
.eye-btn { position:absolute; right:.75rem; top:50%; transform:translateY(-50%); color:#9ca3af; padding:.2rem; transition:color .15s; }
.eye-btn:hover { color:#374151; }
.dark .eye-btn:hover { color:#d1d5db; }

/* Submit */
.submit-btn {
  width:100%; padding:.75rem; background:linear-gradient(135deg,#f97316,#ea580c);
  color:#fff; font-size:.9rem; font-weight:700; border-radius:.875rem;
  display:flex; align-items:center; justify-content:center; gap:.5rem;
  transition:all .18s; cursor:pointer;
}
.submit-btn:hover:not(:disabled) { background:linear-gradient(135deg,#ea580c,#c2410c); transform:translateY(-1px); box-shadow:0 4px 14px rgba(249,115,22,.4); }
.submit-btn:disabled { opacity:.55; cursor:not-allowed; transform:none; }

/* Spinner */
.spinner { width:1rem; height:1rem; border:2px solid rgba(0,0,0,.15); border-top-color:#374151; border-radius:50%; animation:spin .7s linear infinite; display:inline-block; }
.spinner--white { border-color:rgba(255,255,255,.3); border-top-color:#fff; }
@keyframes spin { to { transform:rotate(360deg); } }

/* Transitions */
.tab-slide-enter-active,.tab-slide-leave-active { transition:all .18s ease; }
.tab-slide-enter-from { opacity:0; transform:translateX(10px); }
.tab-slide-leave-to   { opacity:0; transform:translateX(-10px); }

.alert-slide-enter-active,.alert-slide-leave-active { transition:all .2s ease; }
.alert-slide-enter-from,.alert-slide-leave-to { opacity:0; transform:translateY(-6px); max-height:0; }

.modal-fade-enter-active,.modal-fade-leave-active { transition:opacity .2s; }
.modal-fade-enter-from,.modal-fade-leave-to { opacity:0; }
</style>
