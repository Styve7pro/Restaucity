<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <!-- Added loading state while checking authentication -->
    <div v-if="authLoading" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto mb-4"></div>
        <p class="text-[var(--color-text-secondary)]">Vérification des droits d'accès...</p>
      </div>
    </div>

    <div v-else-if="!isAdmin" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <svg class="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2 class="text-2xl font-bold text-[var(--color-text)] mb-2">Accès refusé</h2>
        <p class="text-[var(--color-text-secondary)] mb-6">Vous n'avez pas les droits d'administrateur</p>
        <router-link to="/" class="px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors font-medium inline-block">
          Retour à l'accueil
        </router-link>
      </div>
    </div>

    <div v-else>
      <Navbar>
        <template #actions>
          <button @click="handleLogout" class="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
            Déconnexion
          </button>
        </template>
      </Navbar>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <!-- Added new statistics cards for visits, favorites, and users -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <!-- Replaced blue colors with orange for brand consistency -->
          <div class="bg-white dark:bg-gray-900 rounded-xl shadow-md dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-800">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Restaurants</p>
                <p class="text-3xl font-bold text-gray-900 dark:text-gray-100">{{ globalStats.totalRestaurants }}</p>
              </div>
              <div class="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-900 rounded-xl shadow-md dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-800">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Visites</p>
                <p class="text-3xl font-bold text-gray-900 dark:text-gray-100">{{ globalStats.totalVisites }}</p>
              </div>
              <div class="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-900 rounded-xl shadow-md dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-800">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Favoris</p>
                <p class="text-3xl font-bold text-gray-900 dark:text-gray-100">{{ globalStats.totalFavoris }}</p>
              </div>
              <div class="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-red-600 dark:text-red-400 fill-current" viewBox="0 0 24 24">
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-900 rounded-xl shadow-md dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-800">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Utilisateurs Actifs</p>
                <p class="text-3xl font-bold text-gray-900 dark:text-gray-100">{{ globalStats.usersWithFavorites }}</p>
              </div>
              <div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Added Slider Management Section before restaurants table -->
        <div class="bg-white dark:bg-gray-900 rounded-xl shadow-md dark:shadow-gray-900/50 overflow-hidden border border-gray-200 dark:border-gray-800 mb-8">
          <div class="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <div>
              <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">Gestion du Slider</h2>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Gérez les images du slider de la page d'accueil</p>
            </div>
            <button
              @click="openAddSliderImageModal"
              class="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Ajouter une image
            </button>
          </div>

          <div class="p-6">
            <!-- Loading state -->
            <div v-if="sliderLoading" class="text-center py-8">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p class="text-gray-600 dark:text-gray-400">Chargement des images...</p>
            </div>

            <!-- Empty state -->
            <div v-else-if="sliderImages.length === 0" class="text-center py-8">
              <svg class="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p class="text-gray-600 dark:text-gray-400">Aucune image dans le slider</p>
            </div>

            <!-- Slider images grid -->
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div v-for="image in sliderImages" :key="image.id" class="relative group">
                <img
                  :src="image.url"
                  :alt="`Slider image ${image.order || ''}`"
                  class="w-full h-48 object-cover rounded-lg"
                />
                <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-lg flex items-center justify-center">
                  <button
                    @click="confirmDeleteSliderImage(image)"
                    class="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <div v-if="image.order !== undefined" class="absolute top-2 left-2 px-2 py-1 bg-orange-600 text-white text-xs rounded font-medium">
                  #{{ image.order + 1 }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Removed duplicate stats section -->

        <!-- Restaurants Table with real data from Firebase -->
        <div class="bg-white dark:bg-gray-900 rounded-xl shadow-md dark:shadow-gray-900/50 overflow-hidden border border-gray-200 dark:border-gray-800">
          <!-- Added header with "Add Restaurant" button -->
          <div class="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <div>
              <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">Gestion des Restaurants</h2>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Gérez tous vos restaurants et leurs menus</p>
            </div>
            <button
              @click="openAddModal"
              class="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Ajouter un restaurant
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Restaurant</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Cuisine</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Note</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Prix</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Stats</th>
                  <th class="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
                <tr v-for="restaurant in restaurants" :key="restaurant.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <img
                        :src="restaurant.photo && restaurant.photo.length > 0 ? restaurant.photo[0] : '/placeholder.svg?height=100&width=100'"
                        :alt="restaurant.nom"
                        class="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <p class="font-semibold text-gray-900 dark:text-gray-100">{{ restaurant.nom }}</p>
                        <p class="text-sm text-gray-500 dark:text-gray-400">{{ restaurant.adresse }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-gray-600 dark:text-gray-300">{{ restaurant.type || 'Non spécifié' }}</td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-1">
                      <svg class="w-4 h-4 fill-yellow-400" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      <span class="font-semibold text-gray-900 dark:text-gray-100">{{ restaurant.note || 0 }}</span>
                    </div>
                  </td>
                  <!-- Replaced blue with orange for price display -->
                  <td class="px-6 py-4 text-orange-600 dark:text-orange-400 font-semibold">{{ restaurant.prix || 'N/A' }}</td>
                  <td class="px-6 py-4">
                    <button
                      @click="openStatsModal(restaurant)"
                      class="flex items-center gap-2 px-3 py-1.5 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors text-sm font-medium"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Voir stats
                    </button>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center justify-end gap-2">
                      <!-- Added menu management button -->
                      <button
                        @click="openMenuModal(restaurant)"
                        class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        title="Gérer le menu"
                      >
                        <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </button>
                      <button
                        @click="openEditModal(restaurant)"
                        class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        @click="confirmDelete(restaurant)"
                        class="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <svg class="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Added Restaurant Stats Modal -->
        <div v-if="showStatsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="closeStatsModal">
          <div class="bg-white dark:bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800">
            <div class="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6 z-10">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Statistiques - {{ selectedStatsRestaurant?.nom }}</h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Détails des performances du restaurant</p>
                </div>
                <button @click="closeStatsModal" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <svg class="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <!-- Replaced purple/blue with orange for consistency -->
                <div class="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
                  <div class="flex items-center justify-between mb-4">
                    <div class="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                  </div>
                  <p class="text-sm text-orange-700 dark:text-orange-300 mb-1 font-medium">Visites totales</p>
                  <p class="text-3xl font-bold text-orange-900 dark:text-orange-100">{{ selectedStatsRestaurant?.stats?.visites || 0 }}</p>
                </div>

                <div class="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 rounded-xl p-6 border border-red-200 dark:border-red-800">
                  <div class="flex items-center justify-between mb-4">
                    <div class="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                      <svg class="w-6 h-6 text-white fill-current" viewBox="0 0 24 24">
                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                  </div>
                  <p class="text-sm text-red-700 dark:text-red-300 mb-1 font-medium">Favoris</p>
                  <p class="text-3xl font-bold text-red-900 dark:text-red-100">{{ selectedStatsRestaurant?.stats?.favoris || 0 }}</p>
                </div>

                <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800">
                  <div class="flex items-center justify-between mb-4">
                    <div class="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                      <svg class="w-6 h-6 text-white fill-current" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </div>
                  </div>
                  <p class="text-sm text-yellow-700 dark:text-yellow-300 mb-1 font-medium">Note moyenne</p>
                  <p class="text-3xl font-bold text-yellow-900 dark:text-yellow-100">{{ selectedStatsRestaurant?.note || 0 }}/5</p>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Informations générales</h4>
                  <div class="space-y-3">
                    <div class="flex justify-between">
                      <span class="text-gray-600 dark:text-gray-400">Type de cuisine</span>
                      <span class="font-medium text-gray-900 dark:text-gray-100">{{ selectedStatsRestaurant?.type }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-600 dark:text-gray-400">Niveau de prix</span>
                      <span class="font-medium text-gray-900 dark:text-gray-100">{{ selectedStatsRestaurant?.prix }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-600 dark:text-gray-400">Nombre d'avis</span>
                      <span class="font-medium text-gray-900 dark:text-gray-100">{{ selectedStatsRestaurant?.avis?.length || 0 }}</span>
                    </div>
                  </div>
                </div>

                <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Performance</h4>
                  <div class="space-y-3">
                    <div>
                      <div class="flex justify-between mb-1">
                        <span class="text-gray-600 dark:text-gray-400">Taux de favoris</span>
                        <span class="font-medium text-gray-900 dark:text-gray-100">{{ calculateFavoriteRate(selectedStatsRestaurant) }}%</span>
                      </div>
                      <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div class="bg-red-500 h-2 rounded-full" :style="{ width: calculateFavoriteRate(selectedStatsRestaurant) + '%' }"></div>
                      </div>
                    </div>
                    <div>
                      <div class="flex justify-between mb-1">
                        <span class="text-gray-600 dark:text-gray-400">Popularité</span>
                        <span class="font-medium text-gray-900 dark:text-gray-100">{{ calculatePopularity(selectedStatsRestaurant) }}%</span>
                      </div>
                      <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <!-- Replaced blue with orange for progress bars -->
                        <div class="bg-orange-500 h-2 rounded-full" :style="{ width: calculatePopularity(selectedStatsRestaurant) + '%' }"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


        <!-- Add/Edit Modal with complete form -->
        <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="closeModal">
          <div class="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div class="sticky top-0 bg-white dark:bg-gray-900 border-b border-[var(--color-border)] p-6">
              <div class="flex items-center justify-between">
                <h3 class="text-2xl font-bold text-[var(--color-text)]">
                  {{ editingRestaurant ? 'Modifier le restaurant' : 'Ajouter un restaurant' }}
                </h3>
                <button @click="closeModal" class="p-2 hover:bg-[var(--color-surface)] rounded-lg transition-colors">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
              <!-- Name -->
              <div>
                <label class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Nom du restaurant *</label>
                <input
                  v-model="formData.nom"
                  type="text"
                  required
                  class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-orange-600 focus:ring-2 focus:ring-orange-600 focus:ring-opacity-20 transition-all"
                  placeholder="Le Gourmet Parisien"
                />
              </div>

              <!-- Type -->
              <div>
                <label class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Type de cuisine *</label>
                <select
                  v-model="formData.type"
                  required
                  class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-orange-600 focus:ring-2 focus:ring-orange-600 focus:ring-opacity-20 transition-all"
                >
                  <option value="">Sélectionnez un type</option>
                  <option value="Pâtisserie">Pâtisserie</option>
                  <option value="Fastfood">Fastfood</option>
                  <option value="Cuisine Africaine">Cuisine Africaine</option>
                  <option value="Cuisine Française">Cuisine Française</option>
                  <option value="Cuisine Italienne">Cuisine Italienne</option>
                  <option value="Cuisine Asiatique">Cuisine Asiatique</option>
                  <option value="Cuisine Japonaise">Cuisine Japonaise</option>
                  <option value="Pizzeria">Pizzeria</option>
                  <option value="Burger">Burger</option>
                  <option value="Café">Café</option>
                  <option value="Bar">Bar</option>
                  <option value="Restaurant Gastronomique">Restaurant Gastronomique</option>
                </select>
              </div>

              <!-- Address -->
              <div>
                <label class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Adresse *</label>
                <input
                  v-model="formData.adresse"
                  type="text"
                  required
                  class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-orange-600 focus:ring-2 focus:ring-orange-600 focus:ring-opacity-20 transition-all"
                  placeholder="123 Rue de la Gastronomie, Paris"
                />
              </div>

              <!-- Phone Number -->
              <div>
                <label class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Numéro de téléphone</label>
                <input
                  v-model="formData.numero"
                  type="tel"
                  class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-orange-600 focus:ring-2 focus:ring-orange-600 focus:ring-opacity-20 transition-all"
                  placeholder="+33 1 23 45 67 89"
                />
              </div>

              <!-- Description -->
              <div>
                <label class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Description *</label>
                <textarea
                  v-model="formData.description"
                  required
                  rows="3"
                  class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-orange-600 focus:ring-2 focus:ring-orange-600 focus:ring-opacity-20 transition-all"
                  placeholder="Décrivez le restaurant..."
                ></textarea>
              </div>

              <!-- Prix -->
              <div>
                <label class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Niveau de prix *</label>
                <select
                  v-model="formData.prix"
                  required
                  class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-orange-600 focus:ring-2 focus:ring-orange-600 focus:ring-opacity-20 transition-all"
                >
                  <option value="">Sélectionnez un niveau</option>
                  <option value="FCFA">FCFA - Économique</option>
                  <option value="FCFA FCFA">FCFA FCFA - Modéré</option>
                  <option value="FCFA FCFA FCFA">FCFA FCFA FCFA - Élevé</option>
                  <option value="FCFA FCFA FCFA FCFA">FCFA FCFA FCFA FCFA - Très élevé</option>
                </select>
              </div>

              <!-- Rating -->
              <div>
                <label class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Note initiale</label>
                <input
                  v-model.number="formData.note"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-orange-600 focus:ring-2 focus:ring-orange-600 focus:ring-opacity-20 transition-all"
                  placeholder="4.5"
                />
              </div>

              <!-- Opening Hours -->
              <div>
                <label class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Horaires d'ouverture</label>
                <div class="space-y-2">
                  <div v-for="(day, key) in formData.horaire" :key="key" class="flex items-center gap-2">
                    <label class="w-24 text-sm text-gray-600 dark:text-gray-400 capitalize">{{ key }}</label>
                    <input
                      v-model="formData.horaire[key]"
                      type="text"
                      class="flex-1 px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-orange-600 focus:ring-2 focus:ring-orange-600 focus:ring-opacity-20 transition-all"
                      placeholder="08:00-20:00"
                    />
                  </div>
                </div>
              </div>

              <!-- Images -->
              <div>
                <label class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Images du restaurant (plusieurs possibles)</label>
                <div class="space-y-3">
                  <div class="flex items-center gap-4">
                    <input
                      ref="fileInput"
                      type="file"
                      accept="image/*"
                      multiple
                      @change="handleImageSelect"
                      class="hidden"
                    />
                    <button
                      type="button"
                      @click="$refs.fileInput.click()"
                      class="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium"
                    >
                      Choisir des images
                    </button>
                    <span v-if="selectedImages.length > 0" class="text-sm text-gray-600 dark:text-gray-400">
                      {{ selectedImages.length }} image(s) sélectionnée(s)
                    </span>
                    <span v-else-if="formData.photo && formData.photo.length > 0" class="text-sm text-green-600 dark:text-green-400">
                      {{ formData.photo.length }} image(s) existante(s)
                    </span>
                  </div>

                  <!-- Display multiple image previews in a grid -->
                  <div v-if="imagePreviews.length > 0 || (formData.photo && formData.photo.length > 0)" class="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div v-for="(preview, index) in (imagePreviews.length > 0 ? imagePreviews : formData.photo)" :key="index" class="relative group">
                      <img :src="preview" alt="Preview" class="w-full h-32 object-cover rounded-lg" />
                      <button
                        v-if="imagePreviews.length > 0"
                        type="button"
                        @click="removeImage(index)"
                        class="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <div v-if="index === 0" class="absolute bottom-2 left-2 px-2 py-1 bg-blue-500 text-white text-xs rounded">
                        Image principale
                      </div>
                    </div>
                  </div>
                  <p class="text-xs text-[var(--color-text-secondary)]">
                    La première image sera utilisée comme aperçu principal
                  </p>
                </div>
              </div>

              <!-- Error Message -->
              <div v-if="formError" class="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p class="text-sm text-red-700">{{ formError }}</p>
              </div>

              <!-- Actions -->
              <div class="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  @click="closeModal"
                  class="px-6 py-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  :disabled="submitting"
                  class="px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ submitting ? 'Enregistrement...' : (editingRestaurant ? 'Mettre à jour' : 'Ajouter') }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Delete Confirmation Modal -->
        <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="showDeleteModal = false">
          <div class="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full p-6">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-bold text-[var(--color-text)]">Confirmer la suppression</h3>
                <p class="text-sm text-[var(--color-text-secondary)] mt-1">
                  Êtes-vous sûr de vouloir supprimer "{{ restaurantToDelete?.nom }}" ?
                </p>
              </div>
            </div>
            <div class="flex items-center justify-end gap-3">
              <button
                @click="showDeleteModal = false"
                class="px-4 py-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors font-medium"
              >
                Annuler
              </button>
              <button
                @click="handleDelete"
                :disabled="submitting"
                class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ submitting ? 'Suppression...' : 'Supprimer' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Menu Management Modal -->
        <div v-if="showMenuModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="closeMenuModal">
          <div class="bg-white dark:bg-gray-900 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div class="sticky top-0 bg-white dark:bg-gray-900 border-b border-[var(--color-border)] p-6 z-10">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-2xl font-bold text-[var(--color-text)]">Menu - {{ selectedRestaurant?.nom }}</h3>
                  <p class="text-sm text-[var(--color-text-secondary)] mt-1">Gérez les plats et catégories du restaurant</p>
                </div>
                <button @click="closeMenuModal" class="p-2 hover:bg-[var(--color-surface)] rounded-lg transition-colors">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <button
                @click="openAddMenuItemModal"
                class="mt-4 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors font-medium flex items-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Ajouter un plat
              </button>
            </div>

            <div class="p-6">
              <!-- Loading state -->
              <div v-if="menuLoading && currentMenuItems.length === 0" class="text-center py-12">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto mb-4"></div>
                <p class="text-[var(--color-text-secondary)]">Chargement du menu...</p>
              </div>

              <!-- Empty state -->
              <div v-else-if="currentMenuItems.length === 0" class="text-center py-12">
                <svg class="w-16 h-16 text-[var(--color-text-secondary)] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h3 class="text-xl font-semibold text-[var(--color-text)] mb-2">Aucun plat</h3>
                <p class="text-[var(--color-text-secondary)]">Commencez par ajouter des plats au menu</p>
              </div>

              <!-- Menu Items organized by Category Folders -->
              <div v-else class="space-y-4">
                <div v-for="category in menuCategories" :key="category.name" class="border border-[var(--color-border)] rounded-lg overflow-hidden">
                  <!-- Category Header (Folder) -->
                  <button
                    @click="toggleCategory(category.name)"
                    class="w-full flex items-center justify-between p-4 bg-[var(--color-surface)] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div class="flex items-center gap-3">
                      <!-- Folder Icon -->
                      <svg
                        class="w-6 h-6 text-[var(--color-primary)] transition-transform duration-200"
                        :class="{ 'rotate-90': expandedCategories.includes(category.name) }"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                      <svg class="w-6 h-6 text-[var(--color-primary)]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
                      </svg>
                      <span class="font-semibold text-[var(--color-text)]">{{ category.name }}</span>
                    </div>
                    <span class="px-3 py-1 bg-[var(--color-primary)] text-white text-sm rounded-full font-medium">
                      {{ category.items.length }}
                    </span>
                  </button>

                  <!-- Category Items (Collapsible) -->
                  <div
                    v-show="expandedCategories.includes(category.name)"
                    class="border-t border-[var(--color-border)]"
                  >
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                      <div
                        v-for="item in category.items"
                        :key="item.id"
                        class="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-[var(--color-border)] hover:shadow-lg transition-shadow"
                      >
                        <div class="relative h-40">
                          <img
                            :src="getMenuItemImage(item)"
                            :alt="item.nom"
                            class="w-full h-full object-cover"
                          />
                          <div class="absolute top-2 right-2 px-2 py-1 bg-[var(--color-primary)] text-white text-xs rounded font-medium">
                            {{ item.categorie }}
                          </div>
                        </div>
                        <div class="p-4">
                          <h4 class="font-semibold text-[var(--color-text)] mb-1">{{ item.nom }}</h4>
                          <p class="text-sm text-[var(--color-text-secondary)] mb-3 line-clamp-2">{{ item.description }}</p>
                          <div class="flex items-center justify-between">
                            <span class="text-lg font-bold text-[var(--color-primary)]">{{ item.prix }} FCFA</span>
                            <div class="flex items-center gap-2">
                              <button
                                @click="openEditMenuItemModal(item)"
                                class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                                title="Modifier"
                              >
                                <svg class="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                @click="confirmDeleteMenuItem(item)"
                                class="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                title="Supprimer"
                              >
                                <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Add/Edit Menu Item Modal -->
        <div v-if="showMenuItemModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4" @click.self="closeMenuItemModal">
          <div class="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div class="sticky top-0 bg-white dark:bg-gray-900 border-b border-[var(--color-border)] p-6">
              <div class="flex items-center justify-between">
                <h3 class="text-2xl font-bold text-[var(--color-text)]">
                  {{ editingMenuItem ? 'Modifier le plat' : 'Ajouter un plat' }}
                </h3>
                <button @click="closeMenuItemModal" class="p-2 hover:bg-[var(--color-surface)] rounded-lg transition-colors">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form @submit.prevent="handleMenuItemSubmit" class="p-6 space-y-4">
              <!-- Name -->
              <div>
                <label class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Nom du plat *</label>
                <input
                  v-model="menuItemFormData.nom"
                  type="text"
                  required
                  class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-orange-600 focus:ring-2 focus:ring-orange-600 focus:ring-opacity-20 transition-all"
                  placeholder="Burger Classique"
                />
              </div>

              <!-- Category -->
              <div>
                <label class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Catégorie *</label>
                <select
                  v-model="menuItemFormData.categorie"
                  required
                  class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-orange-600 focus:ring-2 focus:ring-orange-600 focus:ring-opacity-20 transition-all"
                >
                  <option value="">Sélectionnez une catégorie</option>
                  <option value="Hamburger">Hamburger</option>
                  <option value="Pizza">Pizza</option>
                  <option value="Salade">Salade</option>
                  <option value="Sandwich">Sandwich</option>
                  <option value="Omelletes">Omelletes</option>
                  <option value="Viande">Viande</option>
                  <option value="Gâteau">Gâteau</option>
                  <option value="Volailles">Volailles</option>
                  <option value="Poissons">Poissons</option>
                  <option value="Pates">Pates</option>
                  <option value="Milkshakes">Milkshakes</option>
                  <option value="Smoothies">Smoothies</option>
                  <option value="BubbleTea">BubbleTea</option>
                  <option value="Dessert">Dessert</option>
                  <option value="Crepes">Crepes</option>
                  <option value="Cocktails">Cocktails</option>
                  <option value="Cafe">Cafe</option>
                  <option value="Plats locaux">Plats locaux</option>
                  <option value="Entrée">Entrée</option>
                  <option value="Plat principal">Plat principal</option>
                  <option value="Accompagnements">Accompagnements</option>
                  <option value="Boisson">Boisson</option>

                </select>
              </div>

              <!-- Description -->
              <div>
                <label class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Description *</label>
                <textarea
                  v-model="menuItemFormData.description"
                  required
                  rows="3"
                  class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-orange-600 focus:ring-2 focus:ring-orange-600 focus:ring-opacity-20 transition-all"
                  placeholder="Décrivez le plat..."
                ></textarea>
              </div>

              <!-- Price -->
              <div>
                <label class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Prix (FCFA) *</label>
                <input
                  v-model.number="menuItemFormData.prix"
                  type="number"
                  min="0"
                  step="1"
                  required
                  class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-orange-600 focus:ring-2 focus:ring-orange-600 focus:ring-opacity-20 transition-all"
                  placeholder="2500"
                />
              </div>

              <!-- Images -->
              <div>
                <label class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Images du plat (plusieurs possibles)</label>
                <div class="space-y-3">
                  <div class="flex items-center gap-4">
                    <input
                      ref="menuFileInput"
                      type="file"
                      accept="image/*"
                      multiple
                      @change="handleMenuImageSelect"
                      class="hidden"
                    />
                    <button
                      type="button"
                      @click="$refs.menuFileInput.click()"
                      class="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium"
                    >
                      Choisir des images
                    </button>
                    <span v-if="selectedMenuImages.length > 0" class="text-sm text-gray-600 dark:text-gray-400">
                      {{ selectedMenuImages.length }} image(s) sélectionnée(s)
                    </span>
                    <span v-else-if="menuItemFormData.image && menuItemFormData.image.length > 0" class="text-sm text-green-600 dark:text-green-400">
                      {{ menuItemFormData.image.length }} image(s) existante(s)
                    </span>
                  </div>

                  <!-- Display multiple image previews in a grid -->
                  <div v-if="menuImagePreviews.length > 0 || (menuItemFormData.image && menuItemFormData.image.length > 0)" class="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div v-for="(preview, index) in (menuImagePreviews.length > 0 ? menuImagePreviews : menuItemFormData.image)" :key="index" class="relative group">
                      <img :src="preview" alt="Preview" class="w-full h-32 object-cover rounded-lg" />
                      <button
                        v-if="menuImagePreviews.length > 0"
                        type="button"
                        @click="removeMenuImage(index)"
                        class="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Error Message -->
              <div v-if="menuItemFormError" class="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p class="text-sm text-red-700">{{ menuItemFormError }}</p>
              </div>

              <!-- Actions -->
              <div class="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  @click="closeMenuItemModal"
                  class="px-6 py-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  :disabled="submitting"
                  class="px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ submitting ? 'Enregistrement...' : (editingMenuItem ? 'Mettre à jour' : 'Ajouter') }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Delete Menu Item Confirmation Modal -->
        <div v-if="showDeleteMenuItemModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4" @click.self="showDeleteMenuItemModal = false">
          <div class="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full p-6">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-bold text-[var(--color-text)]">Confirmer la suppression</h3>
                <p class="text-sm text-[var(--color-text-secondary)] mt-1">
                  Êtes-vous sûr de vouloir supprimer "{{ menuItemToDelete?.nom }}" ?
                </p>
              </div>
            </div>
            <div class="flex items-center justify-end gap-3">
              <button
                @click="showDeleteMenuItemModal = false"
                class="px-4 py-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors font-medium"
              >
                Annuler
              </button>
              <button
                @click="handleDeleteMenuItem"
                :disabled="submitting"
                class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ submitting ? 'Suppression...' : 'Supprimer' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Delete Slider Image Confirmation Modal -->
        <div v-if="showDeleteSliderModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="showDeleteSliderModal = false">
          <div class="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full p-6">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100">Confirmer la suppression</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Êtes-vous sûr de vouloir supprimer cette image du slider ?
                </p>
              </div>
            </div>
            <div class="flex items-center justify-end gap-3">
              <button
                @click="showDeleteSliderModal = false"
                class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors font-medium"
              >
                Annuler
              </button>
              <button
                @click="deleteSliderImage"
                :disabled="submitting"
                class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ submitting ? 'Suppression...' : 'Supprimer' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Add Slider Image Modal -->
        <div v-if="showAddSliderModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="closeAddSliderImageModal">
          <div class="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full">
            <div class="p-6 border-b border-gray-200 dark:border-gray-800">
              <div class="flex items-center justify-between">
                <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100">Ajouter une image au slider</h3>
                <button @click="closeAddSliderImageModal" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <svg class="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form @submit.prevent="handleAddSliderImage" class="p-6 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Image *</label>
                <div class="space-y-3">
                  <div class="flex items-center gap-4">
                    <input
                      ref="sliderFileInput"
                      type="file"
                      accept="image/*"
                      @change="handleSliderImageSelect"
                      class="hidden"
                      required
                    />
                    <button
                      type="button"
                      @click="$refs.sliderFileInput.click()"
                      class="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium"
                    >
                      Choisir une image
                    </button>
                    <span v-if="selectedSliderImage" class="text-sm text-gray-600 dark:text-gray-400">
                      Image sélectionnée
                    </span>
                  </div>

                  <div v-if="sliderImagePreview" class="relative">
                    <img :src="sliderImagePreview" alt="Preview" class="w-full h-48 object-cover rounded-lg" />
                  </div>
                </div>
              </div>

              <div v-if="sliderFormError" class="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                <p class="text-sm text-red-700 dark:text-red-400">{{ sliderFormError }}</p>
              </div>

              <div class="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  @click="closeAddSliderImageModal"
                  class="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  :disabled="submitting || !selectedSliderImage"
                  class="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ submitting ? 'Ajout...' : 'Ajouter' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import Navbar from '../components/Navbar.vue'
import { useAuth } from '../composables/useAuth'
import { useRestaurants } from '../composables/useRestaurants'
import { useStatistics } from '../composables/useStatistics'
import { useSupabaseStorage } from '../composables/useSupabaseStorage'
// import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore'
// import { db } from '../firebase/firebaseConfig'
import { supabase } from '../config/supabaseConfig'

export default {
  name: 'AdminDashboard',
  components: {
    Navbar
  },
  setup() {
    const { user, loading: authLoading, isAdmin, logout } = useAuth()
    const {
      restaurants,
      loading,
      stats,
      fetchRestaurants,
      addRestaurant,
      updateRestaurant,
      deleteRestaurant,
      menuItems,
      menuLoading,
      fetchMenu, // Use fetchMenu instead of fetchMenuItems
      addMenuItem,
      updateMenuItem,
      deleteMenuItem
    } = useRestaurants()

    const { getGlobalStats } = useStatistics()
    const { uploadMultipleImages } = useSupabaseStorage()

    onMounted(() => {
      console.log('[v0] AdminDashboard mounted')
      console.log('[v0] User:', user.value)
      console.log('[v0] Is Admin:', isAdmin.value)
      console.log('[v0] Auth Loading:', authLoading.value)

      if (isAdmin.value) {
        fetchRestaurants()
      }
    })

    return {
      user,
      authLoading,
      isAdmin,
      logout,
      restaurants,
      loading,
      stats,
      fetchRestaurants,
      addRestaurant,
      updateRestaurant,
      deleteRestaurant,
      menuItems,
      menuLoading,
      fetchMenu, // Use fetchMenu instead of fetchMenuItems
      addMenuItem,
      updateMenuItem,
      deleteMenuItem,
      getGlobalStats,
      uploadMultipleImages
    }
  },
  data() {
    return {
      showModal: false,
      showDeleteModal: false,
      editingRestaurant: null,
      restaurantToDelete: null,
      selectedImages: [],
      imagePreviews: [],
      submitting: false,
      formError: '',
      formData: {
        nom: '',
        type: '',
        adresse: '',
        description: '',
        numero: '',
        prix: '',
        note: 0,
        horaire: {
          lundi: '08:00-20:00',
          mardi: '08:00-20:00',
          mercredi: '08:00-20:00',
          jeudi: '08:00-20:00',
          vendredi: '08:00-20:00',
          samedi: '09:00-22:00',
          dimanche: '09:00-22:00'
        }
      },
      showMenuModal: false,
      showMenuItemModal: false,
      showDeleteMenuItemModal: false,
      selectedRestaurant: null,
      currentMenuItems: [],
      expandedCategories: [], // Track which category folders are open
      editingMenuItem: null,
      menuItemToDelete: null,
      selectedMenuImages: [],
      menuImagePreviews: [],
      menuItemFormError: '',
      menuItemFormData: {
        nom: '',
        description: '',
        prix: 0,
        categorie: '',
        image: []
      },
      // Initialize globalStats to avoid undefined errors before fetching
      globalStats: {
        totalRestaurants: 0,
        totalVisites: 0,
        totalFavoris: 0,
        usersWithFavorites: 0
      },
      // Added data properties for stats modal
      showStatsModal: false,
      selectedStatsRestaurant: null,
      sliderImages: [],
      sliderLoading: false,
      showAddSliderModal: false,
      showDeleteSliderModal: false,
      selectedSliderImage: null,
      sliderImagePreview: null,
      sliderImageToDelete: null,
      sliderFormError: '',
      // New properties for category management
      // expandedCategories: [], // This has been moved to the top section
      menuCategories: []
    }
  },
  computed: {
    
    menuCategories() {
      if (!this.currentMenuItems || this.currentMenuItems.length === 0) {
        return []
      }
      
      const grouped = {}
      this.currentMenuItems.forEach(item => {
        const category = item.categorie || 'Non catégorisé'
        if (!grouped[category]) {
          grouped[category] = []
        }
        grouped[category].push(item)
      })
      
      // Convert to array and sort alphabetically
      return Object.keys(grouped)
        .sort((a, b) => a.localeCompare(b))
        .map(name => ({
          name,
          items: grouped[name]
        }))
    }
  },
  async mounted() {
    if (this.isAdmin) {
      if (this.restaurants.length === 0) {
        await this.fetchRestaurants()
      }
      // Call loadGlobalStats after restaurants are loaded
      await this.loadGlobalStats()
      await this.fetchSliderImages()
    }
  },
  methods: {
    openAddModal() {
      this.editingRestaurant = null
      this.formData = {
        nom: '',
        type: '',
        adresse: '',
        description: '',
        numero: '',
        prix: '',
        note: 0,
        horaire: {
          lundi: '08:00-20:00',
          mardi: '08:00-20:00',
          mercredi: '08:00-20:00',
          jeudi: '08:00-20:00',
          vendredi: '08:00-20:00',
          samedi: '09:00-22:00',
          dimanche: '09:00-22:00'
        }
      }
      this.selectedImages = []
      this.imagePreviews = []
      this.formError = ''
      this.showModal = true
    },

    openEditModal(restaurant) {
      this.editingRestaurant = restaurant
      this.formData = {
        nom: restaurant.nom,
        type: restaurant.type || '',
        adresse: restaurant.adresse,
        description: restaurant.description,
        numero: restaurant.numero || '',
        prix: restaurant.prix || '',
        note: restaurant.note || 0,
        horaire: restaurant.horaire || {
          lundi: '08:00-20:00',
          mardi: '08:00-20:00',
          mercredi: '08:00-20:00',
          jeudi: '08:00-20:00',
          vendredi: '08:00-20:00',
          samedi: '09:00-22:00',
          dimanche: '09:00-22:00'
        },
        photo: restaurant.photo || []
      }
      this.selectedImages = []
      this.imagePreviews = []
      this.formError = ''
      this.showModal = true
    },

    closeModal() {
      this.showModal = false
      this.editingRestaurant = null
      this.selectedImages = []
      this.imagePreviews = []
      this.formError = ''
    },

    handleImageSelect(event) {
      const files = Array.from(event.target.files)
      this.selectedImages = files

      this.imagePreviews = []
      files.forEach(file => {
        const reader = new FileReader()
        reader.onload = (e) => {
          this.imagePreviews.push(e.target.result)
        }
        reader.readAsDataURL(file)
      })
    },

    removeImage(index) {
      this.selectedImages.splice(index, 1)
      this.imagePreviews.splice(index, 1)
    },

    async handleSubmit() {
      if (!this.formData.nom || !this.formData.type || !this.formData.adresse) {
        this.formError = 'Veuillez remplir tous les champs obligatoires'
        return
      }

      this.submitting = true
      this.formError = ''

      try {
        if (this.editingRestaurant) {
          await this.updateRestaurant(this.editingRestaurant.id, this.formData, this.selectedImages)
        } else {
          await this.addRestaurant(this.formData, this.selectedImages)
        }
        
        // Reload restaurants to show new data
        await this.fetchRestaurants()
        this.closeModal()
      } catch (err) {
        console.error('[v0] Error submitting restaurant:', err)
        this.formError = err.message
      } finally {
        this.submitting = false
      }
    },

    confirmDelete(restaurant) {
      this.restaurantToDelete = restaurant
      this.showDeleteModal = true
    },

    async handleDelete() {
      if (!this.restaurantToDelete) return

      this.submitting = true

      try {
        await this.deleteRestaurant(this.restaurantToDelete.id)
        // Reload restaurants to update list
        await this.fetchRestaurants()
        this.showDeleteModal = false
        this.restaurantToDelete = null
      } catch (err) {
        console.error('[v0] Error deleting restaurant:', err)
        alert('Erreur lors de la suppression: ' + err.message)
      } finally {
        this.submitting = false
      }
    },

    async handleLogout() {
      await this.logout()
      this.$router.push('/')
    },

    toggleCategory(categoryName) {
      const index = this.expandedCategories.indexOf(categoryName)
      if (index === -1) {
        this.expandedCategories.push(categoryName)
      } else {
        this.expandedCategories.splice(index, 1)
      }
    },

    async openMenuModal(restaurant) {
      this.selectedRestaurant = restaurant
      this.expandedCategories = []
      try {
        const menuData = await this.fetchMenu(restaurant.id) || []
        this.currentMenuItems = menuData
        this.organizeMenuItemsByCategory(menuData) // Organize by category
        this.expandedCategories = this.menuCategories.map(c => c.name)
      } catch (error) {
        console.error('[v0] Error loading menu:', error)
        this.currentMenuItems = []
        this.menuCategories = []
      }
      this.showMenuModal = true
    },

    closeMenuModal() {
      this.showMenuModal = false
      this.selectedRestaurant = null
      this.currentMenuItems = []
      this.menuCategories = [] // Clear categories when modal closes
      this.expandedCategories = [] // Reset expanded categories
    },

    openAddMenuItemModal() {
      this.editingMenuItem = null
      this.menuItemFormData = {
        nom: '',
        description: '',
        prix: 0,
        categorie: '',
        image: []
      }
      this.selectedMenuImages = []
      this.menuImagePreviews = []
      this.menuItemFormError = ''
      // Open modal immediately
      this.showMenuItemModal = true
    },

    openEditMenuItemModal(menuItem) {
      this.editingMenuItem = menuItem
      this.menuItemFormData = {
        nom: menuItem.nom,
        description: menuItem.description,
        prix: menuItem.prix,
        categorie: menuItem.categorie,
        image: menuItem.image || []
      }
      this.selectedMenuImages = []
      this.menuImagePreviews = []
      this.menuItemFormError = ''
      // Open modal immediately
      this.showMenuItemModal = true
    },

    closeMenuItemModal() {
      this.showMenuItemModal = false
      this.editingMenuItem = null
      this.selectedMenuImages = []
      this.menuImagePreviews = []
      this.menuItemFormError = ''
    },

    handleMenuImageSelect(event) {
      const files = Array.from(event.target.files)
      this.selectedMenuImages = files

      this.menuImagePreviews = []
      files.forEach(file => {
        const reader = new FileReader()
        reader.onload = (e) => {
          this.menuImagePreviews.push(e.target.result)
        }
        reader.readAsDataURL(file)
      })
    },

    removeMenuImage(index) {
      this.selectedMenuImages.splice(index, 1)
      this.menuImagePreviews.splice(index, 1)
    },

    // Helper to organize menu items by category
    organizeMenuItemsByCategory(items) {
      const categoriesMap = {}
      items.forEach(item => {
        const category = item.categorie || 'Non catégorisé'
        if (!categoriesMap[category]) {
          categoriesMap[category] = {
            name: category,
            items: []
          }
        }
        categoriesMap[category].items.push(item)
      })
      this.menuCategories = Object.values(categoriesMap)
    },

    // Reload restaurants after menu item changes to update dashboard
    async handleMenuItemSubmit() {
      if (!this.selectedRestaurant) return

      this.submitting = true
      this.menuItemFormError = ''

      try {
        if (this.editingMenuItem) {
          const result = await this.updateMenuItem(
            this.selectedRestaurant.id,
            this.editingMenuItem.id,
            this.menuItemFormData,
            this.selectedMenuImages
          )
          if (result.success) {
            this.closeMenuItemModal()
            const menuData = await this.fetchMenu(this.selectedRestaurant.id) || []
            this.currentMenuItems = menuData
            this.organizeMenuItemsByCategory(menuData) // Re-organize after update
            // Reload restaurants to update dashboard
            await this.fetchRestaurants()
          } else {
            this.menuItemFormError = result.error || 'Erreur lors de la mise à jour'
          }
        } else {
          const result = await this.addMenuItem(
            this.selectedRestaurant.id,
            this.menuItemFormData,
            this.selectedMenuImages
          )
          
          if (!result.success) {
            throw new Error(result.error || 'Failed to add menu item')
          }

          this.currentMenuItems = await this.fetchMenu(this.selectedRestaurant.id) || []
          // Update expanded categories to include the new item's category
          const newCategory = this.menuItemFormData.categorie
          if (newCategory && !this.expandedCategories.includes(newCategory)) {
            this.expandedCategories.push(newCategory)
          }
          
          this.closeMenuItemModal()
          await this.fetchRestaurants()
        }
      } catch (err) {
        console.error('[v0] Error submitting menu item:', err)
        this.menuItemFormError = err.message
      } finally {
        this.submitting = false
      }
    },

    confirmDeleteMenuItem(menuItem) {
      this.menuItemToDelete = menuItem
      this.showDeleteMenuItemModal = true
    },

    async handleDeleteMenuItem() {
      if (!this.menuItemToDelete || !this.selectedRestaurant) return

      this.submitting = true

      try {
        const result = await this.deleteMenuItem(this.selectedRestaurant.id, this.menuItemToDelete.id)
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to delete menu item')
        }
        
        this.currentMenuItems = this.currentMenuItems.filter(item => item.id !== this.menuItemToDelete.id)
        
        // Reload restaurants to update dashboard
        await this.fetchRestaurants()
        this.showDeleteMenuItemModal = false
        this.menuItemToDelete = null
      } catch (err) {
        console.error('[v0] Error deleting menu item:', err)
        alert('Erreur lors de la suppression: ' + err.message)
      } finally {
        this.submitting = false
      }
    },

    openStatsModal(restaurant) {
      this.selectedStatsRestaurant = restaurant
      this.showStatsModal = true
    },

    closeStatsModal() {
      this.showStatsModal = false
      this.selectedStatsRestaurant = null
    },

    calculateFavoriteRate(restaurant) {
      if (!restaurant?.stats?.visites || restaurant.stats.visites === 0) return 0
      return Math.round((restaurant.stats.favoris / restaurant.stats.visites) * 100)
    },

    calculatePopularity(restaurant) {
      const maxVisits = Math.max(...this.restaurants.map(r => r.stats?.visites || 0))
      if (maxVisits === 0) return 0
      return Math.round(((restaurant.stats?.visites || 0) / maxVisits) * 100)
    },

    async fetchSliderImages() {
      this.sliderLoading = true
      try {
        const { data, error } = await supabase
          .from('slider_images')
          .select('*')
          .order('order', { ascending: true })

        if (error) throw error

        this.sliderImages = data || []
        console.log('[v0] Loaded slider images from Supabase:', this.sliderImages.length)
      } catch (error) {
        console.error('[v0] Error loading slider images:', error)
      } finally {
        this.sliderLoading = false
      }
    },

    openAddSliderImageModal() {
      this.selectedSliderImage = null
      this.sliderImagePreview = null
      this.sliderFormError = ''
      this.showAddSliderModal = true
    },

    closeAddSliderImageModal() {
      this.showAddSliderModal = false
      this.selectedSliderImage = null
      this.sliderImagePreview = null
      this.sliderFormError = ''
    },

    handleSliderImageSelect(event) {
      const file = event.target.files[0]
      if (file) {
        this.selectedSliderImage = file
        const reader = new FileReader()
        reader.onload = (e) => {
          this.sliderImagePreview = e.target.result
        }
        reader.readAsDataURL(file)
      }
    },

    async handleAddSliderImage() {
      if (!this.selectedSliderImage) return

      this.submitting = true
      this.sliderFormError = ''

      try {
        const uploadResult = await this.uploadMultipleImages([this.selectedSliderImage], 'slider', '')

        if (!uploadResult.success || !uploadResult.urls || uploadResult.urls.length === 0) {
          throw new Error(uploadResult.error || 'Failed to upload image')
        }

        const { error: insertError } = await supabase
          .from('slider_images')
          .insert([{
            url: uploadResult.urls[0],
            order: this.sliderImages.length,
            created_at: new Date().toISOString()
          }])

        if (insertError) throw insertError

        await this.fetchSliderImages()
        this.closeAddSliderImageModal()
      } catch (error) {
        console.error('[v0] Error adding slider image:', error)
        this.sliderFormError = error.message || "Erreur lors de l'ajout de l'image"
      } finally {
        this.submitting = false
      }
    },

    confirmDeleteSliderImage(image) {
      this.sliderImageToDelete = image
      this.showDeleteSliderModal = true
    },

    async deleteSliderImage() {
      if (!this.sliderImageToDelete) return

      this.submitting = true // Indicate submission process
      try {
        const { error } = await supabase
          .from('slider_images')
          .delete()
          .eq('id', this.sliderImageToDelete.id)

        if (error) throw error

        await this.fetchSliderImages()
        this.showDeleteSliderModal = false
        this.sliderImageToDelete = null
      } catch (error) {
        console.error('[v0] Error deleting slider image:', error)
        // Optionally display an error message to the user
        alert('Erreur lors de la suppression de l\'image.')
      } finally {
        this.submitting = false // End submission process
      }
    },

    async loadGlobalStats() {
      try {
        const { data: restaurantsData, error: restaurantsError } = await supabase
          .from('restaurants')
          .select('visites, avis')

        if (restaurantsError) {
          console.error('[v0] Error fetching restaurants for stats:', restaurantsError)
          throw restaurantsError
        }

        // Get total restaurants
        const totalRestaurants = restaurantsData?.length || 0

        // Get total visits from restaurants
        const totalVisites = restaurantsData?.reduce((sum, r) => sum + (r.visites || 0), 0) || 0

        const { count: totalFavoris, error: favError } = await supabase
          .from('favorites')
          .select('*', { count: 'exact', head: true })

        if (favError) {
          console.error('[v0] Error getting favorites count:', favError)
        }

        // Get unique users with favorites
        const { data: uniqueUsers, error: usersError } = await supabase
          .from('favorites')
          .select('user_id')
        
        const usersWithFavorites = uniqueUsers ? [...new Set(uniqueUsers.map(f => f.user_id))].length : 0

        this.globalStats = {
          totalRestaurants,
          totalVisites,
          totalFavoris: totalFavoris || 0,
          usersWithFavorites
        }

        console.log('[v0] Global stats loaded:', this.globalStats)
      } catch (error) {
        console.error('[v0] Error loading global stats:', error)
      }
    },

    getMenuItemImage(item) {
      if (!item.image) return '/placeholder.svg?height=160&width=320'
      // Handle string stored as "['url']" format from old data
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
      return '/placeholder.svg?height=160&width=320'
    },
  }
}
</script>
