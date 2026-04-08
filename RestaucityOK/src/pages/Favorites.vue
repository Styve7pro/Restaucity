<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <Navbar />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Mes favoris</h1>
        <p class="text-gray-600 dark:text-gray-400">
          {{ favoriteRestaurants.length }} restaurant{{ favoriteRestaurants.length > 1 ? 's' : '' }} sauvegardé{{ favoriteRestaurants.length > 1 ? 's' : '' }}
        </p>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="text-center py-16">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600 dark:text-gray-400">Chargement de vos favoris...</p>
      </div>

      <!-- Favorites Grid -->
      <div v-else-if="favoriteRestaurants.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <RestaurantCard 
          v-for="restaurant in favoriteRestaurants" 
          :key="restaurant.id" 
          :restaurant="restaurant"
          @favorite-changed="handleFavoriteChanged"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-16">
        <svg class="w-20 h-20 mx-auto mb-4 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Aucun favori pour le moment</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6">Commencez à ajouter vos restaurants préférés</p>
        <router-link 
          to="/" 
          class="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
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
import { useAuth } from '../composables/useAuth'
import { useRestaurants } from '../composables/useRestaurants'

export default {
  name: 'Favorites',
  components: {
    Navbar,
    RestaurantCard
  },
  setup() {
    const { user } = useAuth()
    const { getUserFavorites, fetchRestaurants, restaurants } = useRestaurants()
    
    return {
      user,
      getUserFavorites,
      fetchRestaurants,
      allRestaurants: restaurants
    }
  },
  data() {
    return {
      favoriteRestaurants: [],
      loading: false
    }
  },
  async mounted() {
    await this.loadFavorites()
  },
  methods: {
    async loadFavorites() {
      this.loading = true
      
      try {
        await this.fetchRestaurants()
        
        if (this.user) {
          // Use Firebase for authenticated users
          this.favoriteRestaurants = await this.getUserFavorites(this.user.uid)
        } else {
          // Fallback to localStorage for non-authenticated users
          const favoriteIds = JSON.parse(localStorage.getItem('favorites') || '[]')
          this.favoriteRestaurants = this.allRestaurants.filter(r => favoriteIds.includes(r.id))
        }
      } catch (error) {
        console.error('[v0] Error loading favorites:', error)
      } finally {
        this.loading = false
      }
    },

    handleFavoriteChanged(data) {
      if (!data.isFavorite) {
        this.favoriteRestaurants = this.favoriteRestaurants.filter(r => r.id !== data.id)
      }
    }
  }
}
</script>
