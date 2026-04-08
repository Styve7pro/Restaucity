<template>
  <div class="min-h-screen bg-[var(--color-surface)]">
    <Navbar>
      <template #actions>
        <button class="p-2 hover:bg-[var(--color-surface)] rounded-lg transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
      </template>
    </Navbar>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Hero Section -->
      <div class="mb-8">
        <h1 class="text-3xl lg:text-4xl font-bold text-[var(--color-text)] mb-2 text-balance">
          Arrête de chercher. Commence à savourer
        </h1>
        <p class="text-[var(--color-text-secondary)] text-lg">
          Trouve ton resto parfait sans mauvaise surprise
        </p>
      </div>

      <!-- Search Bar -->
      <div class="mb-6">
        <SearchBar @search="handleSearch" @toggle-filters="showFilters = !showFilters" />
      </div>

      <!-- Filters Panel -->
      <div v-if="showFilters" class="mb-6 p-4 bg-white rounded-xl shadow-[var(--shadow-md)]">
        <h3 class="font-semibold text-[var(--color-text)] mb-4">Filtres</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Cuisine Type -->
          <div>
            <label class="block text-sm font-medium text-[var(--color-text)] mb-2">Type de cuisine</label>
            <select v-model="filters.cuisine" class="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-20">
              <option value="">Tous</option>
              <option v-for="cuisine in cuisineTypes" :key="cuisine" :value="cuisine">{{ cuisine }}</option>
            </select>
          </div>

          <!-- Price Range -->
          <div>
            <label class="block text-sm font-medium text-[var(--color-text)] mb-2">Prix</label>
            <select v-model="filters.price" class="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-20">
              <option value="">Tous</option>
              <option v-for="price in priceRanges" :key="price" :value="price">{{ price }}</option>
            </select>
          </div>

          <!-- Rating -->
          <div>
            <label class="block text-sm font-medium text-[var(--color-text)] mb-2">Note minimum</label>
            <select v-model="filters.rating" class="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-20">
              <option value="">Toutes</option>
              <option value="4.5">4.5+</option>
              <option value="4.0">4.0+</option>
              <option value="3.5">3.5+</option>
            </select>
          </div>
        </div>

        <div class="mt-4 flex gap-3">
          <button @click="applyFilters" class="px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors font-medium">
            Appliquer
          </button>
          <button @click="resetFilters" class="px-6 py-2 bg-[var(--color-surface)] text-[var(--color-text)] rounded-lg hover:bg-[var(--color-surface-dark)] transition-colors font-medium">
            Réinitialiser
          </button>
        </div>
      </div>

      <!-- Image Slider -->
      <div class="mb-8 bg-white dark:bg-gray-900 rounded-xl shadow-md dark:shadow-gray-900/50 overflow-hidden border border-gray-200 dark:border-gray-800">
        <!-- Changed interval from 5000ms to 3000ms (3 seconds) -->
        <ImageSlider :images="sliderImages" :autoPlay="true" :interval="3000" />
      </div>

      <!-- Restaurants Grid -->
      <div>
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-[var(--color-text)]">Restaurants populaires</h2>
          <button class="text-[var(--color-primary)] font-medium hover:underline">
            Voir tout
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <RestaurantCard 
            v-for="restaurant in filteredRestaurants" 
            :key="restaurant.id" 
            :restaurant="restaurant"
            @favorite-changed="handleFavoriteChanged"
          />
        </div>

        <!-- Empty State -->
        <div v-if="filteredRestaurants.length === 0" class="text-center py-12">
          <svg class="w-16 h-16 mx-auto mb-4 text-[var(--color-text-light)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-[var(--color-text-secondary)] text-lg">Aucun restaurant trouvé</p>
          <p class="text-[var(--color-text-light)] text-sm mt-1">Essayez de modifier vos filtres</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Navbar from '../components/Navbar.vue'
import SearchBar from '../components/SearchBar.vue'
import RestaurantCard from '../components/RestaurantCard.vue'
import ImageSlider from '../components/ImageSlider.vue'
import { useRestaurants } from '../composables/useRestaurants'
import { onMounted, ref } from 'vue'
// <CHANGE> Removed Firebase imports, using Supabase instead
import { supabase } from '../config/supabaseConfig'

export default {
  name: 'Home',
  components: {
    Navbar,
    SearchBar,
    RestaurantCard,
    ImageSlider
  },
  setup() {
    const { restaurants, loading, error, fetchRestaurants } = useRestaurants()
    const sliderImages = ref([])
    
    // <CHANGE> Migrated from Firebase to Supabase
    const fetchSliderImages = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('slider_images')
          .select('*')
          .order('order', { ascending: true })
        
        if (fetchError) throw fetchError
        
        sliderImages.value = (data || []).map(item => item.url)
        
        console.log('[v0] Loaded slider images:', sliderImages.value.length)
      } catch (err) {
        console.error('[v0] Error loading slider images:', err)
        sliderImages.value = []
      }
    }
    
    onMounted(() => {
      console.log('[v0] Home mounted, checking if restaurants need fetching')
      // Only fetch if restaurants are empty
      if (restaurants.value.length === 0) {
        console.log('[v0] No restaurants in cache, fetching from Supabase')
        fetchRestaurants()
      } else {
        console.log('[v0] Restaurants already loaded:', restaurants.value.length)
      }
      fetchSliderImages()
    })
    
    return { restaurants, loading, error, sliderImages }
  },
  data() {
    return {
      showFilters: false,
      searchQuery: '',
      filters: {
        cuisine: '',
        price: '',
        rating: ''
      },
    }
  },
  computed: {
    cuisineTypes() {
      const types = [...new Set(this.restaurants.map(r => r.type).filter(Boolean))]
      return types.sort()
    },
    
    priceRanges() {
      const ranges = [...new Set(this.restaurants.map(r => r.prix).filter(Boolean))]
      return ranges.sort()
    },
    
    filteredRestaurants() {
      let results = this.restaurants

      // Search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        results = results.filter(r => 
          r.nom.toLowerCase().includes(query) || 
          (r.type && r.type.toLowerCase().includes(query))
        )
      }

      // Cuisine filter
      if (this.filters.cuisine) {
        results = results.filter(r => r.type === this.filters.cuisine)
      }

      // Price filter
      if (this.filters.price) {
        results = results.filter(r => r.prix === this.filters.price)
      }

      // Rating filter
      if (this.filters.rating) {
        results = results.filter(r => (r.note || 0) >= parseFloat(this.filters.rating))
      }

      return results
    }
  },
  methods: {
    handleSearch(query) {
      this.searchQuery = query
    },
    applyFilters() {
      this.showFilters = false
    },
    resetFilters() {
      this.filters = {
        cuisine: '',
        price: '',
        rating: ''
      }
      this.searchQuery = ''
    },
    handleFavoriteChanged(data) {
      console.log('[v0] Favorite changed:', data)
    }
  }
}
</script>
