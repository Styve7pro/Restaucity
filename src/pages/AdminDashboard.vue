<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">

    <!-- Vérification auth -->
    <div v-if="authLoading" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto mb-4"></div>
        <p class="text-[var(--color-text-secondary)]">Vérification des droits d'accès…</p>
      </div>
    </div>

    <div v-else-if="!isAdmin" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-[var(--color-text)] mb-2">Accès refusé</h2>
        <p class="text-[var(--color-text-secondary)] mb-6">Vous n'avez pas les droits administrateur</p>
        <router-link to="/" class="px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors font-medium inline-block">
          Retour à l'accueil
        </router-link>
      </div>
    </div>

    <div v-else>
      <Navbar />

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        <!-- Stats globales -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div v-for="stat in globalStatCards" :key="stat.label" class="bg-white dark:bg-gray-900 rounded-xl shadow-md p-5 border border-gray-200 dark:border-gray-800">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">{{ stat.label }}</p>
                <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ stat.value }}</p>
              </div>
              <div :class="`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center`">
                <span class="text-xl">{{ stat.icon }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Slider -->
        <div class="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 mb-8">
          <div class="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <div>
              <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">Gestion du Slider</h2>
              <p class="text-sm text-gray-500 mt-1">Images de la page d'accueil</p>
            </div>
            <button @click="showAddSliderModal = true" class="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors font-medium flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
              Ajouter
            </button>
          </div>
          <div class="p-6">
            <div v-if="sliderLoading" class="text-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)] mx-auto"></div>
            </div>
            <div v-else-if="sliderImages.length === 0" class="text-center py-8 text-gray-500">Aucune image dans le slider</div>
            <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <div v-for="img in sliderImages" :key="img.id" class="relative group rounded-lg overflow-hidden">
                <img :src="img.url" alt="Slider" loading="lazy" class="w-full h-40 object-cover" />
                <div class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                  <button @click="confirmDeleteSlider(img)" class="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-red-600 text-white rounded-lg">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Restaurants -->
        <div class="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-800">
          <div class="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <div>
              <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">Gestion des Restaurants</h2>
              <p class="text-sm text-gray-500 mt-1">{{ restaurants.length }} restaurant(s)</p>
            </div>
            <button @click="openAddModal" class="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors font-medium flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
              Ajouter
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Restaurant</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Type</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Note</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Prix</th>
                  <th class="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
                <tr v-for="r in restaurants" :key="r.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <img
                        :src="(r.photos || r.photo || [])[0] || '/placeholder.svg'"
                        :alt="r.nom"
                        loading="lazy"
                        class="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                        @error="(e) => e.target.src = '/placeholder.svg'"
                      />
                      <div class="min-w-0">
                        <p class="font-semibold text-gray-900 dark:text-gray-100 truncate">{{ r.nom }}</p>
                        <p class="text-sm text-gray-500 truncate">{{ r.adresse }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-gray-600 dark:text-gray-300 text-sm">{{ r.type || '—' }}</td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-1">
                      <svg class="w-4 h-4 fill-yellow-400" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                      <span class="font-semibold text-gray-900 dark:text-gray-100">{{ r.note || 0 }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-[var(--color-primary)] font-semibold text-sm">{{ r.prix || '—' }}</td>
                  <td class="px-6 py-4">
                    <div class="flex items-center justify-end gap-2">
                      <button @click="openMenuModal(r)" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" title="Menu">
                        <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                      </button>
                      <button @click="openEditModal(r)" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" title="Modifier">
                        <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button @click="confirmDelete(r)" class="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Supprimer">
                        <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ── Modals ──────────────────────────────────────────────── -->

      <!-- Add/Edit Restaurant -->
      <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="closeModal">
        <div class="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6 flex items-center justify-between">
            <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100">{{ editingRestaurant ? 'Modifier' : 'Ajouter' }} un restaurant</h3>
            <button @click="closeModal" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom *</label>
                <input v-model="formData.nom" type="text" required class="form-input" placeholder="Le Gourmet" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type *</label>
                <select v-model="formData.type" required class="form-input">
                  <option value="">Sélectionner</option>
                  <option v-for="t in cuisineTypes" :key="t" :value="t">{{ t }}</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Adresse *</label>
              <input v-model="formData.adresse" type="text" required class="form-input" placeholder="123 Rue..." />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Téléphone</label>
              <input v-model="formData.numero" type="tel" class="form-input" placeholder="+242..." />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
              <textarea v-model="formData.description" required rows="3" class="form-input resize-none" placeholder="Décrivez le restaurant…"></textarea>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prix *</label>
                <select v-model="formData.prix" required class="form-input">
                  <option value="">Sélectionner</option>
                  <option value="FCFA">FCFA - Économique</option>
                  <option value="FCFA FCFA">FCFA FCFA - Modéré</option>
                  <option value="FCFA FCFA FCFA">FCFA FCFA FCFA - Élevé</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Note initiale</label>
                <input v-model.number="formData.note" type="number" min="0" max="5" step="0.1" class="form-input" placeholder="4.5" />
              </div>
            </div>

            <!-- Horaires -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Horaires</label>
              <div class="space-y-2">
                <div v-for="day in Object.keys(formData.horaire)" :key="day" class="flex items-center gap-3">
                  <span class="w-24 text-sm text-gray-600 dark:text-gray-400 capitalize">{{ day }}</span>
                  <input v-model="formData.horaire[day]" type="text" class="flex-1 px-3 py-1.5 text-sm form-input" placeholder="08:00-20:00" />
                </div>
              </div>
            </div>

            <!-- Images -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Images</label>
              <input ref="fileInput" type="file" accept="image/*" multiple class="hidden" @change="handleImageSelect" />
              <button type="button" @click="$refs.fileInput.click()" class="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium">
                Choisir des images
              </button>
              <span v-if="selectedImages.length > 0" class="ml-3 text-sm text-gray-500">{{ selectedImages.length }} sélectionnée(s)</span>
              <div v-if="imagePreviews.length > 0" class="grid grid-cols-3 gap-2 mt-3">
                <div v-for="(p, i) in imagePreviews" :key="i" class="relative group">
                  <img :src="p" class="w-full h-24 object-cover rounded-lg" />
                  <button type="button" @click="removeImage(i)" class="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 flex items-center justify-center">✕</button>
                </div>
              </div>
            </div>

            <div v-if="formError" class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p class="text-sm text-red-700 dark:text-red-400">{{ formError }}</p>
            </div>

            <div class="flex justify-end gap-3 pt-2">
              <button type="button" @click="closeModal" class="px-6 py-2 text-gray-600 dark:text-gray-400 font-medium">Annuler</button>
              <button type="submit" :disabled="submitting" class="px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors font-medium disabled:opacity-50">
                {{ submitting ? 'Enregistrement…' : (editingRestaurant ? 'Mettre à jour' : 'Ajouter') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Delete restaurant -->
      <div v-if="showDeleteModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full p-6">
          <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Confirmer la suppression</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6">Supprimer "{{ restaurantToDelete?.nom }}" ? Cette action est irréversible.</p>
          <div class="flex justify-end gap-3">
            <button @click="showDeleteModal = false" class="px-4 py-2 text-gray-600 dark:text-gray-400 font-medium">Annuler</button>
            <button @click="handleDelete" :disabled="submitting" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50">
              {{ submitting ? 'Suppression…' : 'Supprimer' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Menu modal (simplifié) -->
      <div v-if="showMenuModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="showMenuModal = false">
        <div class="bg-white dark:bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div class="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6 flex items-center justify-between">
            <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100">Menu — {{ selectedRestaurant?.nom }}</h3>
            <div class="flex items-center gap-3">
              <button @click="openAddMenuItemModal" class="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium">+ Ajouter un plat</button>
              <button @click="showMenuModal = false" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
          </div>
          <div class="p-6">
            <div v-if="menuLoading" class="text-center py-8"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)] mx-auto"></div></div>
            <div v-else-if="currentMenuItems.length === 0" class="text-center py-8 text-gray-500">Aucun plat. Ajoutez-en un !</div>
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-for="item in currentMenuItems" :key="item.id" class="bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                <img :src="getMenuImage(item)" :alt="item.nom" loading="lazy" class="w-full h-36 object-cover" @error="(e) => e.target.src = '/placeholder.svg'" />
                <div class="p-3">
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0">
                      <p class="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">{{ item.nom }}</p>
                      <p class="text-xs text-gray-500 line-clamp-2 mt-0.5">{{ item.description }}</p>
                    </div>
                  </div>
                  <div class="flex items-center justify-between mt-2">
                    <span class="text-[var(--color-primary)] font-bold text-sm">{{ item.prix }} FCFA</span>
                    <div class="flex gap-1">
                      <button @click="openEditMenuItemModal(item)" class="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors">
                        <svg class="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button @click="confirmDeleteMenuItem(item)" class="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
                        <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add/Edit Menu Item modal -->
      <div v-if="showMenuItemModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" @click.self="showMenuItemModal = false">
        <div class="bg-white dark:bg-gray-900 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <div class="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6 flex items-center justify-between">
            <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100">{{ editingMenuItem ? 'Modifier' : 'Ajouter' }} un plat</h3>
            <button @click="showMenuItemModal = false" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          <form @submit.prevent="handleMenuItemSubmit" class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom *</label>
              <input v-model="menuItemFormData.nom" type="text" required class="form-input" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Catégorie *</label>
              <select v-model="menuItemFormData.categorie" required class="form-input">
                <option value="">Sélectionner</option>
                <option v-for="c in menuCategories" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
              <textarea v-model="menuItemFormData.description" required rows="3" class="form-input resize-none"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prix (FCFA) *</label>
              <input v-model.number="menuItemFormData.prix" type="number" min="0" required class="form-input" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Image</label>
              <input ref="menuFileInput" type="file" accept="image/*" multiple class="hidden" @change="handleMenuImageSelect" />
              <button type="button" @click="$refs.menuFileInput.click()" class="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium">Choisir</button>
              <div v-if="menuImagePreviews.length > 0" class="grid grid-cols-3 gap-2 mt-3">
                <img v-for="(p, i) in menuImagePreviews" :key="i" :src="p" class="w-full h-20 object-cover rounded-lg" />
              </div>
            </div>
            <div v-if="menuItemFormError" class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p class="text-sm text-red-700 dark:text-red-400">{{ menuItemFormError }}</p>
            </div>
            <div class="flex justify-end gap-3 pt-2">
              <button type="button" @click="showMenuItemModal = false" class="px-6 py-2 text-gray-600 dark:text-gray-400 font-medium">Annuler</button>
              <button type="submit" :disabled="submitting" class="px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors font-medium disabled:opacity-50">
                {{ submitting ? 'Enregistrement…' : (editingMenuItem ? 'Mettre à jour' : 'Ajouter') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Delete menu item -->
      <div v-if="showDeleteMenuItemModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
        <div class="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full p-6">
          <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Supprimer ce plat ?</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6">"{{ menuItemToDelete?.nom }}" sera supprimé définitivement.</p>
          <div class="flex justify-end gap-3">
            <button @click="showDeleteMenuItemModal = false" class="px-4 py-2 text-gray-600 dark:text-gray-400 font-medium">Annuler</button>
            <button @click="handleDeleteMenuItem" :disabled="submitting" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50">
              {{ submitting ? 'Suppression…' : 'Supprimer' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Add Slider Image -->
      <div v-if="showAddSliderModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="showAddSliderModal = false">
        <div class="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full">
          <div class="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100">Ajouter une image slider</h3>
            <button @click="showAddSliderModal = false" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          <form @submit.prevent="handleAddSliderImage" class="p-6 space-y-4">
            <input ref="sliderFileInput" type="file" accept="image/*" class="hidden" @change="handleSliderImageSelect" />
            <button type="button" @click="$refs.sliderFileInput.click()" class="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium">Choisir une image</button>
            <div v-if="sliderImagePreview" class="rounded-lg overflow-hidden"><img :src="sliderImagePreview" class="w-full h-48 object-cover" /></div>
            <div v-if="sliderFormError" class="p-3 bg-red-50 border border-red-200 rounded-lg"><p class="text-sm text-red-700">{{ sliderFormError }}</p></div>
            <div class="flex justify-end gap-3">
              <button type="button" @click="showAddSliderModal = false" class="px-6 py-2 text-gray-600 dark:text-gray-400 font-medium">Annuler</button>
              <button type="submit" :disabled="submitting || !selectedSliderImage" class="px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg font-medium disabled:opacity-50">
                {{ submitting ? 'Ajout…' : 'Ajouter' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Delete slider -->
      <div v-if="showDeleteSliderModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full p-6">
          <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Supprimer cette image ?</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6">Cette image sera retirée du slider.</p>
          <div class="flex justify-end gap-3">
            <button @click="showDeleteSliderModal = false" class="px-4 py-2 text-gray-600 dark:text-gray-400 font-medium">Annuler</button>
            <button @click="deleteSliderImage" :disabled="submitting" class="px-4 py-2 bg-red-600 text-white rounded-lg font-medium disabled:opacity-50">
              {{ submitting ? 'Suppression…' : 'Supprimer' }}
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { onMounted } from 'vue'
import Navbar from '../components/Navbar.vue'
import { useAuth } from '../composables/useAuth'
import { useRestaurants } from '../composables/useRestaurants'
import { useStatistics } from '../composables/useStatistics'
import { useSupabaseStorage } from '../composables/useSupabaseStorage'
import { useToast } from '../composables/useToast'
import { supabase } from '../config/supabaseConfig'

export default {
  name: 'AdminDashboard',
  components: { Navbar },
  setup() {
    const { user, loading: authLoading, isAdmin, logout } = useAuth()
    const { restaurants, loading, fetchRestaurants, addRestaurant, updateRestaurant, deleteRestaurant, menuItems, menuLoading, fetchMenu, addMenuItem, updateMenuItem, deleteMenuItem } = useRestaurants()
    const { getGlobalStats } = useStatistics()
    const { uploadMultipleImages } = useSupabaseStorage()
    const toast = useToast()

    onMounted(async () => {
      if (isAdmin.value) {
        await fetchRestaurants()
      }
    })

    return { user, authLoading, isAdmin, logout, restaurants, loading, fetchRestaurants, addRestaurant, updateRestaurant, deleteRestaurant, menuItems, menuLoading, fetchMenu, addMenuItem, updateMenuItem, deleteMenuItem, getGlobalStats, uploadMultipleImages, toast }
  },
  data() {
    return {
      globalStats: { totalRestaurants: 0, totalVisites: 0, totalFavoris: 0, usersWithFavorites: 0 },
      showModal: false, editingRestaurant: null, submitting: false, formError: '',
      formData: { nom: '', type: '', adresse: '', description: '', numero: '', prix: '', note: 0, horaire: this.defaultHoraire(), photos: [] },
      selectedImages: [], imagePreviews: [],
      showDeleteModal: false, restaurantToDelete: null,
      showMenuModal: false, selectedRestaurant: null, currentMenuItems: [],
      showMenuItemModal: false, editingMenuItem: null, menuItemFormData: { nom: '', description: '', prix: 0, categorie: '', image: null },
      menuItemFormError: '', selectedMenuImages: [], menuImagePreviews: [],
      showDeleteMenuItemModal: false, menuItemToDelete: null,
      sliderImages: [], sliderLoading: false,
      showAddSliderModal: false, selectedSliderImage: null, sliderImagePreview: null, sliderFormError: '',
      showDeleteSliderModal: false, sliderImageToDelete: null,
      cuisineTypes: ['Pâtisserie', 'Fastfood', 'Cuisine Africaine', 'Cuisine Française', 'Cuisine Italienne', 'Cuisine Asiatique', 'Pizzeria', 'Burger', 'Café', 'Bar', 'Restaurant Gastronomique'],
      menuCategories: ['Hamburger', 'Pizza', 'Salade', 'Sandwich', 'Viande', 'Gâteau', 'Volailles', 'Poissons', 'Pates', 'Milkshakes', 'Smoothies', 'BubbleTea', 'Dessert', 'Crepes', 'Cocktails', 'Cafe', 'Plats locaux', 'Entrée', 'Plat principal', 'Accompagnements', 'Boisson'],
    }
  },
  computed: {
    globalStatCards() {
      return [
        { label: 'Restaurants', value: this.globalStats.totalRestaurants, icon: '🍽️', bg: 'bg-orange-100 dark:bg-orange-900/30' },
        { label: 'Visites', value: this.globalStats.totalVisites, icon: '👁️', bg: 'bg-blue-100 dark:bg-blue-900/30' },
        { label: 'Favoris', value: this.globalStats.totalFavoris, icon: '❤️', bg: 'bg-red-100 dark:bg-red-900/30' },
        { label: 'Utilisateurs actifs', value: this.globalStats.usersWithFavorites, icon: '👥', bg: 'bg-green-100 dark:bg-green-900/30' },
      ]
    },
  },
  async mounted() {
    if (this.isAdmin) {
      await Promise.all([this.loadGlobalStats(), this.fetchSliderImages()])
    }
  },
  methods: {
    defaultHoraire() {
      return { lundi: '08:00-20:00', mardi: '08:00-20:00', mercredi: '08:00-20:00', jeudi: '08:00-20:00', vendredi: '08:00-20:00', samedi: '09:00-22:00', dimanche: '09:00-22:00' }
    },
    async loadGlobalStats() {
      try {
        this.globalStats = await this.getGlobalStats()
      } catch (e) { console.error(e) }
    },

    // ── Restaurants ──
    openAddModal() {
      this.editingRestaurant = null
      this.formData = { nom: '', type: '', adresse: '', description: '', numero: '', prix: '', note: 0, horaire: this.defaultHoraire(), photos: [] }
      this.selectedImages = []; this.imagePreviews = []; this.formError = ''
      this.showModal = true
    },
    openEditModal(r) {
      this.editingRestaurant = r
      this.formData = { nom: r.nom, type: r.type || '', adresse: r.adresse, description: r.description, numero: r.numero || '', prix: r.prix || '', note: r.note || 0, horaire: { ...this.defaultHoraire(), ...(r.horaire || {}) }, photos: r.photos || [] }
      this.selectedImages = []; this.imagePreviews = []; this.formError = ''
      this.showModal = true
    },
    closeModal() { this.showModal = false; this.editingRestaurant = null; this.selectedImages = []; this.imagePreviews = []; this.formError = '' },
    handleImageSelect(e) {
      this.selectedImages = Array.from(e.target.files)
      this.imagePreviews = []
      this.selectedImages.forEach(f => { const r = new FileReader(); r.onload = ev => this.imagePreviews.push(ev.target.result); r.readAsDataURL(f) })
    },
    removeImage(i) { this.selectedImages.splice(i, 1); this.imagePreviews.splice(i, 1) },
    async handleSubmit() {
      if (!this.formData.nom || !this.formData.type || !this.formData.adresse) { this.formError = 'Remplissez les champs obligatoires'; return }
      this.submitting = true; this.formError = ''
      try {
        if (this.editingRestaurant) {
          await this.updateRestaurant(this.editingRestaurant.id, this.formData, this.selectedImages)
          this.toast.success('Restaurant mis à jour !')
        } else {
          await this.addRestaurant(this.formData, this.selectedImages)
          this.toast.success('Restaurant ajouté !')
        }
        await Promise.all([this.fetchRestaurants(true), this.loadGlobalStats()])
        this.closeModal()
      } catch (e) { this.formError = e.message; this.toast.error('Erreur: ' + e.message) }
      finally { this.submitting = false }
    },
    confirmDelete(r) { this.restaurantToDelete = r; this.showDeleteModal = true },
    async handleDelete() {
      this.submitting = true
      try {
        await this.deleteRestaurant(this.restaurantToDelete.id)
        this.toast.success('Restaurant supprimé')
        this.showDeleteModal = false; this.restaurantToDelete = null
        await this.loadGlobalStats()
      } catch (e) { this.toast.error('Erreur: ' + e.message) }
      finally { this.submitting = false }
    },

    // ── Menu ──
    async openMenuModal(r) {
      this.selectedRestaurant = r
      this.showMenuModal = true
      this.currentMenuItems = await this.fetchMenu(r.id)
    },
    openAddMenuItemModal() {
      this.editingMenuItem = null
      this.menuItemFormData = { nom: '', description: '', prix: 0, categorie: '', image: null }
      this.selectedMenuImages = []; this.menuImagePreviews = []; this.menuItemFormError = ''
      this.showMenuItemModal = true
    },
    openEditMenuItemModal(item) {
      this.editingMenuItem = item
      this.menuItemFormData = { nom: item.nom, description: item.description, prix: item.prix, categorie: item.categorie, image: item.image }
      this.selectedMenuImages = []; this.menuImagePreviews = []; this.menuItemFormError = ''
      this.showMenuItemModal = true
    },
    handleMenuImageSelect(e) {
      this.selectedMenuImages = Array.from(e.target.files)
      this.menuImagePreviews = []
      this.selectedMenuImages.forEach(f => { const r = new FileReader(); r.onload = ev => this.menuImagePreviews.push(ev.target.result); r.readAsDataURL(f) })
    },
    async handleMenuItemSubmit() {
      this.submitting = true; this.menuItemFormError = ''
      try {
        if (this.editingMenuItem) {
          await this.updateMenuItem(this.selectedRestaurant.id, this.editingMenuItem.id, this.menuItemFormData, this.selectedMenuImages)
          this.toast.success('Plat mis à jour !')
        } else {
          await this.addMenuItem(this.selectedRestaurant.id, this.menuItemFormData, this.selectedMenuImages)
          this.toast.success('Plat ajouté !')
        }
        this.currentMenuItems = await this.fetchMenu(this.selectedRestaurant.id)
        this.showMenuItemModal = false
      } catch (e) { this.menuItemFormError = e.message; this.toast.error('Erreur: ' + e.message) }
      finally { this.submitting = false }
    },
    confirmDeleteMenuItem(item) { this.menuItemToDelete = item; this.showDeleteMenuItemModal = true },
    async handleDeleteMenuItem() {
      this.submitting = true
      try {
        await this.deleteMenuItem(this.selectedRestaurant.id, this.menuItemToDelete.id)
        this.currentMenuItems = this.currentMenuItems.filter(m => m.id !== this.menuItemToDelete.id)
        this.toast.success('Plat supprimé')
        this.showDeleteMenuItemModal = false
      } catch (e) { this.toast.error('Erreur: ' + e.message) }
      finally { this.submitting = false }
    },

    // ── Slider ──
    async fetchSliderImages() {
      this.sliderLoading = true
      const { data } = await supabase.from('slider_images').select('*').order('order', { ascending: true })
      this.sliderImages = data || []
      this.sliderLoading = false
    },
    handleSliderImageSelect(e) {
      this.selectedSliderImage = e.target.files[0]
      if (this.selectedSliderImage) {
        const r = new FileReader(); r.onload = ev => this.sliderImagePreview = ev.target.result; r.readAsDataURL(this.selectedSliderImage)
      }
    },
    async handleAddSliderImage() {
      if (!this.selectedSliderImage) return
      this.submitting = true; this.sliderFormError = ''
      try {
        const result = await this.uploadMultipleImages([this.selectedSliderImage], 'slider')
        const url = result.urls?.[0]
        if (!url) throw new Error('Upload échoué')
        await supabase.from('slider_images').insert([{ url, order: this.sliderImages.length, created_at: new Date().toISOString() }])
        await this.fetchSliderImages()
        this.showAddSliderModal = false; this.selectedSliderImage = null; this.sliderImagePreview = null
        this.toast.success('Image ajoutée au slider !')
      } catch (e) { this.sliderFormError = e.message; this.toast.error('Erreur upload') }
      finally { this.submitting = false }
    },
    confirmDeleteSlider(img) { this.sliderImageToDelete = img; this.showDeleteSliderModal = true },
    async deleteSliderImage() {
      this.submitting = true
      try {
        await supabase.from('slider_images').delete().eq('id', this.sliderImageToDelete.id)
        await this.fetchSliderImages()
        this.showDeleteSliderModal = false; this.sliderImageToDelete = null
        this.toast.success('Image supprimée')
      } catch (e) { this.toast.error('Erreur: ' + e.message) }
      finally { this.submitting = false }
    },

    getMenuImage(item) {
      if (!item.image) return '/placeholder.svg'
      if (typeof item.image === 'string') {
        if (item.image.startsWith('[')) { try { const p = JSON.parse(item.image.replace(/'/g, '"')); return p[0] || '/placeholder.svg' } catch { return item.image } }
        return item.image
      }
      if (Array.isArray(item.image)) return item.image[0] || '/placeholder.svg'
      return '/placeholder.svg'
    },
  },
}
</script>

<style scoped>
.form-input {
  @apply w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-20 transition-all;
}
</style>
