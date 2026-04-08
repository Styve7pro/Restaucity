<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <Navbar>
      <template #actions>
        <button @click="$router.back()" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
          <svg class="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
      </template>
    </Navbar>

    <div v-if="restaurant" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Restaurant Header -->
      <div class="bg-white dark:bg-gray-900 rounded-xl shadow-md dark:shadow-gray-900/50 overflow-hidden mb-6 border border-gray-200 dark:border-gray-800">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Photo grid instead of single image carousel -->
          <div class="p-4">
            <!-- Mobile grid: 2 columns, max 6 images (3 rows) -->
            <div v-if="restaurant.photos && restaurant.photos.length > 0">
              <div class="grid grid-cols-2 gap-2 md:hidden">
                <img 
                  v-for="(photo, index) in restaurant.photos.slice(0, 6)" 
                  :key="index"
                  :src="photo" 
                  :alt="`${restaurant.nom} - Photo ${index + 1}`"
                  class="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  @click="openImageModal(index)"
                />
              </div>
              
              <!-- Added "Voir plus" button for mobile if more than 6 images -->
              <button
                v-if="restaurant.photos.length > 6"
                @click="openImageModal(6)"
                class="mt-3 w-full md:hidden px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium text-sm flex items-center justify-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Voir plus ({{ restaurant.photos.length - 6 }} photos)
              </button>
            </div>
            
            <!-- Desktop grid: 4 columns, max 20 images (5 rows) -->
            <div v-if="restaurant.photos && restaurant.photos.length > 0">
              <div class="hidden md:grid md:grid-cols-4 gap-2">
                <img 
                  v-for="(photo, index) in restaurant.photos.slice(0, 20)" 
                  :key="index"
                  :src="photo" 
                  :alt="`${restaurant.nom} - Photo ${index + 1}`"
                  class="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  @click="openImageModal(index)"
                />
              </div>
              
              <!-- Added "Voir plus" button for desktop if more than 20 images -->
              <button
                v-if="restaurant.photos.length > 20"
                @click="openImageModal(20)"
                class="mt-3 w-full hidden md:flex px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium text-sm items-center justify-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Voir plus ({{ restaurant.photos.length - 20 }} photos)
              </button>
            </div>
            
            <div v-else class="w-full h-64 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <svg class="w-16 h-16 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <!-- Info -->
          <div class="p-6 flex flex-col justify-between">
            <div>
              <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                  <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 text-balance">
                    {{ restaurant.nom }}
                  </h1>
                  <p class="text-lg text-gray-600 dark:text-gray-400">{{ restaurant.type || 'Restaurant' }}</p>
                </div>
                
                <button
                  @click="toggleFavoriteHandler"
                  :disabled="favoriteLoading"
                  class="w-12 h-12 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ml-4 disabled:opacity-50"
                >
                  <svg 
                    class="w-6 h-6" 
                    :class="isFavorite ? 'fill-red-500 stroke-red-500' : 'fill-none stroke-gray-600 dark:stroke-gray-400'"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>

              <!-- Rating and Price -->
              <div class="flex items-center gap-6 mb-6 flex-wrap">
                <div class="flex items-center gap-2">
                  <svg class="w-6 h-6 fill-yellow-400" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span class="text-xl font-bold text-gray-900 dark:text-gray-100">{{ restaurant.note || 0 }}</span>
                  <span class="text-gray-600 dark:text-gray-400">({{ reviews.length }} avis)</span>
                </div>
                <div v-if="restaurant.prix" class="flex items-center gap-1">
                  <span class="text-xl font-semibold text-blue-600 dark:text-blue-400">{{ restaurant.prix }}</span>
                </div>
              </div>

              <!-- Stats badges -->
              <div class="flex items-center gap-3 mb-6 flex-wrap">
                <div class="px-4 py-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg flex items-center gap-2 border border-orange-200 dark:border-orange-800">
                  <svg class="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span class="text-sm font-medium text-orange-900 dark:text-orange-100">{{ restaurantStats.visites || 0 }} visites</span>
                </div>
                <div class="px-4 py-2 bg-red-50 dark:bg-red-900/30 rounded-lg flex items-center gap-2 border border-red-200 dark:border-red-800">
                  <svg class="w-5 h-5 text-red-600 dark:text-red-400 fill-current" viewBox="0 0 24 24">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span class="text-sm font-medium text-red-900 dark:text-red-100">{{ restaurantStats.favoris || 0 }} favoris</span>
                </div>
              </div>

              <!-- Details -->
              <div class="space-y-3">
                <div class="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{{ restaurant.adresse }}</span>
                </div>

                <div v-if="restaurant.numero" class="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a :href="`tel:${restaurant.numero}`" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{{ restaurant.numero }}</a>
                </div>

                <!-- Display hours dynamically -->
                <div v-if="restaurant.horaire" class="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                  <svg class="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div class="flex-1">
                    <p class="font-medium mb-1 text-gray-900 dark:text-gray-100">Horaires d'ouverture</p>
                    <div class="text-sm space-y-0.5">
                      <div v-for="day in orderedDays" :key="day" class="flex justify-between gap-4">
                        <span class="capitalize font-medium">{{ day }}:</span>
                        <span>{{ restaurant.horaire[day] }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Display description if available -->
                <div v-if="restaurant.description" class="pt-3 border-t border-gray-200 dark:border-gray-800">
                  <p class="text-gray-600 dark:text-gray-400 leading-relaxed">{{ restaurant.description }}</p>
                </div>
              </div>
            </div>

            <!-- Action buttons -->
            <div class="flex gap-3 mt-6">
              <a 
                v-if="restaurant.numero"
                :href="`tel:${restaurant.numero}`"
                class="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Reserver
              </a>
              <button 
                v-else
                class="flex-1 px-6 py-3 bg-gray-400 text-white rounded-lg cursor-not-allowed font-medium flex items-center justify-center gap-2"
                disabled
                title="Numero de telephone non disponible"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Reserver
              </button>
              <button class="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium flex items-center justify-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Itineraire
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Menu Section with Category Filtering -->
      <div class="bg-white dark:bg-gray-900 rounded-xl shadow-md dark:shadow-gray-900/50 p-6 mb-6 border border-gray-200 dark:border-gray-800">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Menu</h2>
          <span v-if="menuItems.length > 0" class="text-sm text-gray-600 dark:text-gray-400">{{ menuItems.length }} plat(s)</span>
        </div>
        
        <!-- Loading state -->
        <div v-if="menuLoading" class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p class="text-gray-600 dark:text-gray-400">Chargement du menu...</p>
        </div>

        <!-- Empty state -->
        <div v-else-if="menuItems.length === 0" class="text-center py-12">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-gray-600 dark:text-gray-400 mb-4">Aucun plat disponible pour le moment</p>
          <button 
            v-if="user"
            @click="openReviewModal"
            class="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium inline-flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Soyez le premier a donner votre avis
          </button>
        </div>

        <!-- Menu with categories -->
        <div v-else>
          <!-- Fixed scroll arrows: converted computed to data properties and added proper initialization -->
          <div class="relative flex items-center">
            <!-- Left scroll arrow -->
            <div 
              v-show="canScrollLeft"
              class="absolute left-0 z-10 flex items-center h-full bg-gradient-to-r from-white via-white dark:from-gray-900 dark:via-gray-900 to-transparent pr-4"
            >
              <button
                @click="scrollCategoriesLeft"
                class="flex items-center justify-center w-9 h-9 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                aria-label="Defiler vers la gauche"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
            
            <!-- Category buttons container -->
            <div 
              ref="categoriesContainer"
              class="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide px-12 scroll-smooth"
              @scroll="updateScrollButtons"
            >
              <button
                @click="selectedCategory = null"
                class="px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all"
                :class="selectedCategory === null ? 'bg-orange-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700'"
              >
                Tous ({{ menuItems.length }})
              </button>
              <button
                v-for="category in categories"
                :key="category"
                @click="selectedCategory = category"
                class="px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all"
                :class="selectedCategory === category ? 'bg-orange-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700'"
              >
                {{ category }} ({{ menuItems.filter(item => item.categorie === category).length }})
              </button>
            </div>
            
            <!-- Right scroll arrow -->
            <div 
              v-show="canScrollRight"
              class="absolute right-0 z-10 flex items-center h-full bg-gradient-to-l from-white via-white dark:from-gray-900 dark:via-gray-900 to-transparent pl-4"
            >
              <button
                @click="scrollCategoriesRight"
                class="flex items-center justify-center w-9 h-9 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                aria-label="Defiler vers la droite"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Mobile: 1 column, show 5 items at a time -->
          <div class="md:hidden">
            <div class="space-y-4">
              <div v-for="item in visibleMenuItemsMobile" :key="item.id" class="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-orange-400 dark:hover:border-orange-500 transition-all duration-300 flex h-32">
                <div class="relative w-28 flex-shrink-0">
                  <img 
                    :src="getMenuItemImage(item)" 
                    :alt="item.nom"
                    class="w-full h-full object-cover"
                  />
                  <div v-if="item.categorie" class="absolute top-1 left-1 px-1.5 py-0.5 bg-orange-600 text-white text-xs font-medium rounded">
                    {{ item.categorie }}
                  </div>
                </div>
                <div class="flex-1 p-3 flex flex-col justify-between min-w-0">
                  <div>
                    <h3 class="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-tight truncate">{{ item.nom }}</h3>
                    <p v-if="item.description" class="text-gray-600 dark:text-gray-400 text-xs mt-1 line-clamp-2">{{ item.description }}</p>
                  </div>
                  <div class="flex items-center justify-between mt-2">
                    <span class="text-orange-600 dark:text-orange-400 font-bold text-sm">{{ item.prix }} FCFA</span>
                  </div>
                </div>
              </div>
            </div>
            
            <button 
              v-if="visibleMenuCountMobile < filteredMenuItems.length"
              @click="loadMoreMenuItemsMobile"
              class="w-full mt-6 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Voir plus ({{ filteredMenuItems.length - visibleMenuCountMobile }} restants)
            </button>
          </div>

          <!-- Desktop: 2 columns -->
          <div class="hidden md:block">
            <div class="grid grid-cols-2 gap-4">
              <div v-for="item in visibleMenuItemsDesktop" :key="item.id" class="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-orange-400 dark:hover:border-orange-500 transition-all duration-300 flex h-36">
                <div class="relative w-36 flex-shrink-0">
                  <img 
                    :src="getMenuItemImage(item)" 
                    :alt="item.nom"
                    class="w-full h-full object-cover"
                  />
                  <div v-if="item.categorie" class="absolute top-2 left-2 px-2 py-1 bg-orange-600 text-white text-xs font-medium rounded">
                    {{ item.categorie }}
                  </div>
                </div>
                <div class="flex-1 p-4 flex flex-col justify-between min-w-0">
                  <div>
                    <h3 class="font-semibold text-gray-900 dark:text-gray-100 leading-tight truncate">{{ item.nom }}</h3>
                    <p v-if="item.description" class="text-gray-600 dark:text-gray-400 text-sm mt-1 line-clamp-2">{{ item.description }}</p>
                  </div>
                  <div class="flex items-center justify-between mt-2">
                    <span class="text-orange-600 dark:text-orange-400 font-bold">{{ item.prix }} FCFA</span>
                  </div>
                </div>
              </div>
            </div>
            
            <button 
              v-if="visibleMenuCountDesktop < filteredMenuItems.length"
              @click="loadMoreMenuItemsDesktop"
              class="w-full mt-6 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Voir plus ({{ filteredMenuItems.length - visibleMenuCountDesktop }} restants)
            </button>
          </div>
        </div>
      </div>

      <!-- Reviews Section -->
      <div class="bg-white dark:bg-gray-900 rounded-xl shadow-md dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-800">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Avis</h2>
          <button 
            @click="openReviewModal"
            class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium text-sm flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Ajouter un avis
          </button>
        </div>

        <!-- Reviews list -->
        <div v-if="reviews.length > 0" class="space-y-4">
          <div v-for="review in reviews" :key="review.id" class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div class="flex items-start justify-between mb-2">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                  <span class="text-orange-600 dark:text-orange-400 font-semibold">{{ getDisplayName(review).charAt(0).toUpperCase() }}</span>
                </div>
                <div>
                  <p class="font-medium text-gray-900 dark:text-gray-100">{{ getDisplayName(review) }}</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">{{ formatDate(review.created_at) }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <div class="flex items-center gap-1">
                  <svg v-for="i in 5" :key="i" class="w-4 h-4" :class="i <= review.rating ? 'fill-yellow-400' : 'fill-gray-300 dark:fill-gray-600'" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <button
                  v-if="user && review.user_id === user.id"
                  @click="confirmDeleteReview(review.id)"
                  class="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                  title="Supprimer l'avis"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            <p class="text-gray-600 dark:text-gray-400">{{ review.comment }}</p>
          </div>
        </div>

        <!-- Empty reviews state -->
        <div v-else class="text-center py-8">
          <svg class="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-gray-600 dark:text-gray-400">Aucun avis pour le moment</p>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-else-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
    </div>

    <!-- Not found state -->
    <div v-else class="flex flex-col items-center justify-center min-h-screen">
      <svg class="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-gray-600 dark:text-gray-400 mb-4">Restaurant non trouve</p>
      <button @click="$router.push('/')" class="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
        Retour a l'accueil
      </button>
    </div>

    <!-- Image Modal -->
    <div v-if="showImageModal && restaurant?.photos" class="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" @click.self="closeImageModal">
      <button @click="closeImageModal" class="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-full transition-colors">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      <button @click="previousModalImage" class="absolute left-4 p-2 text-white hover:bg-white/20 rounded-full transition-colors">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <img :src="restaurant.photos[currentImageIndex]" :alt="`Photo ${currentImageIndex + 1}`" class="max-h-[90vh] max-w-[90vw] object-contain" />
      
      <button @click="nextModalImage" class="absolute right-4 p-2 text-white hover:bg-white/20 rounded-full transition-colors">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      
      <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white">
        {{ currentImageIndex + 1 }} / {{ restaurant.photos.length }}
      </div>
    </div>

    <!-- Review Modal -->
    <ReviewModal 
      v-if="showReviewModal"
      :is-open="showReviewModal"
      :restaurant-id="restaurant?.id"
      :restaurant-name="restaurant?.nom"
      :user-id="user?.id || ''"
      :user-name="user?.user_metadata?.full_name || user?.email || 'Utilisateur'"
      @close="closeReviewModal"
      @success="handleReviewSuccess"
    />
  </div>
</template>

<script>
import Navbar from '../components/Navbar.vue'
import ReviewModal from '../components/ReviewModal.vue'
import { useRoute, useRouter } from 'vue-router'
import { useRestaurants } from '../composables/useRestaurants'
import { useAuth } from '../composables/useAuth'
import { useStatistics } from '../composables/useStatistics'

export default {
  name: 'RestaurantDetail',
  components: {
    Navbar,
    ReviewModal
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const { user } = useAuth()
    const { 
      fetchRestaurants,
      getRestaurantById,
      addMenuItem, 
      updateMenuItem, 
      deleteMenuItem,
      fetchMenu,
      incrementVisits,
      getReviews,
      deleteReview
    } = useRestaurants()
    
    return { 
      route,
      router,
      user,
      fetchRestaurants,
      getRestaurantById,
      addMenuItem,
      updateMenuItem,
      deleteMenuItem,
      fetchMenu,
      incrementVisits,
      getReviews,
      deleteReview,
    }
  },
  data() {
    return {
      restaurant: null,
      loading: true,
      menuItems: [],
      menuLoading: false,
      selectedCategory: null,
      visibleMenuCountMobile: 5,
      visibleMenuCountDesktop: 10,
      isFavorite: false,
      favoriteLoading: false,
      restaurantStats: { visites: 0, favoris: 0 },
      showImageModal: false,
      currentImageIndex: 0,
      reviews: [],
      showReviewModal: false,
      expandedDescriptions: {},
      canScrollLeft: false,
      canScrollRight: false
    }
  },
  computed: {
    categories() {
      const cats = [...new Set(this.menuItems.map(item => item.categorie).filter(Boolean))]
      return cats.sort()
    },
    filteredMenuItems() {
      if (!this.selectedCategory) {
        return this.menuItems
      }
      return this.menuItems.filter(item => item.categorie === this.selectedCategory)
    },
    visibleMenuItemsMobile() {
      return this.filteredMenuItems.slice(0, this.visibleMenuCountMobile)
    },
    visibleMenuItemsDesktop() {
      return this.filteredMenuItems.slice(0, this.visibleMenuCountDesktop)
    },
    orderedDays() {
      const dayOrder = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']
      if (!this.restaurant?.horaire) return []
      return dayOrder.filter(day => this.restaurant.horaire[day])
    }
  },
  watch: {
    menuItems: {
      handler() {
        this.$nextTick(() => {
          this.updateScrollButtons()
        })
      },
      deep: true
    },
    categories: {
      handler() {
        this.$nextTick(() => {
          this.updateScrollButtons()
        })
      },
      deep: true
    }
  },
  async mounted() {
    await this.loadRestaurant()
    if (this.restaurant) {
      await this.loadReviews()
      await this.loadMenu()
      await this.incrementVisits(this.restaurant.id)
      await this.loadFavoriteStatus()
      await this.loadRestaurantStats()
      this.$nextTick(() => {
        this.updateScrollButtons()
        // Additional delayed check for slower renders
        setTimeout(() => {
          this.updateScrollButtons()
        }, 100)
      })
    }
    window.addEventListener('resize', this.updateScrollButtons)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.updateScrollButtons)
  },
  methods: {
    async loadRestaurant() {
      const id = this.$route.params.id
      this.loading = true
      this.restaurant = await this.getRestaurantById(id)
      this.loading = false
    },
    async loadMenu() {
      if (!this.restaurant) return
      this.menuLoading = true
      this.menuItems = await this.fetchMenu(this.restaurant.id)
      this.menuLoading = false
    },
    async loadFavoriteStatus() {
      if (this.user) {
        this.isFavorite = await this.checkFavorite(this.restaurant.id, this.user.uid)
      } else {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
        this.isFavorite = favorites.includes(this.restaurant.id)
      }
    },
    async toggleFavoriteHandler() {
      this.favoriteLoading = true
      
      if (this.user) {
        const result = await this.toggleFavorite(this.restaurant.id, this.user.uid)
        if (result.success) {
          this.isFavorite = result.isFavorite
          await this.loadRestaurantStats()
        }
      } else {
        this.isFavorite = !this.isFavorite
        
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
        
        if (this.isFavorite) {
          favorites.push(this.restaurant.id)
        } else {
          const index = favorites.indexOf(this.restaurant.id)
          if (index > -1) favorites.splice(index, 1)
        }
        
        localStorage.setItem('favorites', JSON.stringify(favorites))
      }
      
      this.favoriteLoading = false
    },
    async loadRestaurantStats() {
      if (!this.restaurant) return
      
      try {
        const stats = await this.getRestaurantStats(this.restaurant.id)
        this.restaurantStats = stats
      } catch (error) {
        console.error('Error loading restaurant stats:', error)
      }
    },
    openImageModal(index) {
      this.currentImageIndex = index
      this.showImageModal = true
    },
    closeImageModal() {
      this.showImageModal = false
    },
    nextModalImage() {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.restaurant.photos.length
    },
    previousModalImage() {
      this.currentImageIndex = this.currentImageIndex === 0 
        ? this.restaurant.photos.length - 1 
        : this.currentImageIndex - 1
    },
    
    async loadReviews() {
      if (!this.restaurant) {
        console.log('[v0] Cannot load reviews: restaurant not loaded')
        return
      }
      
      try {
        console.log('[v0] Loading reviews for restaurant ID:', this.restaurant.id)
        const reviewsData = await this.getReviews(this.restaurant.id)
        console.log('[v0] Reviews received from getReviews:', reviewsData)
        
        this.reviews = Array.isArray(reviewsData) ? reviewsData : []
        console.log('[v0] Reviews set to state:', this.reviews.length, 'items')
      } catch (error) {
        console.error('[v0] Error loading reviews:', error)
        this.reviews = []
      }
    },
    
    openReviewModal() {
      this.showReviewModal = true
    },
    
    closeReviewModal() {
      this.showReviewModal = false
    },
    
    async handleReviewSuccess() {
      console.log('[v0] Review added successfully, reloading data')
      await this.loadReviews()
      await this.loadRestaurant()
      await this.loadRestaurantStats()
      await this.fetchRestaurants()
      this.closeReviewModal()
    },
    
    formatDate(timestamp) {
      if (!timestamp) return ''
      
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      const now = new Date()
      const diffTime = Math.abs(now - date)
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) return "Aujourd'hui"
      if (diffDays === 1) return 'Hier'
      if (diffDays < 7) return `Il y a ${diffDays} jours`
      if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`
      
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    },
    
    toggleDescription(itemId) {
      this.$set(this.expandedDescriptions, itemId, !this.expandedDescriptions[itemId])
    },
    
    loadMoreMenuItemsMobile() {
      this.visibleMenuCountMobile += 5
    },
    
    loadMoreMenuItemsDesktop() {
      this.visibleMenuCountDesktop += 10
    },
    getMenuItemImage(item) {
      if (!item.image) return '/placeholder.svg?height=128&width=112'
      if (typeof item.image === 'string') {
        if (item.image.startsWith('[') && item.image.endsWith(']')) {
          try {
            const parsed = JSON.parse(item.image.replace(/'/g, '"'))
            if (Array.isArray(parsed) && parsed.length > 0) {
              return parsed[0]
            }
          } catch (e) {
            const match = item.image.match(/['"]?(https?:\/\/[^'"]+)['"]?/)
            if (match) return match[1]
          }
        }
        return item.image
      }
      if (Array.isArray(item.image) && item.image.length > 0) {
        return item.image[0]
      }
      return '/placeholder.svg?height=128&width=112'
    },
    scrollCategoriesLeft() {
      const container = this.$refs.categoriesContainer
      if (container) {
        container.scrollBy({ left: -200, behavior: 'smooth' })
        setTimeout(() => this.updateScrollButtons(), 300)
      }
    },
    scrollCategoriesRight() {
      const container = this.$refs.categoriesContainer
      if (container) {
        container.scrollBy({ left: 200, behavior: 'smooth' })
        setTimeout(() => this.updateScrollButtons(), 300)
      }
    },
    updateScrollButtons() {
      const container = this.$refs.categoriesContainer
      if (container) {
        this.canScrollLeft = container.scrollLeft > 0
        this.canScrollRight = container.scrollLeft < (container.scrollWidth - container.clientWidth - 1)
      }
    },
    getDisplayName(review) {
      if (review.user_name && !review.user_name.includes('@')) {
        return review.user_name
      }
      return 'Utilisateur'
    },
    async confirmDeleteReview(reviewId) {
      if (confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) {
        await this.handleDeleteReview(reviewId)
      }
    },
    async handleDeleteReview(reviewId) {
      try {
        const result = await this.deleteReview(reviewId, this.restaurant.id)
        
        if (result.success) {
          await this.loadReviews()
          await this.loadRestaurant()
          await this.fetchRestaurants()
        } else {
          alert('Erreur lors de la suppression de l\'avis')
        }
      } catch (error) {
        console.error('Error deleting review:', error)
        alert('Erreur lors de la suppression de l\'avis')
      }
    }
  }
}
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
