<template>
  <div class="min-h-screen bg-[var(--color-surface)]">
    <Navbar>
      <template #actions>
        <button class="p-2 hover:bg-[var(--color-surface)] rounded-lg transition-colors">
          <svg class="w-6 h-6 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
      </template>
    </Navbar>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Hero -->
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
      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div v-if="showFilters" class="mb-6 p-4 bg-white dark:bg-gray-900 rounded-xl shadow-md dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-800">
          <h3 class="font-semibold text-[var(--color-text)] mb-4">Filtres</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-[var(--color-text)] mb-2">Type de cuisine</label>
              <select v-model="filters.cuisine" class="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] bg-white dark:bg-gray-800 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-20">
                <option value="">Tous</option>
                <option v-for="cuisine in cuisineTypes" :key="cuisine" :value="cuisine">{{ cuisine }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-[var(--color-text)] mb-2">Prix</label>
              <select v-model="filters.price" class="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] bg-white dark:bg-gray-800 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-20">
                <option value="">Tous</option>
                <option v-for="price in priceRanges" :key="price" :value="price">{{ price }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-[var(--color-text)] mb-2">Note minimum</label>
              <select v-model="filters.rating" class="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] bg-white dark:bg-gray-800 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-20">
                <option value="">Toutes</option>
                <option value="4.5">4.5+</option>
                <option value="4.0">4.0+</option>
                <option value="3.5">3.5+</option>
              </select>
            </div>
          </div>
          <div class="mt-4 flex gap-3">
            <button @click="showFilters = false" class="px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors font-medium">
              Appliquer
            </button>
            <button @click="resetFilters" class="px-6 py-2 bg-[var(--color-surface)] text-[var(--color-text)] rounded-lg hover:bg-[var(--color-surface-dark)] transition-colors font-medium">
              Réinitialiser
            </button>
          </div>
        </div>
      </Transition>

      <!-- Image Slider -->
      <div class="mb-8 bg-white dark:bg-gray-900 rounded-xl shadow-md dark:shadow-gray-900/50 overflow-hidden border border-gray-200 dark:border-gray-800">
        <ImageSlider :images="sliderImages" :autoPlay="true" :interval="3000" />
      </div>

      <!-- Restaurants Grid -->
      <div>
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-[var(--color-text)]">
            Restaurants
            <span v-if="!loading" class="text-base font-normal text-[var(--color-text-secondary)] ml-2">
              ({{ filteredRestaurants.length }})
            </span>
          </h2>
        </div>

        <!-- Skeletons pendant le chargement -->
        <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard v-for="i in 6" :key="`sk-${i}`" />
        </div>

        <!-- Erreur -->
        <div v-else-if="error" class="text-center py-12">
          <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p class="text-[var(--color-text)] font-semibold mb-2">Erreur de chargement</p>
          <p class="text-[var(--color-text-secondary)] mb-4">{{ error }}</p>
          <button @click="fetchRestaurants(true)" class="px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors font-medium">
            Réessayer
          </button>
        </div>

        <!-- Données -->
        <div v-else-if="filteredRestaurants.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <RestaurantCard
            v-for="restaurant in filteredRestaurants"
            :key="restaurant.id"
            :restaurant="restaurant"
            @favorite-changed="handleFavoriteChanged"
          />
        </div>

        <!-- Vide -->
        <div v-else class="text-center py-12">
          <svg class="w-16 h-16 mx-auto mb-4 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-[var(--color-text)] text-lg font-semibold mb-1">Aucun restaurant trouvé</p>
          <p class="text-[var(--color-text-secondary)] text-sm">Essayez de modifier vos filtres</p>
          <button @click="resetFilters" class="mt-4 px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors font-medium">
            Réinitialiser les filtres
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import Navbar from '../components/Navbar.vue'
import SearchBar from '../components/SearchBar.vue'
import RestaurantCard from '../components/RestaurantCard.vue'
import ImageSlider from '../components/ImageSlider.vue'
import SkeletonCard from '../components/ui/SkeletonCard.vue'
import { useRestaurants } from '../composables/useRestaurants'
import { useDebounce } from '../composables/useDebounce'
import { supabase } from '../config/supabaseConfig'

export default {
  name: 'Home',
  components: { Navbar, SearchBar, RestaurantCard, ImageSlider, SkeletonCard },
  setup() {
    const { restaurants, loading, error, fetchRestaurants } = useRestaurants()
    const sliderImages = ref([])
    const rawSearch = ref('')
    const debouncedSearch = useDebounce(rawSearch, 350)

    const fetchSliderImages = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('slider_images')
          .select('*')
          .order('order', { ascending: true })
        if (fetchError) throw fetchError
        sliderImages.value = (data || []).map((item) => item.url)
      } catch (err) {
        console.error('[Home] fetchSliderImages error:', err)
        sliderImages.value = []
      }
    }

    onMounted(async () => {
      await Promise.all([
        restaurants.value.length === 0 ? fetchRestaurants() : Promise.resolve(),
        fetchSliderImages(),
      ])
    })

    return { restaurants, loading, error, fetchRestaurants, sliderImages, rawSearch, debouncedSearch }
  },
  data() {
    return {
      showFilters: false,
      filters: { cuisine: '', price: '', rating: '' },
    }
  },
  computed: {
    cuisineTypes() {
      return [...new Set(this.restaurants.map((r) => r.type).filter(Boolean))].sort()
    },
    priceRanges() {
      return [...new Set(this.restaurants.map((r) => r.prix).filter(Boolean))].sort()
    },
    filteredRestaurants() {
      const query = (this.debouncedSearch || '').toLowerCase()
      return this.restaurants.filter((r) => {
        const matchSearch =
          !query ||
          r.nom.toLowerCase().includes(query) ||
          (r.type && r.type.toLowerCase().includes(query))
        const matchCuisine = !this.filters.cuisine || r.type === this.filters.cuisine
        const matchPrice = !this.filters.price || r.prix === this.filters.price
        const matchRating =
          !this.filters.rating || (r.note || 0) >= parseFloat(this.filters.rating)
        return matchSearch && matchCuisine && matchPrice && matchRating
      })
    },
  },
  methods: {
    handleSearch(query) {
      this.rawSearch = query
    },
    resetFilters() {
      this.filters = { cuisine: '', price: '', rating: '' }
      this.rawSearch = ''
      this.showFilters = false
    },
    handleFavoriteChanged(data) {
      console.log('[Home] Favorite changed:', data)
    },
  },
}
</script>
