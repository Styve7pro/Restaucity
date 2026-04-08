<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <Navbar>
      <template #actions>
        <button
          @click="$router.back()"
          class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          aria-label="Retour"
        >
          <svg class="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
      </template>
    </Navbar>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center min-h-[60vh]">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto mb-4"></div>
        <p class="text-[var(--color-text-secondary)]">Chargement du restaurant…</p>
      </div>
    </div>

    <!-- Not found -->
    <div v-else-if="!restaurant" class="flex flex-col items-center justify-center min-h-[60vh]">
      <svg class="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-[var(--color-text)] text-lg font-semibold mb-2">Restaurant introuvable</p>
      <button @click="$router.push('/')" class="px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors">
        Retour à l'accueil
      </button>
    </div>

    <!-- Content -->
    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

      <!-- Header card -->
      <div class="bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden mb-6 border border-gray-200 dark:border-gray-800">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-0">

          <!-- Photos -->
          <div class="p-4 bg-gray-50 dark:bg-gray-800">
            <div v-if="restaurant.photos && restaurant.photos.length > 0">
              <!-- Mobile: 2 cols -->
              <div class="grid grid-cols-2 gap-2 md:hidden">
                <img
                  v-for="(photo, i) in restaurant.photos.slice(0, 6)"
                  :key="i"
                  :src="photo"
                  :alt="`${restaurant.nom} - Photo ${i + 1}`"
                  loading="lazy"
                  class="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  @click="openImageModal(i)"
                  @error="(e) => e.target.src = '/placeholder.svg'"
                />
              </div>
              <button v-if="restaurant.photos.length > 6" @click="openImageModal(6)" class="mt-2 w-full md:hidden px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium">
                +{{ restaurant.photos.length - 6 }} photos
              </button>

              <!-- Desktop: 4 cols -->
              <div class="hidden md:grid md:grid-cols-4 gap-2">
                <img
                  v-for="(photo, i) in restaurant.photos.slice(0, 20)"
                  :key="i"
                  :src="photo"
                  :alt="`${restaurant.nom} - Photo ${i + 1}`"
                  loading="lazy"
                  class="w-full h-28 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  @click="openImageModal(i)"
                  @error="(e) => e.target.src = '/placeholder.svg'"
                />
              </div>
              <button v-if="restaurant.photos.length > 20" @click="openImageModal(20)" class="mt-2 w-full hidden md:flex px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium items-center justify-center">
                +{{ restaurant.photos.length - 20 }} photos
              </button>
            </div>
            <div v-else class="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <!-- Info -->
          <div class="p-6 flex flex-col justify-between">
            <div>
              <div class="flex items-start justify-between mb-4">
                <div class="flex-1 min-w-0">
                  <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1 leading-tight">{{ restaurant.nom }}</h1>
                  <p class="text-gray-600 dark:text-gray-400 text-lg">{{ restaurant.type || 'Restaurant' }}</p>
                </div>
                <button
                  @click="toggleFavoriteHandler"
                  :disabled="favoriteLoading"
                  class="ml-4 w-12 h-12 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors flex-shrink-0 disabled:opacity-50"
                >
                  <svg class="w-6 h-6" :class="isFavorite ? 'fill-red-500 stroke-red-500' : 'fill-none stroke-gray-600 dark:stroke-gray-400'" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>

              <!-- Rating + prix -->
              <div class="flex items-center gap-6 mb-4 flex-wrap">
                <div class="flex items-center gap-2">
                  <svg class="w-6 h-6 fill-yellow-400" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span class="text-xl font-bold text-gray-900 dark:text-gray-100">{{ restaurant.note || 0 }}</span>
                  <span class="text-gray-500">({{ reviews.length }} avis)</span>
                </div>
                <span v-if="restaurant.prix" class="text-lg font-semibold text-[var(--color-primary)]">{{ restaurant.prix }}</span>
              </div>

              <!-- Stats -->
              <div class="flex gap-3 mb-4 flex-wrap">
                <div class="px-3 py-1.5 bg-orange-50 dark:bg-orange-900/30 rounded-lg flex items-center gap-2 border border-orange-200 dark:border-orange-800">
                  <svg class="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span class="text-sm font-medium text-orange-900 dark:text-orange-100">{{ restaurantStats.visites }} visites</span>
                </div>
                <div class="px-3 py-1.5 bg-red-50 dark:bg-red-900/30 rounded-lg flex items-center gap-2 border border-red-200 dark:border-red-800">
                  <svg class="w-4 h-4 text-red-500 fill-current" viewBox="0 0 24 24">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span class="text-sm font-medium text-red-900 dark:text-red-100">{{ restaurantStats.favoris }} favoris</span>
                </div>
              </div>

              <!-- Adresse + Tel -->
              <div class="space-y-2 text-gray-600 dark:text-gray-400">
                <div class="flex items-start gap-2">
                  <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{{ restaurant.adresse }}</span>
                </div>
                <div v-if="restaurant.numero" class="flex items-center gap-2">
                  <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a :href="`tel:${restaurant.numero}`" class="hover:text-[var(--color-primary)] transition-colors">{{ restaurant.numero }}</a>
                </div>

                <!-- Horaires -->
                <div v-if="restaurant.horaire" class="flex items-start gap-2">
                  <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p class="font-medium text-gray-900 dark:text-gray-100 mb-1">Horaires</p>
                    <div class="text-sm space-y-0.5">
                      <div v-for="day in orderedDays" :key="day" class="flex justify-between gap-4">
                        <span class="capitalize font-medium">{{ day }}</span>
                        <span>{{ restaurant.horaire[day] }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p v-if="restaurant.description" class="pt-2 border-t border-gray-200 dark:border-gray-700 leading-relaxed">
                  {{ restaurant.description }}
                </p>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-3 mt-6">
              <a
                v-if="restaurant.numero"
                :href="`tel:${restaurant.numero}`"
                class="flex-1 px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors font-medium flex items-center justify-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Réserver
              </a>
              <button
                v-else
                disabled
                class="flex-1 px-6 py-3 bg-gray-300 dark:bg-gray-700 text-white rounded-lg font-medium cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Réserver
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Menu -->
      <div class="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 mb-6 border border-gray-200 dark:border-gray-800">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Menu</h2>
          <span v-if="!menuLoading && menuItems.length > 0" class="text-sm text-gray-500">{{ menuItems.length }} plat(s)</span>
        </div>

        <div v-if="menuLoading" class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--color-primary)]"></div>
        </div>

        <div v-else-if="menuItems.length === 0" class="text-center py-12">
          <svg class="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p class="text-gray-500 dark:text-gray-400">Aucun plat disponible pour le moment</p>
        </div>

        <div v-else>
          <!-- Category tabs -->
          <div class="relative flex items-center mb-6">
            <button v-if="canScrollLeft" @click="scrollLeft" class="absolute left-0 z-10 w-8 h-8 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center shadow">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div ref="catContainer" class="flex gap-2 overflow-x-auto scrollbar-hide px-10 scroll-smooth" @scroll="updateScroll">
              <button @click="selectedCategory = null" class="px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all" :class="selectedCategory === null ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'">
                Tous ({{ menuItems.length }})
              </button>
              <button
                v-for="cat in categories"
                :key="cat"
                @click="selectedCategory = cat"
                class="px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all"
                :class="selectedCategory === cat ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'"
              >
                {{ cat }} ({{ menuItems.filter(i => i.categorie === cat).length }})
              </button>
            </div>
            <button v-if="canScrollRight" @click="scrollRight" class="absolute right-0 z-10 w-8 h-8 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center shadow">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>

          <!-- Items grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="item in visibleItems"
              :key="item.id"
              class="flex h-32 bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-[var(--color-primary)] hover:shadow-md transition-all"
            >
              <div class="relative w-32 flex-shrink-0">
                <img :src="getMenuImage(item)" :alt="item.nom" loading="lazy" class="w-full h-full object-cover" @error="(e) => e.target.src = '/placeholder.svg'" />
                <div v-if="item.categorie" class="absolute top-1 left-1 px-1.5 py-0.5 bg-[var(--color-primary)] text-white text-xs rounded font-medium">{{ item.categorie }}</div>
              </div>
              <div class="flex-1 p-3 flex flex-col justify-between min-w-0">
                <div>
                  <h3 class="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">{{ item.nom }}</h3>
                  <p v-if="item.description" class="text-gray-500 dark:text-gray-400 text-xs mt-1 line-clamp-2">{{ item.description }}</p>
                </div>
                <p class="text-[var(--color-primary)] font-bold text-sm mt-1">{{ item.prix }} FCFA</p>
              </div>
            </div>
          </div>

          <button v-if="visibleCount < filteredMenu.length" @click="visibleCount += 10" class="w-full mt-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium">
            Voir plus ({{ filteredMenu.length - visibleCount }} restants)
          </button>
        </div>
      </div>

      <!-- Reviews -->
      <div class="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-800">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Avis ({{ reviews.length }})</h2>
          <button @click="showReviewModal = true" class="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors font-medium text-sm">
            + Ajouter un avis
          </button>
        </div>

        <div v-if="reviews.length > 0" class="space-y-4">
          <div v-for="review in reviews" :key="review.id" class="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div class="flex items-start justify-between mb-2">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <span class="text-[var(--color-primary)] font-bold">{{ getInitial(review) }}</span>
                </div>
                <div>
                  <p class="font-semibold text-gray-900 dark:text-gray-100">{{ getDisplayName(review) }}</p>
                  <p class="text-xs text-gray-500">{{ formatDate(review.created_at) }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <div class="flex">
                  <svg v-for="i in 5" :key="i" class="w-4 h-4" :class="i <= review.rating ? 'fill-yellow-400' : 'fill-gray-300 dark:fill-gray-600'" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <button v-if="user && review.user_id === user.id" @click="confirmDeleteReview(review.id)" class="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            <p class="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{{ review.comment }}</p>
          </div>
        </div>

        <div v-else class="text-center py-8">
          <p class="text-gray-500 dark:text-gray-400">Aucun avis pour le moment. Soyez le premier !</p>
        </div>
      </div>
    </div>

    <!-- Image modal -->
    <Teleport to="body">
      <div v-if="showImageModal && restaurant?.photos" class="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" @click.self="showImageModal = false">
        <button @click="showImageModal = false" class="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-full">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <button @click="prevImg" class="absolute left-4 p-2 text-white hover:bg-white/20 rounded-full">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <img :src="restaurant.photos[imgIndex]" alt="Photo" class="max-h-[90vh] max-w-[90vw] object-contain rounded-lg" />
        <button @click="nextImg" class="absolute right-4 p-2 text-white hover:bg-white/20 rounded-full">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
        </button>
        <div class="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
          {{ imgIndex + 1 }} / {{ restaurant.photos.length }}
        </div>
      </div>
    </Teleport>

    <!-- Review modal -->
    <ReviewModal
      v-if="showReviewModal"
      :is-open="showReviewModal"
      :restaurant-id="restaurant?.id"
      :restaurant-name="restaurant?.nom"
      :user-id="user?.id || ''"
      :user-name="user?.user_metadata?.display_name || user?.email || 'Utilisateur'"
      @close="showReviewModal = false"
      @success="handleReviewSuccess"
    />
  </div>
</template>

<script>
import Navbar from '../components/Navbar.vue'
import ReviewModal from '../components/ReviewModal.vue'
import { useRoute } from 'vue-router'
import { useRestaurants } from '../composables/useRestaurants'
import { useAuth } from '../composables/useAuth'
import { useStatistics } from '../composables/useStatistics'
import { useToast } from '../composables/useToast'

export default {
  name: 'RestaurantDetail',
  components: { Navbar, ReviewModal },
  setup() {
    const route = useRoute()
    const { user } = useAuth()
    const { getRestaurantById, fetchMenu, toggleFavorite, isFavorite, incrementVisits, getReviews, deleteReview, fetchRestaurants } = useRestaurants()
    const { getRestaurantStats } = useStatistics()
    const toast = useToast()
    return { route, user, getRestaurantById, fetchMenu, toggleFavorite, isFavorite, incrementVisits, getReviews, deleteReview, fetchRestaurants, getRestaurantStats, toast }
  },
  data() {
    return {
      restaurant: null,
      loading: true,
      menuItems: [],
      menuLoading: false,
      selectedCategory: null,
      visibleCount: 10,
      isFavorite: false,
      favoriteLoading: false,
      restaurantStats: { visites: 0, favoris: 0 },
      reviews: [],
      showReviewModal: false,
      showImageModal: false,
      imgIndex: 0,
      canScrollLeft: false,
      canScrollRight: false,
    }
  },
  computed: {
    categories() {
      return [...new Set(this.menuItems.map((i) => i.categorie).filter(Boolean))].sort()
    },
    filteredMenu() {
      if (!this.selectedCategory) return this.menuItems
      return this.menuItems.filter((i) => i.categorie === this.selectedCategory)
    },
    visibleItems() {
      return this.filteredMenu.slice(0, this.visibleCount)
    },
    orderedDays() {
      const order = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']
      return order.filter((d) => this.restaurant?.horaire?.[d])
    },
  },
  async mounted() {
    await this.loadAll()
    window.addEventListener('resize', this.updateScroll)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateScroll)
  },
  methods: {
    async loadAll() {
      this.loading = true
      const id = this.$route.params.id
      this.restaurant = await this.getRestaurantById(id)
      this.loading = false

      if (!this.restaurant) return

      await Promise.all([
        this.loadMenu(),
        this.loadReviews(),
        this.loadStats(),
        this.loadFavoriteStatus(),
        this.incrementVisits(this.restaurant.id),
      ])

      this.$nextTick(() => this.updateScroll())
    },
    async loadMenu() {
      this.menuLoading = true
      this.menuItems = await this.fetchMenu(this.restaurant.id)
      this.menuLoading = false
      this.$nextTick(() => this.updateScroll())
    },
    async loadReviews() {
      this.reviews = await this.getReviews(this.restaurant.id)
    },
    async loadStats() {
      this.restaurantStats = await this.getRestaurantStats(this.restaurant.id)
    },
    async loadFavoriteStatus() {
      if (this.user) {
        this.isFavorite = await this.isFavorite(this.restaurant.id)
      } else {
        const ids = JSON.parse(localStorage.getItem('favorites') || '[]')
        this.isFavorite = ids.includes(this.restaurant.id)
      }
    },
    async toggleFavoriteHandler() {
      this.favoriteLoading = true
      if (this.user) {
        const result = await this.toggleFavorite(this.restaurant.id)
        if (result.success) {
          this.isFavorite = result.isFavorite
          await this.loadStats()
          this.toast.success(result.isFavorite ? 'Ajouté aux favoris ❤️' : 'Retiré des favoris')
        }
      } else {
        this.isFavorite = !this.isFavorite
        const ids = JSON.parse(localStorage.getItem('favorites') || '[]')
        if (this.isFavorite) ids.push(this.restaurant.id)
        else ids.splice(ids.indexOf(this.restaurant.id), 1)
        localStorage.setItem('favorites', JSON.stringify(ids))
      }
      this.favoriteLoading = false
    },
    openImageModal(i) { this.imgIndex = i; this.showImageModal = true },
    nextImg() { this.imgIndex = (this.imgIndex + 1) % this.restaurant.photos.length },
    prevImg() { this.imgIndex = (this.imgIndex - 1 + this.restaurant.photos.length) % this.restaurant.photos.length },
    async handleReviewSuccess() {
      await Promise.all([this.loadReviews(), this.loadAll()])
      this.showReviewModal = false
      this.toast.success('Avis publié avec succès !')
    },
    async confirmDeleteReview(id) {
      if (!confirm('Supprimer cet avis ?')) return
      const result = await this.deleteReview(id, this.restaurant.id)
      if (result.success) { await this.loadReviews(); this.toast.success('Avis supprimé') }
      else this.toast.error('Erreur lors de la suppression')
    },
    getMenuImage(item) {
      if (!item.image) return '/placeholder.svg'
      if (typeof item.image === 'string') {
        if (item.image.startsWith('[')) {
          try { const p = JSON.parse(item.image.replace(/'/g, '"')); return p[0] || '/placeholder.svg' } catch { return item.image }
        }
        return item.image
      }
      if (Array.isArray(item.image)) return item.image[0] || '/placeholder.svg'
      return '/placeholder.svg'
    },
    getInitial(review) { return (review.user_name || 'U').charAt(0).toUpperCase() },
    getDisplayName(review) {
      if (review.user_name && !review.user_name.includes('@')) return review.user_name
      return 'Utilisateur'
    },
    formatDate(ts) {
      if (!ts) return ''
      const d = ts.toDate ? ts.toDate() : new Date(ts)
      const diff = Math.floor((Date.now() - d) / 86400000)
      if (diff === 0) return "Aujourd'hui"
      if (diff === 1) return 'Hier'
      if (diff < 7) return `Il y a ${diff} jours`
      return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    },
    scrollLeft() {
      this.$refs.catContainer?.scrollBy({ left: -200, behavior: 'smooth' })
      setTimeout(this.updateScroll, 300)
    },
    scrollRight() {
      this.$refs.catContainer?.scrollBy({ left: 200, behavior: 'smooth' })
      setTimeout(this.updateScroll, 300)
    },
    updateScroll() {
      const c = this.$refs.catContainer
      if (!c) return
      this.canScrollLeft = c.scrollLeft > 0
      this.canScrollRight = c.scrollLeft < c.scrollWidth - c.clientWidth - 1
    },
  },
}
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
