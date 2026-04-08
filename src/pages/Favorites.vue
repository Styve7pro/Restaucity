<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <Navbar />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Mes favoris</h1>
        <p class="text-gray-600 dark:text-gray-400">
          <template v-if="!loading">
            {{ favoriteRestaurants.length }}
            restaurant{{ favoriteRestaurants.length > 1 ? 's' : '' }}
            sauvegardé{{ favoriteRestaurants.length > 1 ? 's' : '' }}
          </template>
        </p>
      </div>

      <!-- Skeleton loading -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SkeletonCard v-for="i in 3" :key="`sk-${i}`" />
      </div>

      <!-- Résultats -->
      <div v-else-if="favoriteRestaurants.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <RestaurantCard
          v-for="restaurant in favoriteRestaurants"
          :key="restaurant.id"
          :restaurant="restaurant"
          @favorite-changed="handleFavoriteChanged"
        />
      </div>

      <!-- Vide -->
      <div v-else class="text-center py-16">
        <div class="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-10 h-10 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Aucun favori pour le moment</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6">Commencez à ajouter vos restaurants préférés</p>
        <router-link
          to="/"
          class="inline-block px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors font-medium"
        >
          Découvrir des restaurants
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import Navbar from '../components/Navbar.vue'
import RestaurantCard from '../components/RestaurantCard.vue'
import SkeletonCard from '../components/ui/SkeletonCard.vue'
import { useAuth } from '../composables/useAuth'
import { useRestaurants } from '../composables/useRestaurants'

export default {
  name: 'Favorites',
  components: { Navbar, RestaurantCard, SkeletonCard },
  setup() {
    const { user } = useAuth()
    const { getUserFavorites, fetchRestaurants, restaurants } = useRestaurants()
    return { user, getUserFavorites, fetchRestaurants, allRestaurants: restaurants }
  },
  data() {
    return {
      favoriteRestaurants: [],
      loading: false,
    }
  },
  async mounted() {
    await this.loadFavorites()
  },
  methods: {
    async loadFavorites() {
      this.loading = true
      try {
        if (this.user) {
          this.favoriteRestaurants = await this.getUserFavorites()
        } else {
          if (this.allRestaurants.length === 0) await this.fetchRestaurants()
          const ids = JSON.parse(localStorage.getItem('favorites') || '[]')
          this.favoriteRestaurants = this.allRestaurants.filter((r) => ids.includes(r.id))
        }
      } catch (err) {
        console.error('[Favorites] loadFavorites error:', err)
      } finally {
        this.loading = false
      }
    },
    handleFavoriteChanged(data) {
      if (!data.isFavorite) {
        this.favoriteRestaurants = this.favoriteRestaurants.filter((r) => r.id !== data.id)
      }
    },
  },
}
</script>
