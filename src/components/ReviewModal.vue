<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        @click.self="close"
      >
        <div class="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-lg w-full p-6 relative">
          <!-- Close -->
          <button @click="close" class="absolute top-4 right-4 p-2 hover:bg-[var(--color-surface)] rounded-lg transition-colors">
            <svg class="w-5 h-5 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h2 class="text-2xl font-bold text-[var(--color-text)] mb-1">Donner votre avis</h2>
          <p class="text-sm text-[var(--color-text-secondary)] mb-6">{{ restaurantName }}</p>

          <!-- Messages -->
          <div v-if="successMessage" class="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p class="text-sm text-green-600 dark:text-green-400">{{ successMessage }}</p>
          </div>
          <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p class="text-sm text-red-600 dark:text-red-400">{{ errorMessage }}</p>
          </div>

          <!-- Non connecté -->
          <div v-if="!isAuthenticated" class="mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <p class="text-sm text-orange-600 dark:text-orange-400">Vous devez être connecté pour laisser un avis.</p>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <!-- Note -->
            <div>
              <label class="block text-sm font-medium text-[var(--color-text)] mb-2">Note</label>
              <div class="flex gap-2">
                <button
                  v-for="i in 5"
                  :key="i"
                  type="button"
                  @click="rating = i"
                  class="p-1 hover:scale-110 transition-transform"
                  :aria-label="`${i} étoile${i > 1 ? 's' : ''}`"
                >
                  <svg
                    class="w-8 h-8 transition-colors"
                    :class="i <= rating ? 'fill-yellow-400' : 'fill-gray-200 dark:fill-gray-700'"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </button>
              </div>
              <p v-if="rating > 0" class="text-xs text-[var(--color-text-secondary)] mt-1">
                {{ ratingLabel }}
              </p>
            </div>

            <!-- Commentaire -->
            <div>
              <label class="block text-sm font-medium text-[var(--color-text)] mb-2">Votre commentaire</label>
              <textarea
                v-model="comment"
                required
                rows="4"
                class="w-full px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--color-text)] resize-none"
                placeholder="Partagez votre expérience..."
              ></textarea>
              <p class="text-xs text-[var(--color-text-secondary)] mt-1 text-right">{{ comment.length }}/500</p>
            </div>

            <!-- Submit -->
            <button
              type="submit"
              :disabled="loading || rating === 0 || !isAuthenticated"
              class="w-full px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ loading ? 'Publication...' : isAuthenticated ? 'Publier mon avis' : 'Connexion requise' }}
            </button>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import { supabase } from '../config/supabaseConfig.js'
import { useAuth } from '../composables/useAuth'

export default {
  name: 'ReviewModal',
  props: {
    isOpen: { type: Boolean, default: false },
    restaurantId: { type: [String, Number], required: true },
    restaurantName: { type: String, required: true },
    userName: { type: String, required: true },
    userId: { type: String, required: true },
  },
  emits: ['close', 'success'],
  setup() {
    const { user } = useAuth()
    return { user }
  },
  data() {
    return {
      rating: 0,
      comment: '',
      loading: false,
      errorMessage: '',
      successMessage: '',
    }
  },
  computed: {
    isAuthenticated() {
      return !!this.user
    },
    ratingLabel() {
      const labels = ['', 'Très mauvais', 'Mauvais', 'Correct', 'Bien', 'Excellent']
      return labels[this.rating] || ''
    },
  },
  methods: {
    close() {
      this.$emit('close')
      this.resetForm()
    },
    resetForm() {
      this.rating = 0
      this.comment = ''
      this.errorMessage = ''
      this.successMessage = ''
      this.loading = false
    },
    async handleSubmit() {
      if (!this.isAuthenticated) { this.errorMessage = 'Vous devez être connecté'; return }
      if (this.rating === 0) { this.errorMessage = 'Veuillez sélectionner une note'; return }
      if (!this.comment.trim()) { this.errorMessage = 'Veuillez écrire un commentaire'; return }

      this.loading = true
      this.errorMessage = ''

      try {
        const { error: insertError } = await supabase.from('reviews').insert([{
          restaurant_id: String(this.restaurantId),
          user_id: this.userId,
          user_name: this.userName,
          rating: this.rating,
          comment: this.comment.trim(),
          created_at: new Date().toISOString(),
        }])

        if (insertError) throw insertError

        // Mettre à jour la note moyenne du restaurant
        const { data: allReviews } = await supabase
          .from('reviews')
          .select('rating')
          .eq('restaurant_id', String(this.restaurantId))

        if (allReviews?.length) {
          const avg = parseFloat(
            (allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length).toFixed(1)
          )
          await supabase
            .from('restaurants')
            .update({ note: avg })
            .eq('restaurant_id', String(this.restaurantId))
        }

        this.successMessage = 'Votre avis a été publié avec succès !'
        setTimeout(() => { this.$emit('success'); this.close() }, 1200)
      } catch (error) {
        console.error('[ReviewModal] Error:', error)
        this.errorMessage = 'Erreur lors de la publication. Veuillez réessayer.'
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
