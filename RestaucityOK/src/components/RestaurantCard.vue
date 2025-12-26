\`\`\`vue file="src/components/RestaurantCard.vue"
<script>
import { useAuth } from '../composables/useAuth'
import { useRestaurants } from '../composables/useRestaurants'

export default {
  name: 'RestaurantCard',
  props: {
    restaurant: {
      type: Object,
      required: true
    }
  },
  setup() {
    const { user } = useAuth()
    const { toggleFavorite, isFavorite: checkFavorite } = useRestaurants()
    
    return {
      user,
      toggleFavorite,
      checkFavorite
    }
  },
  data() {
    return {
      isFavorite: false,
      loading: false
    }
  },
  mounted() {
    this.loadFavoriteStatus()
  },
  methods: {
    async loadFavoriteStatus() {
      if (this.user) {
        this.isFavorite = await this.checkFavorite(this.restaurant.id, this.user.uid)
      } else {
        // Fallback to localStorage for non-authenticated users
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
        this.isFavorite = favorites.includes(this.restaurant.id)
      }
    },

    async toggleFavoriteHandler() {
      this.loading = true
      
      if (this.user) {
        const result = await this.toggleFavorite(this.restaurant.id, this.user.uid)
        if (result.success) {
          this.isFavorite = result.isFavorite
          this.$emit('favorite-changed', { id: this.restaurant.id, isFavorite: this.isFavorite })
        }
      } else {
        // Fallback to localStorage for non-authenticated users
        this.isFavorite = !this.isFavorite
        
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
        
        if (this.isFavorite) {
          favorites.push(this.restaurant.id)
        } else {
          const index = favorites.indexOf(this.restaurant.id)
          if (index > -1) favorites.splice(index, 1)
        }
        
        localStorage.setItem('favorites', JSON.stringify(favorites))
        this.$emit('favorite-changed', { id: this.restaurant.id, isFavorite: this.isFavorite })
      }
      
      this.loading = false
    },

    viewDetails() {
      this.$router.push(`/restaurant/${this.restaurant.id}`)
    }
  }
}
</script>

<template>
  <div class="bg-white dark:bg-gray-900 rounded-xl shadow-md dark:shadow-gray-900/50 overflow-hidden hover:shadow-lg dark:hover:shadow-gray-900/70 transition-all cursor-pointer group border border-gray-200 dark:border-gray-800" @click="viewDetails">
    <div class="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-800">
      <!-- Changed restaurant.photo to restaurant.photos to match Supabase schema -->
      <img 
        :src="restaurant.photos && restaurant.photos.length > 0 ? restaurant.photos[0] : '/placeholder.svg?height=192&width=300'" 
        :alt="restaurant.nom" 
        class="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" 
      />
      
      <!-- Updated badge logic -->
      <div v-if="restaurant.badge" class="absolute top-3 left-3 px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full shadow-md">
        {{ restaurant.badge }}
      </div>
      
      <button 
        @click.stop="toggleFavoriteHandler"
        :disabled="loading"
        class="absolute top-3 right-3 w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform disabled:opacity-50"
      >
        <svg 
          class="w-5 h-5" 
          :class="isFavorite ? 'fill-red-500 stroke-red-500' : 'fill-none stroke-gray-600 dark:stroke-gray-400'"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>
    </div>
    
    <div class="p-4">
      <div class="flex items-start justify-between mb-2">
        <div class="flex-1">
          <!-- Updated to use Firebase field names -->
          <h3 class="text-lg font-bold text-[var(--color-text)] mb-1 text-balance">{{ restaurant.nom }}</h3>
          <p class="text-sm text-[var(--color-text-secondary)]">{{ restaurant.type || 'Restaurant' }}</p>
        </div>
      </div>
      
      <div class="flex items-center gap-4 mb-3">
        <!-- Replaced emoji with yellow star icon -->
        <div class="flex items-center gap-1">
          <svg class="w-5 h-5 fill-yellow-400" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span class="font-semibold text-[var(--color-text)]">{{ restaurant.note || 0 }}</span>
          <span class="text-sm text-[var(--color-text-secondary)]">({{ restaurant.reviewCount || restaurant.avis?.length || 0 }})</span>
        </div>
        
        <!-- Updated to use Firebase prix field -->
        <div v-if="restaurant.prix" class="flex items-center gap-1">
          <span class="text-sm font-semibold text-[var(--color-primary)]">{{ restaurant.prix }}</span>
        </div>
      </div>
      
      <!-- Display short address on card -->
      <div class="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] mb-3">
        <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span class="line-clamp-1">{{ restaurant.adresse }}</span>
      </div>
      
      <button class="w-full px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors font-medium">
        Voir les détails
      </button>
    </div>
  </div>
</template>
