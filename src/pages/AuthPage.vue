<template>
  <div class="auth-page min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-950">

    <!-- Fond décoratif -->
    <div class="auth-bg" aria-hidden="true">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
    </div>

    <!-- Card centrale -->
    <div class="auth-card w-full max-w-md relative z-10">

      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="w-14 h-14 bg-[var(--color-primary)] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-orange-500/30">
          <span class="text-white text-2xl font-black">R</span>
        </div>
        <h1 class="text-2xl font-black text-gray-900 dark:text-white tracking-tight">RestauCity</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Découvrez les meilleurs restaurants</p>
      </div>

      <!-- Tabs connexion / inscription -->
      <div class="tab-switcher">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'login' }"
          @click="switchTab('login')"
        >Connexion</button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'register' }"
          @click="switchTab('register')"
        >Inscription</button>
      </div>

      <!-- Alerte -->
      <Transition name="slide-down">
        <div v-if="alertMsg" class="alert" :class="`alert--${alertType}`" role="alert">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path v-if="alertType === 'success'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p>{{ alertMsg }}</p>
        </div>
      </Transition>

      <!-- ── CONNEXION ───────────────────────────────────────────── -->
      <Transition name="fade-tab" mode="out-in">
        <div v-if="activeTab === 'login'" key="login" class="space-y-4">

          <!-- OAuth buttons -->
          <div class="space-y-3">
            <button
              @click="handleGoogle"
              :disabled="oauthLoading === 'google'"
              class="oauth-btn"
            >
              <span v-if="oauthLoading === 'google'" class="spinner"></span>
              <svg v-else class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Continuer avec Google</span>
            </button>

            <button
              @click="handleApple"
              :disabled="oauthLoading === 'apple'"
              class="oauth-btn oauth-btn--apple"
            >
              <span v-if="oauthLoading === 'apple'" class="spinner spinner--light"></span>
              <svg v-else class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.56-1.32 3.1-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              <span>Continuer avec Apple</span>
            </button>
          </div>

          <!-- Séparateur -->
          <div class="divider"><span>ou</span></div>

          <!-- Formulaire email/password -->
          <form @submit.prevent="handleLogin" class="space-y-4" novalidate>
            <div>
              <label class="field-label">Email</label>
              <input
                v-model="loginForm.email"
                type="email"
                autocomplete="email"
                required
                class="field-input"
                :class="{ 'field-input--error': fieldErrors.email }"
                placeholder="vous@exemple.com"
                @blur="validateLoginField('email')"
              />
              <p v-if="fieldErrors.email" class="field-error">{{ fieldErrors.email }}</p>
            </div>

            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="field-label mb-0">Mot de passe</label>
                <button
                  type="button"
                  @click="showForgotPassword = true"
                  class="text-xs text-[var(--color-primary)] hover:underline"
                >Mot de passe oublié ?</button>
              </div>
              <div class="relative">
                <input
                  v-model="loginForm.password"
                  :type="showLoginPwd ? 'text' : 'password'"
                  autocomplete="current-password"
                  required
                  class="field-input pr-10"
                  :class="{ 'field-input--error': fieldErrors.password }"
                  placeholder="••••••••"
                  @blur="validateLoginField('password')"
                />
                <button type="button" @click="showLoginPwd = !showLoginPwd" class="pwd-toggle">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path v-if="showLoginPwd" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                    <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                </button>
              </div>
              <p v-if="fieldErrors.password" class="field-error">{{ fieldErrors.password }}</p>
            </div>

            <!-- Se souvenir de moi -->
            <label class="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                v-model="loginForm.rememberMe"
                type="checkbox"
                class="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400"
              />
              <span class="text-sm text-gray-600 dark:text-gray-400">Se souvenir de moi</span>
            </label>

            <button type="submit" :disabled="formLoading" class="btn-submit">
              <span v-if="formLoading" class="spinner spinner--light"></span>
              <span>{{ formLoading ? 'Connexion…' : 'Se connecter' }}</span>
            </button>
          </form>
        </div>

        <!-- ── INSCRIPTION ─────────────────────────────────────────── -->
        <div v-else-if="activeTab === 'register'" key="register" class="space-y-4">

          <!-- OAuth -->
          <div class="space-y-3">
            <button @click="handleGoogle" :disabled="oauthLoading === 'google'" class="oauth-btn">
              <span v-if="oauthLoading === 'google'" class="spinner"></span>
              <svg v-else class="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>S'inscrire avec Google</span>
            </button>
          </div>

          <div class="divider"><span>ou</span></div>

          <!-- Formulaire inscription -->
          <form @submit.prevent="handleRegister" class="space-y-4" novalidate>
            <div>
              <label class="field-label">Prénom & Nom</label>
              <input v-model="registerForm.displayName" type="text" autocomplete="name" required class="field-input" :class="{ 'field-input--error': fieldErrors.displayName }" placeholder="Jean Dupont" @blur="validateRegisterField('displayName')" />
              <p v-if="fieldErrors.displayName" class="field-error">{{ fieldErrors.displayName }}</p>
            </div>

            <div>
              <label class="field-label">Email</label>
              <input v-model="registerForm.email" type="email" autocomplete="email" required class="field-input" :class="{ 'field-input--error': fieldErrors.regEmail }" placeholder="vous@exemple.com" @blur="validateRegisterField('regEmail')" />
              <p v-if="fieldErrors.regEmail" class="field-error">{{ fieldErrors.regEmail }}</p>
            </div>

            <div>
              <label class="field-label">Mot de passe</label>
              <div class="relative">
                <input v-model="registerForm.password" :type="showRegPwd ? 'text' : 'password'" autocomplete="new-password" required class="field-input pr-10" :class="{ 'field-input--error': fieldErrors.regPassword }" placeholder="Minimum 6 caractères" @blur="validateRegisterField('regPassword')" />
                <button type="button" @click="showRegPwd = !showRegPwd" class="pwd-toggle">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path v-if="showRegPwd" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                    <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                </button>
              </div>
              <!-- Force du mot de passe -->
              <div v-if="registerForm.password" class="mt-2 space-y-1">
                <div class="flex gap-1">
                  <div v-for="i in 4" :key="i" class="h-1 flex-1 rounded-full transition-colors duration-300" :class="passwordStrength >= i ? strengthColor : 'bg-gray-200 dark:bg-gray-700'"></div>
                </div>
                <p class="text-xs" :class="strengthTextColor">{{ strengthLabel }}</p>
              </div>
              <p v-if="fieldErrors.regPassword" class="field-error">{{ fieldErrors.regPassword }}</p>
            </div>

            <div>
              <label class="field-label">Confirmer le mot de passe</label>
              <div class="relative">
                <input v-model="registerForm.confirmPassword" :type="showConfirmPwd ? 'text' : 'password'" autocomplete="new-password" required class="field-input pr-10" :class="{ 'field-input--error': fieldErrors.confirmPassword }" placeholder="••••••••" @blur="validateRegisterField('confirmPassword')" />
                <button type="button" @click="showConfirmPwd = !showConfirmPwd" class="pwd-toggle">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                </button>
              </div>
              <p v-if="fieldErrors.confirmPassword" class="field-error">{{ fieldErrors.confirmPassword }}</p>
            </div>

            <button type="submit" :disabled="formLoading" class="btn-submit">
              <span v-if="formLoading" class="spinner spinner--light"></span>
              <span>{{ formLoading ? 'Création…' : 'Créer mon compte' }}</span>
            </button>
          </form>
        </div>

        <!-- ── OTP VERIFICATION ────────────────────────────────────── -->
        <div v-else-if="activeTab === 'otp'" key="otp" class="space-y-5">
          <div class="text-center">
            <div class="w-14 h-14 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg class="w-7 h-7 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            </div>
            <h2 class="text-lg font-bold text-gray-900 dark:text-white">Vérifiez votre email</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Code envoyé à <strong>{{ otpEmail }}</strong></p>
          </div>

          <form @submit.prevent="handleOTP" class="space-y-4">
            <div>
              <label class="field-label text-center block">Code à 6 chiffres</label>
              <input
                v-model="otpCode"
                type="text"
                inputmode="numeric"
                maxlength="6"
                pattern="[0-9]*"
                required
                class="field-input text-center text-2xl tracking-[0.5em] font-mono"
                placeholder="000000"
              />
            </div>
            <button type="submit" :disabled="formLoading || otpCode.length < 6" class="btn-submit">
              <span v-if="formLoading" class="spinner spinner--light"></span>
              <span>{{ formLoading ? 'Vérification…' : 'Vérifier' }}</span>
            </button>
          </form>

          <div class="text-center space-y-2">
            <p class="text-sm text-gray-500">Pas reçu ?</p>
            <button @click="handleResendOTP" :disabled="resendCooldown > 0" class="text-sm text-[var(--color-primary)] hover:underline disabled:opacity-50 disabled:no-underline">
              {{ resendCooldown > 0 ? `Renvoyer dans ${resendCooldown}s` : 'Renvoyer le code' }}
            </button>
          </div>

          <button @click="switchTab('register')" class="w-full text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            ← Retour à l'inscription
          </button>
        </div>
      </Transition>

      <!-- Footer -->
      <p class="text-center text-xs text-gray-400 dark:text-gray-600 mt-6">
        En continuant, vous acceptez nos
        <a href="#" class="underline hover:text-gray-600 dark:hover:text-gray-400">CGU</a>
        et notre
        <a href="#" class="underline hover:text-gray-600 dark:hover:text-gray-400">politique de confidentialité</a>.
      </p>
    </div>

    <!-- Modal mot de passe oublié -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showForgotPassword" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" @click.self="showForgotPassword = false">
          <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-1">Mot de passe oublié</h3>
            <p class="text-sm text-gray-500 mb-4">Entrez votre email, nous vous enverrons un lien de réinitialisation.</p>
            <form @submit.prevent="handleForgotPassword" class="space-y-4">
              <input v-model="forgotEmail" type="email" required class="field-input" placeholder="vous@exemple.com" />
              <div v-if="forgotMsg" class="alert" :class="`alert--${forgotMsgType}`">
                <p>{{ forgotMsg }}</p>
              </div>
              <div class="flex gap-3">
                <button type="button" @click="showForgotPassword = false" class="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-600 dark:text-gray-400">Annuler</button>
                <button type="submit" :disabled="forgotLoading" class="flex-1 btn-submit">
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
import { useAuth } from '../composables/useAuth'
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'AuthPage',
  setup() {
    const { login, register, loginWithGoogle, loginWithApple, verifyOTP, resendOTP, resetPassword } = useAuth()
    const route  = useRoute()
    const router = useRouter()
    return { login, register, loginWithGoogle, loginWithApple, verifyOTP, resendOTP, resetPassword, route, router }
  },
  data() {
    return {
      activeTab: 'login',

      // Login form
      loginForm: { email: '', password: '', rememberMe: false },
      showLoginPwd: false,

      // Register form
      registerForm: { displayName: '', email: '', password: '', confirmPassword: '' },
      showRegPwd: false,
      showConfirmPwd: false,

      // OTP
      otpEmail: '',
      otpCode: '',
      resendCooldown: 0,

      // UI
      formLoading: false,
      oauthLoading: null,
      forgotLoading: false,
      alertMsg: '',
      alertType: 'error',
      fieldErrors: {},
      showForgotPassword: false,
      forgotEmail: '',
      forgotMsg: '',
      forgotMsgType: 'success',
    }
  },
  computed: {
    // Force du mot de passe (0-4)
    passwordStrength() {
      const p = this.registerForm.password
      if (!p) return 0
      let score = 0
      if (p.length >= 8) score++
      if (/[A-Z]/.test(p)) score++
      if (/[0-9]/.test(p)) score++
      if (/[^A-Za-z0-9]/.test(p)) score++
      return Math.max(score, p.length >= 6 ? 1 : 0)
    },
    strengthColor() {
      return ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'][this.passwordStrength] || 'bg-gray-200'
    },
    strengthTextColor() {
      return ['', 'text-red-500', 'text-orange-500', 'text-yellow-600', 'text-green-600'][this.passwordStrength] || ''
    },
    strengthLabel() {
      return ['', 'Faible', 'Moyen', 'Bon', 'Fort'][this.passwordStrength] || ''
    },
  },
  methods: {
    switchTab(tab) {
      this.activeTab = tab
      this.alertMsg  = ''
      this.fieldErrors = {}
    },

    showAlert(msg, type = 'error') {
      this.alertMsg  = msg
      this.alertType = type
      if (type === 'success') setTimeout(() => { this.alertMsg = '' }, 5000)
    },

    // ── Validation inline ──────────────────────────────────────────────────
    validateLoginField(field) {
      const errs = { ...this.fieldErrors }
      if (field === 'email') {
        errs.email = !this.loginForm.email ? 'Email obligatoire.'
          : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.loginForm.email) ? 'Email invalide.' : ''
      }
      if (field === 'password') {
        errs.password = !this.loginForm.password ? 'Mot de passe obligatoire.' : ''
      }
      this.fieldErrors = errs
    },
    validateRegisterField(field) {
      const errs = { ...this.fieldErrors }
      if (field === 'displayName')
        errs.displayName = !this.registerForm.displayName.trim() ? 'Nom obligatoire.' : ''
      if (field === 'regEmail')
        errs.regEmail = !this.registerForm.email ? 'Email obligatoire.'
          : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.registerForm.email) ? 'Email invalide.' : ''
      if (field === 'regPassword')
        errs.regPassword = !this.registerForm.password ? 'Mot de passe obligatoire.'
          : this.registerForm.password.length < 6 ? 'Minimum 6 caractères.' : ''
      if (field === 'confirmPassword')
        errs.confirmPassword = this.registerForm.confirmPassword !== this.registerForm.password
          ? 'Les mots de passe ne correspondent pas.' : ''
      this.fieldErrors = errs
    },
    isLoginValid() {
      this.validateLoginField('email')
      this.validateLoginField('password')
      return !this.fieldErrors.email && !this.fieldErrors.password
    },
    isRegisterValid() {
      ['displayName', 'regEmail', 'regPassword', 'confirmPassword'].forEach(f => this.validateRegisterField(f))
      return !this.fieldErrors.displayName && !this.fieldErrors.regEmail && !this.fieldErrors.regPassword && !this.fieldErrors.confirmPassword
    },

    // ── Auth handlers ──────────────────────────────────────────────────────
    async handleLogin() {
      if (!this.isLoginValid()) return
      this.formLoading = true
      this.alertMsg = ''
      const result = await this.login(this.loginForm.email, this.loginForm.password)
      this.formLoading = false
      if (result.success) {
        const redirect = this.route.query.redirect || '/'
        await this.router.push(redirect)
      } else {
        this.showAlert(result.error)
      }
    },

    async handleRegister() {
      if (!this.isRegisterValid()) return
      this.formLoading = true
      this.alertMsg = ''
      const result = await this.register(
        this.registerForm.email,
        this.registerForm.password,
        this.registerForm.displayName
      )
      this.formLoading = false
      if (result.success) {
        if (result.requiresEmailConfirmation) {
          this.otpEmail = this.registerForm.email
          this.activeTab = 'otp'
          this.startResendCooldown()
        } else {
          const redirect = this.route.query.redirect || '/'
          await this.router.push(redirect)
        }
      } else {
        this.showAlert(result.error)
      }
    },

    async handleOTP() {
      this.formLoading = true
      this.alertMsg = ''
      const result = await this.verifyOTP(this.otpEmail, this.otpCode)
      this.formLoading = false
      if (result.success) {
        this.showAlert('Email vérifié ! Bienvenue 🎉', 'success')
        setTimeout(() => this.router.push(this.route.query.redirect || '/'), 1000)
      } else {
        this.showAlert(result.error)
      }
    },

    async handleResendOTP() {
      const result = await this.resendOTP(this.otpEmail)
      if (result.success) {
        this.showAlert('Nouveau code envoyé !', 'success')
        this.startResendCooldown()
      } else {
        this.showAlert(result.error)
      }
    },

    startResendCooldown(seconds = 60) {
      this.resendCooldown = seconds
      const t = setInterval(() => {
        this.resendCooldown--
        if (this.resendCooldown <= 0) clearInterval(t)
      }, 1000)
    },

    async handleGoogle() {
      this.oauthLoading = 'google'
      this.alertMsg = ''
      const result = await this.loginWithGoogle()
      if (!result.success) {
        this.oauthLoading = null
        this.showAlert(result.error)
      }
      // Ne pas reset oauthLoading : la page va être redirigée par Supabase
    },

    async handleApple() {
      this.oauthLoading = 'apple'
      this.alertMsg = ''
      const result = await this.loginWithApple()
      if (!result.success) {
        this.oauthLoading = null
        this.showAlert(result.error)
      }
    },

    async handleForgotPassword() {
      this.forgotLoading = true
      this.forgotMsg = ''
      const result = await this.resetPassword(this.forgotEmail)
      this.forgotLoading = false
      this.forgotMsgType = result.success ? 'success' : 'error'
      this.forgotMsg = result.success ? result.message : result.error
      if (result.success) setTimeout(() => { this.showForgotPassword = false }, 3000)
    },
  },
}
</script>

<style scoped>
/* ── Layout ───────────────────────────────────────────────── */
.auth-page { position: relative; overflow: hidden; }

.auth-bg {
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
  overflow: hidden;
}
.blob {
  position: absolute; border-radius: 50%;
  filter: blur(80px); opacity: 0.25;
}
.blob-1 {
  width: 500px; height: 500px;
  background: radial-gradient(circle, #f97316, #fb923c);
  top: -200px; right: -150px;
}
.blob-2 {
  width: 400px; height: 400px;
  background: radial-gradient(circle, #3b82f6, #8b5cf6);
  bottom: -150px; left: -100px;
}

/* ── Card ─────────────────────────────────────────────────── */
.auth-card {
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.6);
  border-radius: 1.5rem;
  padding: 2rem;
  box-shadow: 0 20px 60px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.5);
}
.dark .auth-card {
  background: rgba(17,24,39,0.85);
  border-color: rgba(55,65,81,0.6);
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}

/* ── Tabs ─────────────────────────────────────────────────── */
.tab-switcher {
  display: flex;
  background: #f3f4f6;
  border-radius: 0.875rem;
  padding: 3px;
  margin-bottom: 1.5rem;
  gap: 3px;
}
.dark .tab-switcher { background: #1f2937; }
.tab-btn {
  flex: 1; padding: 0.5rem 1rem;
  font-size: 0.875rem; font-weight: 600;
  border-radius: 0.75rem;
  color: #6b7280;
  transition: all 0.2s ease;
}
.dark .tab-btn { color: #9ca3af; }
.tab-btn.active {
  background: white;
  color: #111827;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
}
.dark .tab-btn.active { background: #374151; color: #f9fafb; }

/* ── Alert ────────────────────────────────────────────────── */
.alert {
  display: flex; align-items: flex-start; gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
}
.alert--error { background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; }
.alert--success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; }
.dark .alert--error { background: rgba(239,68,68,.15); border-color: rgba(239,68,68,.3); color: #fca5a5; }
.dark .alert--success { background: rgba(34,197,94,.15); border-color: rgba(34,197,94,.3); color: #86efac; }

/* ── OAuth buttons ────────────────────────────────────────── */
.oauth-btn {
  width: 100%;
  display: flex; align-items: center; justify-content: center; gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.875rem;
  border: 1.5px solid #e5e7eb;
  background: white;
  color: #374151;
  font-size: 0.9rem; font-weight: 600;
  transition: all 0.18s ease;
  cursor: pointer;
}
.oauth-btn:hover:not(:disabled) {
  border-color: #d1d5db;
  background: #f9fafb;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transform: translateY(-1px);
}
.oauth-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.oauth-btn--apple { background: #000; color: #fff; border-color: #000; }
.oauth-btn--apple:hover:not(:disabled) { background: #1a1a1a; border-color: #1a1a1a; }
.dark .oauth-btn { background: #1f2937; border-color: #374151; color: #f9fafb; }
.dark .oauth-btn:hover:not(:disabled) { background: #374151; border-color: #4b5563; }
.dark .oauth-btn--apple { background: #fff; color: #000; border-color: #fff; }

/* ── Divider ──────────────────────────────────────────────── */
.divider {
  display: flex; align-items: center; gap: 0.75rem;
  color: #9ca3af; font-size: 0.8rem;
}
.divider::before, .divider::after {
  content: ''; flex: 1; height: 1px; background: #e5e7eb;
}
.dark .divider::before, .dark .divider::after { background: #374151; }

/* ── Form fields ──────────────────────────────────────────── */
.field-label {
  display: block;
  font-size: 0.8rem; font-weight: 600;
  color: #374151;
  margin-bottom: 0.375rem;
}
.dark .field-label { color: #d1d5db; }
.field-input {
  width: 100%; padding: 0.65rem 0.875rem;
  border-radius: 0.75rem;
  border: 1.5px solid #e5e7eb;
  background: white;
  color: #111827;
  font-size: 0.875rem;
  transition: border-color 0.15s, box-shadow 0.15s;
  outline: none;
}
.field-input::placeholder { color: #9ca3af; }
.field-input:focus { border-color: #f97316; box-shadow: 0 0 0 3px rgba(249,115,22,0.12); }
.field-input--error { border-color: #f87171 !important; }
.dark .field-input { background: #1f2937; border-color: #374151; color: #f9fafb; }
.dark .field-input:focus { border-color: #f97316; box-shadow: 0 0 0 3px rgba(249,115,22,0.2); }
.field-error { font-size: 0.75rem; color: #ef4444; margin-top: 0.25rem; }

/* ── Password toggle ──────────────────────────────────────── */
.pwd-toggle {
  position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%);
  color: #9ca3af; padding: 0.25rem;
  transition: color 0.15s;
}
.pwd-toggle:hover { color: #374151; }
.dark .pwd-toggle:hover { color: #d1d5db; }

/* ── Submit button ────────────────────────────────────────── */
.btn-submit {
  width: 100%; padding: 0.75rem;
  background: linear-gradient(135deg, #f97316, #ea580c);
  color: white; font-size: 0.9rem; font-weight: 700;
  border-radius: 0.875rem;
  display: flex; align-items: center; justify-content: center; gap: 0.5rem;
  transition: all 0.18s ease;
  cursor: pointer;
}
.btn-submit:hover:not(:disabled) {
  background: linear-gradient(135deg, #ea580c, #c2410c);
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(249,115,22,0.4);
}
.btn-submit:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

/* ── Spinner ──────────────────────────────────────────────── */
.spinner {
  width: 1rem; height: 1rem;
  border: 2px solid rgba(0,0,0,0.15);
  border-top-color: #374151;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block; flex-shrink: 0;
}
.spinner--light { border-color: rgba(255,255,255,0.3); border-top-color: white; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Transitions ──────────────────────────────────────────── */
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.2s ease; }
.slide-down-enter-from { opacity: 0; transform: translateY(-8px); }
.slide-down-leave-to { opacity: 0; transform: translateY(-8px); }

.fade-tab-enter-active, .fade-tab-leave-active { transition: all 0.18s ease; }
.fade-tab-enter-from { opacity: 0; transform: translateX(8px); }
.fade-tab-leave-to { opacity: 0; transform: translateX(-8px); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
