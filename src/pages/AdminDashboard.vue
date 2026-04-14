<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">

    <!-- Auth check -->
    <div v-if="authLoading" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto mb-4"></div>
        <p class="text-[var(--color-text-secondary)]">Vérification des droits…</p>
      </div>
    </div>

    <div v-else-if="!isAdmin" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        </div>
        <h2 class="text-2xl font-bold text-[var(--color-text)] mb-2">Accès refusé</h2>
        <router-link to="/" class="px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg font-medium inline-block mt-4">Retour</router-link>
      </div>
    </div>

    <div v-else>
      <Navbar />
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">

        <!-- Stats -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-for="stat in globalStatCards" :key="stat.label" class="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-5 border border-gray-200 dark:border-gray-800">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">{{ stat.label }}</p>
                <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ stat.value }}</p>
              </div>
              <div :class="`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center text-xl`">{{ stat.icon }}</div>
            </div>
          </div>
        </div>

        <!-- Slider -->
        <div class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
          <div class="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <div>
              <h2 class="text-lg font-bold text-gray-900 dark:text-gray-100">Slider accueil</h2>
              <p class="text-sm text-gray-500 mt-0.5">{{ sliderImages.length }} image(s)</p>
            </div>
            <button @click="showAddSliderModal = true" class="btn-primary text-sm flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              Ajouter
            </button>
          </div>
          <div class="p-6">
            <div v-if="sliderLoading" class="flex justify-center py-6"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div></div>
            <p v-else-if="sliderImages.length === 0" class="text-center text-gray-500 py-6 text-sm">Aucune image dans le slider</p>
            <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              <div v-for="img in sliderImages" :key="img.id" class="relative group rounded-xl overflow-hidden aspect-video bg-gray-100 dark:bg-gray-800">
                <img :src="img.url" alt="Slider" loading="lazy" class="w-full h-full object-cover" />
                <div class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                  <button @click="confirmDeleteSlider(img)" class="opacity-0 group-hover:opacity-100 p-2 bg-red-600 text-white rounded-lg transition-opacity">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Restaurants -->
        <div class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
          <div class="p-6 border-b border-gray-200 dark:border-gray-800 flex flex-wrap gap-3 items-center justify-between">
            <div>
              <h2 class="text-lg font-bold text-gray-900 dark:text-gray-100">Restaurants</h2>
              <p class="text-sm text-gray-500 mt-0.5">{{ restaurants.length }} restaurant(s)</p>
            </div>
            <!-- Boutons : formulaire OU import JSON -->
            <div class="flex gap-2 flex-wrap">
              <button @click="openAddModal" class="btn-primary text-sm flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                Formulaire
              </button>
              <button @click="showImportRestaurantModal = true" class="btn-secondary text-sm flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                Import JSON
              </button>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th class="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Restaurant</th>
                  <th class="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden sm:table-cell">Type</th>
                  <th class="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden md:table-cell">Note</th>
                  <th class="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                <tr v-for="r in restaurants" :key="r.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                  <td class="px-5 py-3.5">
                    <div class="flex items-center gap-3">
                      <img
                        :src="(r.photos || r.photo || [])[0] || '/placeholder.svg'"
                        :alt="r.nom" loading="lazy"
                        class="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-gray-100"
                        @error="(e) => e.target.src = '/placeholder.svg'"
                      />
                      <div class="min-w-0">
                        <p class="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">{{ r.nom }}</p>
                        <p class="text-xs text-gray-500 truncate">{{ r.adresse }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-400 hidden sm:table-cell">{{ r.type || '—' }}</td>
                  <td class="px-5 py-3.5 hidden md:table-cell">
                    <div class="flex items-center gap-1">
                      <svg class="w-3.5 h-3.5 fill-amber-400" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      <span class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ r.note || 0 }}</span>
                    </div>
                  </td>
                  <td class="px-5 py-3.5">
                    <div class="flex items-center justify-end gap-1">
                      <button @click="openMenuModal(r)" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" title="Gérer le menu">
                        <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                      </button>
                      <button @click="openEditModal(r)" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" title="Modifier">
                        <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      </button>
                      <button @click="confirmDelete(r)" class="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Supprimer">
                        <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ════════════════════════════════════════════════════════
           MODALS
      ════════════════════════════════════════════════════════ -->

      <!-- Import JSON Restaurants -->
      <div v-if="showImportRestaurantModal" class="modal-backdrop" @click.self="showImportRestaurantModal = false">
        <div class="modal-box max-w-2xl">
          <div class="modal-header">
            <div>
              <h3 class="modal-title">Import JSON — Restaurants</h3>
              <p class="modal-subtitle">Créez plusieurs restaurants en une seule fois</p>
            </div>
            <button @click="showImportRestaurantModal = false" class="modal-close-btn">✕</button>
          </div>
          <div class="p-6">
            <JsonImporter
              :validator="validateRestaurantItem"
              item-label="restaurant"
              example-url="/exemples/restaurants-exemple.json"
              @import="handleImportRestaurants"
            />
          </div>
        </div>
      </div>

      <!-- Add/Edit Restaurant (formulaire) -->
      <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
        <div class="modal-box max-w-2xl">
          <div class="modal-header">
            <h3 class="modal-title">{{ editingRestaurant ? 'Modifier' : 'Ajouter' }} un restaurant</h3>
            <button @click="closeModal" class="modal-close-btn">✕</button>
          </div>
          <form @submit.prevent="handleSubmit" class="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="form-label">Nom *</label>
                <input v-model="formData.nom" type="text" required class="form-input" placeholder="Le Gourmet" />
              </div>
              <div>
                <label class="form-label">Type *</label>
                <select v-model="formData.type" required class="form-input">
                  <option value="">Sélectionner</option>
                  <option v-for="t in cuisineTypes" :key="t" :value="t">{{ t }}</option>
                </select>
              </div>
            </div>
            <div>
              <label class="form-label">Adresse *</label>
              <input v-model="formData.adresse" type="text" required class="form-input" />
            </div>
            <div>
              <label class="form-label">Téléphone</label>
              <input v-model="formData.numero" type="tel" class="form-input" placeholder="+242…" />
            </div>
            <div>
              <label class="form-label">Description *</label>
              <textarea v-model="formData.description" required rows="3" class="form-input resize-none"></textarea>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="form-label">Prix *</label>
                <select v-model="formData.prix" required class="form-input">
                  <option value="">Sélectionner</option>
                  <option value="FCFA">FCFA — Économique</option>
                  <option value="FCFA FCFA">FCFA FCFA — Modéré</option>
                  <option value="FCFA FCFA FCFA">FCFA FCFA FCFA — Élevé</option>
                </select>
              </div>
              <div>
                <label class="form-label">Note initiale</label>
                <input v-model.number="formData.note" type="number" min="0" max="5" step="0.1" class="form-input" placeholder="4.5" />
              </div>
            </div>
            <div>
              <label class="form-label">Horaires</label>
              <div class="space-y-1.5">
                <div v-for="day in Object.keys(formData.horaire)" :key="day" class="flex items-center gap-3">
                  <span class="w-24 text-sm text-gray-600 dark:text-gray-400 capitalize">{{ day }}</span>
                  <input v-model="formData.horaire[day]" type="text" class="flex-1 text-sm form-input py-1.5" placeholder="08:00-20:00" />
                </div>
              </div>
            </div>
            <div>
              <label class="form-label">Images</label>
              <input ref="fileInput" type="file" accept="image/*" multiple class="hidden" @change="handleImageSelect" />
              <button type="button" @click="$refs.fileInput.click()" class="btn-secondary text-sm">📁 Choisir des images</button>
              <span v-if="selectedImages.length" class="ml-2 text-sm text-gray-500">{{ selectedImages.length }} sélectionnée(s)</span>
              <div v-if="imagePreviews.length" class="grid grid-cols-4 gap-2 mt-2">
                <div v-for="(p, i) in imagePreviews" :key="i" class="relative group">
                  <img :src="p" class="w-full h-20 object-cover rounded-lg" />
                  <button type="button" @click="removeImage(i)" class="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 flex items-center justify-center">✕</button>
                </div>
              </div>
            </div>
            <div v-if="formError" class="error-box">{{ formError }}</div>
            <div class="flex justify-end gap-3 pt-2">
              <button type="button" @click="closeModal" class="btn-ghost">Annuler</button>
              <button type="submit" :disabled="submitting" class="btn-primary">
                {{ submitting ? 'Enregistrement…' : (editingRestaurant ? 'Mettre à jour' : 'Ajouter') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Delete restaurant -->
      <div v-if="showDeleteModal" class="modal-backdrop">
        <div class="modal-box max-w-md">
          <div class="p-6">
            <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Supprimer ce restaurant ?</h3>
            <p class="text-gray-600 dark:text-gray-400 mb-6 text-sm">
              <strong>{{ restaurantToDelete?.nom }}</strong> sera définitivement supprimé.
            </p>
            <div class="flex justify-end gap-3">
              <button @click="showDeleteModal = false" class="btn-ghost">Annuler</button>
              <button @click="handleDelete" :disabled="submitting" class="btn-danger">{{ submitting ? 'Suppression…' : 'Supprimer' }}</button>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════
           MODAL MENU (avec import JSON + catégories)
      ═══════════════════════════════════════════════════════ -->
      <div v-if="showMenuModal" class="modal-backdrop" @click.self="closeMenuModal">
        <div class="modal-box max-w-5xl">
          <div class="modal-header">
            <div>
              <h3 class="modal-title">Menu — {{ selectedRestaurant?.nom }}</h3>
              <p class="modal-subtitle">{{ currentMenuItems.length }} plat(s)</p>
            </div>
            <div class="flex items-center gap-2">
              <button @click="openAddMenuItemModal" class="btn-primary text-sm flex items-center gap-1.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                Formulaire
              </button>
              <button @click="showImportMenuModal = true" class="btn-secondary text-sm flex items-center gap-1.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                Import JSON
              </button>
              <button @click="closeMenuModal" class="modal-close-btn">✕</button>
            </div>
          </div>

          <div class="p-6 max-h-[72vh] overflow-y-auto">
            <div v-if="menuLoading" class="flex justify-center py-10">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
            </div>
            <!-- Plats groupés par catégorie -->
            <MenuByCategory
              v-else
              :items="currentMenuItems"
              :expand-all="true"
              @edit-item="openEditMenuItemModal"
              @delete-item="confirmDeleteMenuItem"
            />
          </div>
        </div>
      </div>

      <!-- Import JSON plats -->
      <div v-if="showImportMenuModal" class="modal-backdrop" @click.self="showImportMenuModal = false">
        <div class="modal-box max-w-2xl">
          <div class="modal-header">
            <div>
              <h3 class="modal-title">Import JSON — Plats</h3>
              <p class="modal-subtitle">{{ selectedRestaurant?.nom }}</p>
            </div>
            <button @click="showImportMenuModal = false" class="modal-close-btn">✕</button>
          </div>
          <div class="p-6">
            <JsonImporter
              :validator="validateMenuItemJSON"
              item-label="plat"
              example-url="/exemples/plats-exemple.json"
              @import="handleImportMenuItems"
            />
          </div>
        </div>
      </div>

      <!-- Éditeur d'images après import JSON -->
      <div v-if="showPostImportImageEditor" class="modal-backdrop" @click.self="showPostImportImageEditor = false">
        <div class="modal-box max-w-3xl">
          <div class="modal-header">
            <div>
              <h3 class="modal-title">Ajouter les images</h3>
              <p class="modal-subtitle">{{ importedItems.length }} plat(s) importé(s) — ajoutez leurs images</p>
            </div>
            <button @click="finishPostImportImages" class="modal-close-btn">✕</button>
          </div>
          <div class="p-6 max-h-[70vh] overflow-y-auto space-y-4">
            <div
              v-for="(item, i) in importedItems"
              :key="i"
              class="flex gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
            >
              <div class="flex-shrink-0 w-44">
                <p class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">{{ item.nom }}</p>
                <p class="text-xs text-gray-500 mb-3">{{ item.categorie }} · {{ item.prix }} FCFA</p>
                <ImageEditor
                  v-model="item.image"
                  :restaurant-name="selectedRestaurant?.nom"
                  :dish-name="item.nom"
                />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{{ item.description }}</p>
              </div>
            </div>
          </div>
          <div class="p-6 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
            <button @click="finishPostImportImages" class="btn-ghost">Passer</button>
            <button @click="saveImportedItemsWithImages" :disabled="submitting" class="btn-primary">
              {{ submitting ? 'Enregistrement…' : 'Enregistrer tout' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Add/Edit Menu Item (formulaire) -->
      <div v-if="showMenuItemModal" class="modal-backdrop" @click.self="showMenuItemModal = false">
        <div class="modal-box max-w-lg">
          <div class="modal-header">
            <h3 class="modal-title">{{ editingMenuItem ? 'Modifier' : 'Ajouter' }} un plat</h3>
            <button @click="showMenuItemModal = false" class="modal-close-btn">✕</button>
          </div>
          <form @submit.prevent="handleMenuItemSubmit" class="p-6 space-y-4">
            <div>
              <label class="form-label">Nom *</label>
              <input v-model="menuItemFormData.nom" type="text" required class="form-input" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="form-label">Catégorie *</label>
                <select v-model="menuItemFormData.categorie" required class="form-input">
                  <option value="">Sélectionner</option>
                  <option v-for="c in menuCategoryList" :key="c" :value="c">{{ c }}</option>
                </select>
              </div>
              <div>
                <label class="form-label">Prix (FCFA) *</label>
                <input v-model.number="menuItemFormData.prix" type="number" min="0" required class="form-input" />
              </div>
            </div>
            <div>
              <label class="form-label">Description *</label>
              <textarea v-model="menuItemFormData.description" required rows="3" class="form-input resize-none"></textarea>
            </div>
            <div>
              <label class="form-label">Image</label>
              <ImageEditor
                v-model="menuItemFormData.image"
                :restaurant-name="selectedRestaurant?.nom"
                :dish-name="menuItemFormData.nom"
              />
            </div>
            <div v-if="menuItemFormError" class="error-box">{{ menuItemFormError }}</div>
            <div class="flex justify-end gap-3 pt-2">
              <button type="button" @click="showMenuItemModal = false" class="btn-ghost">Annuler</button>
              <button type="submit" :disabled="submitting" class="btn-primary">
                {{ submitting ? 'Enregistrement…' : (editingMenuItem ? 'Mettre à jour' : 'Ajouter') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Delete menu item -->
      <div v-if="showDeleteMenuItemModal" class="modal-backdrop">
        <div class="modal-box max-w-md">
          <div class="p-6">
            <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Supprimer ce plat ?</h3>
            <p class="text-gray-600 dark:text-gray-400 mb-6 text-sm"><strong>{{ menuItemToDelete?.nom }}</strong> sera supprimé définitivement.</p>
            <div class="flex justify-end gap-3">
              <button @click="showDeleteMenuItemModal = false" class="btn-ghost">Annuler</button>
              <button @click="handleDeleteMenuItem" :disabled="submitting" class="btn-danger">{{ submitting ? '…' : 'Supprimer' }}</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Slider Image -->
      <div v-if="showAddSliderModal" class="modal-backdrop" @click.self="showAddSliderModal = false">
        <div class="modal-box max-w-md">
          <div class="modal-header">
            <h3 class="modal-title">Ajouter une image slider</h3>
            <button @click="showAddSliderModal = false" class="modal-close-btn">✕</button>
          </div>
          <form @submit.prevent="handleAddSliderImage" class="p-6 space-y-4">
            <input ref="sliderFileInput" type="file" accept="image/*" class="hidden" @change="handleSliderImageSelect" />
            <button type="button" @click="$refs.sliderFileInput.click()" class="btn-secondary text-sm">Choisir une image</button>
            <img v-if="sliderImagePreview" :src="sliderImagePreview" class="w-full h-48 object-cover rounded-xl mt-3" />
            <div v-if="sliderFormError" class="error-box">{{ sliderFormError }}</div>
            <div class="flex justify-end gap-3">
              <button type="button" @click="showAddSliderModal = false" class="btn-ghost">Annuler</button>
              <button type="submit" :disabled="submitting || !selectedSliderImage" class="btn-primary">
                {{ submitting ? 'Ajout…' : 'Ajouter' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Delete slider -->
      <div v-if="showDeleteSliderModal" class="modal-backdrop">
        <div class="modal-box max-w-md">
          <div class="p-6">
            <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Supprimer cette image ?</h3>
            <div class="flex justify-end gap-3 mt-6">
              <button @click="showDeleteSliderModal = false" class="btn-ghost">Annuler</button>
              <button @click="deleteSliderImage" :disabled="submitting" class="btn-danger">{{ submitting ? '…' : 'Supprimer' }}</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { onMounted } from 'vue'
import Navbar from '../components/Navbar.vue'
import JsonImporter from '../components/admin/JsonImporter.vue'
import MenuByCategory from '../components/admin/MenuByCategory.vue'
import ImageEditor from '../components/admin/ImageEditor.vue'
import { useAuth } from '../composables/useAuth'
import { useRestaurants } from '../composables/useRestaurants'
import { useStatistics } from '../composables/useStatistics'
import { useSupabaseStorage } from '../composables/useSupabaseStorage'
import { useToast } from '../composables/useToast'
import { supabase } from '../config/supabaseConfig'

const CUISINE_TYPES = ['Pâtisserie','Fastfood','Cuisine Africaine','Cuisine Française','Cuisine Italienne','Cuisine Asiatique','Pizzeria','Burger','Café','Bar','Restaurant Gastronomique']
const MENU_CATEGORIES = ['Hamburger','Pizza','Salade','Sandwich','Viande','Volailles','Poissons','Pates','Dessert','Gâteau','Milkshakes','Smoothies','BubbleTea','Crepes','Cocktails','Cafe','Boisson','Entrée','Plat principal','Accompagnements','Plats locaux','Omelletes']
const DEFAULT_HORAIRE = () => ({ lundi:'08:00-20:00',mardi:'08:00-20:00',mercredi:'08:00-20:00',jeudi:'08:00-20:00',vendredi:'08:00-20:00',samedi:'09:00-22:00',dimanche:'09:00-22:00' })

export default {
  name: 'AdminDashboard',
  components: { Navbar, JsonImporter, MenuByCategory, ImageEditor },

  setup() {
    const { user, loading: authLoading, isAdmin, logout } = useAuth()
    const { restaurants, loading, fetchRestaurants, addRestaurant, updateRestaurant, deleteRestaurant, menuLoading, fetchMenu, addMenuItem, updateMenuItem, deleteMenuItem } = useRestaurants()
    const { getGlobalStats } = useStatistics()
    const { uploadMultipleImages } = useSupabaseStorage()
    const toast = useToast()

    onMounted(async () => {
      if (isAdmin.value) await fetchRestaurants()
    })

    return { user, authLoading, isAdmin, logout, restaurants, loading, fetchRestaurants, addRestaurant, updateRestaurant, deleteRestaurant, menuLoading, fetchMenu, addMenuItem, updateMenuItem, deleteMenuItem, getGlobalStats, uploadMultipleImages, toast }
  },

  data() {
    return {
      cuisineTypes: CUISINE_TYPES,
      menuCategoryList: MENU_CATEGORIES,

      // Stats
      globalStats: { totalRestaurants:0, totalVisites:0, totalFavoris:0, usersWithFavorites:0 },

      // Restaurant form
      showModal: false, editingRestaurant: null, submitting: false, formError: '',
      formData: { nom:'', type:'', adresse:'', description:'', numero:'', prix:'', note:0, horaire: DEFAULT_HORAIRE(), photos:[] },
      selectedImages: [], imagePreviews: [],
      showDeleteModal: false, restaurantToDelete: null,

      // Import JSON restaurants
      showImportRestaurantModal: false,

      // Menu
      showMenuModal: false, selectedRestaurant: null, currentMenuItems: [],
      showMenuItemModal: false, editingMenuItem: null,
      menuItemFormData: { nom:'', description:'', prix:0, categorie:'', image:'' },
      menuItemFormError: '',
      showDeleteMenuItemModal: false, menuItemToDelete: null,

      // Import JSON plats
      showImportMenuModal: false,
      showPostImportImageEditor: false,
      importedItems: [],   // plats importés en attente d'images

      // Slider
      sliderImages: [], sliderLoading: false,
      showAddSliderModal: false, selectedSliderImage: null, sliderImagePreview: null, sliderFormError: '',
      showDeleteSliderModal: false, sliderImageToDelete: null,
    }
  },

  computed: {
    globalStatCards() {
      return [
        { label:'Restaurants', value: this.globalStats.totalRestaurants, icon:'🍽️', bg:'bg-orange-100 dark:bg-orange-900/30' },
        { label:'Visites', value: this.globalStats.totalVisites, icon:'👁️', bg:'bg-blue-100 dark:bg-blue-900/30' },
        { label:'Favoris', value: this.globalStats.totalFavoris, icon:'❤️', bg:'bg-red-100 dark:bg-red-900/30' },
        { label:'Utilisateurs', value: this.globalStats.usersWithFavorites, icon:'👥', bg:'bg-green-100 dark:bg-green-900/30' },
      ]
    },
  },

  async mounted() {
    if (this.isAdmin) {
      await Promise.all([this.loadGlobalStats(), this.fetchSliderImages()])
    }
  },

  methods: {

    // ── Stats ─────────────────────────────────────────────────────
    async loadGlobalStats() {
      try { this.globalStats = await this.getGlobalStats() } catch (e) { console.error(e) }
    },

    // ── Validation JSON restaurants ───────────────────────────────
    validateRestaurantItem(item) {
      const errors = []
      if (!item.nom?.trim()) errors.push('Champ "nom" obligatoire')
      if (!item.type?.trim()) errors.push('Champ "type" obligatoire')
      if (!item.adresse?.trim()) errors.push('Champ "adresse" obligatoire')
      return errors
    },

    // ── Validation JSON plats ─────────────────────────────────────
    validateMenuItemJSON(item) {
      const errors = []
      if (!item.nom?.trim()) errors.push('Champ "nom" obligatoire')
      if (!item.categorie?.trim()) errors.push('Champ "categorie" obligatoire')
      if (item.prix === undefined || item.prix === null || isNaN(Number(item.prix))) errors.push('Champ "prix" invalide (nombre attendu)')
      if (!item.description?.trim()) errors.push('Champ "description" obligatoire')
      return errors
    },

    // ── Import JSON restaurants ───────────────────────────────────
    async handleImportRestaurants({ items, onProgress }) {
      let count = 0
      const errors = []
      for (const item of items) {
        try {
          const payload = {
            nom: item.nom,
            type: item.type || '',
            adresse: item.adresse || '',
            description: item.description || '',
            numero: item.numero || '',
            prix: item.prix || 'FCFA',
            note: Number(item.note) || 0,
            horaire: item.horaire || DEFAULT_HORAIRE(),
            photos: [],
          }
          await this.addRestaurant(payload, [])
          count++
        } catch (e) {
          errors.push(item.nom || 'inconnu')
        }
        onProgress(count)
      }
      await this.fetchRestaurants(true)
      await this.loadGlobalStats()
      this.showImportRestaurantModal = false
      if (errors.length === 0) {
        this.toast.success(`✅ ${count} restaurant(s) importé(s) avec succès !`)
      } else {
        this.toast.warning(`${count} importé(s), ${errors.length} erreur(s): ${errors.join(', ')}`)
      }
    },

    // ── Import JSON plats ─────────────────────────────────────────
    async handleImportMenuItems({ items, onProgress }) {
      // On stocke les items importés pour l'éditeur d'images
      this.importedItems = items.map((item) => ({
        nom: item.nom,
        description: item.description || '',
        prix: Number(item.prix) || 0,
        categorie: item.categorie || 'Plats locaux',
        image: item.image || '',
      }))
      this.showImportMenuModal = false
      // Ouvre l'éditeur d'images post-import
      this.showPostImportImageEditor = true
      onProgress(items.length)
    },

    async saveImportedItemsWithImages() {
      this.submitting = true
      let count = 0
      try {
        for (const item of this.importedItems) {
          await this.addMenuItem(this.selectedRestaurant.id, item, [])
          count++
        }
        this.currentMenuItems = await this.fetchMenu(this.selectedRestaurant.id)
        this.toast.success(`✅ ${count} plat(s) importé(s) avec succès !`)
        this.showPostImportImageEditor = false
        this.importedItems = []
      } catch (e) {
        this.toast.error('Erreur lors de l\'enregistrement: ' + e.message)
      } finally {
        this.submitting = false
      }
    },

    finishPostImportImages() {
      this.showPostImportImageEditor = false
      this.importedItems = []
    },

    // ── Restaurant CRUD ──────────────────────────────────────────
    openAddModal() {
      this.editingRestaurant = null
      this.formData = { nom:'', type:'', adresse:'', description:'', numero:'', prix:'', note:0, horaire: DEFAULT_HORAIRE(), photos:[] }
      this.selectedImages = []; this.imagePreviews = []; this.formError = ''
      this.showModal = true
    },
    openEditModal(r) {
      this.editingRestaurant = r
      this.formData = { nom:r.nom, type:r.type||'', adresse:r.adresse, description:r.description, numero:r.numero||'', prix:r.prix||'', note:r.note||0, horaire:{...DEFAULT_HORAIRE(),...(r.horaire||{})}, photos:r.photos||[] }
      this.selectedImages = []; this.imagePreviews = []; this.formError = ''
      this.showModal = true
    },
    closeModal() { this.showModal = false; this.editingRestaurant = null; this.selectedImages = []; this.imagePreviews = []; this.formError = '' },
    handleImageSelect(e) {
      this.selectedImages = Array.from(e.target.files)
      this.imagePreviews = []
      this.selectedImages.forEach((f) => { const r = new FileReader(); r.onload = (ev) => this.imagePreviews.push(ev.target.result); r.readAsDataURL(f) })
    },
    removeImage(i) { this.selectedImages.splice(i,1); this.imagePreviews.splice(i,1) },
    async handleSubmit() {
      if (!this.formData.nom||!this.formData.type||!this.formData.adresse) { this.formError = 'Remplissez les champs obligatoires'; return }
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

    // ── Menu CRUD ─────────────────────────────────────────────────
    async openMenuModal(r) {
      this.selectedRestaurant = r
      this.showMenuModal = true
      this.currentMenuItems = await this.fetchMenu(r.id)
    },
    closeMenuModal() { this.showMenuModal = false; this.selectedRestaurant = null; this.currentMenuItems = [] },
    openAddMenuItemModal() {
      this.editingMenuItem = null
      this.menuItemFormData = { nom:'', description:'', prix:0, categorie:'', image:'' }
      this.menuItemFormError = ''
      this.showMenuItemModal = true
    },
    openEditMenuItemModal(item) {
      this.editingMenuItem = item
      this.menuItemFormData = { nom:item.nom, description:item.description, prix:item.prix, categorie:item.categorie, image: typeof item.image === 'string' ? item.image : (item.image?.[0]||'') }
      this.menuItemFormError = ''
      this.showMenuItemModal = true
    },
    async handleMenuItemSubmit() {
      this.submitting = true; this.menuItemFormError = ''
      try {
        const payload = { ...this.menuItemFormData }
        if (this.editingMenuItem) {
          await this.updateMenuItem(this.selectedRestaurant.id, this.editingMenuItem.id, payload, [])
          this.toast.success('Plat mis à jour !')
        } else {
          await this.addMenuItem(this.selectedRestaurant.id, payload, [])
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
        this.currentMenuItems = this.currentMenuItems.filter((m) => m.id !== this.menuItemToDelete.id)
        this.toast.success('Plat supprimé')
        this.showDeleteMenuItemModal = false
      } catch (e) { this.toast.error('Erreur: ' + e.message) }
      finally { this.submitting = false }
    },

    // ── Slider ────────────────────────────────────────────────────
    async fetchSliderImages() {
      this.sliderLoading = true
      const { data } = await supabase.from('slider_images').select('*').order('order', { ascending: true })
      this.sliderImages = data || []
      this.sliderLoading = false
    },
    handleSliderImageSelect(e) {
      this.selectedSliderImage = e.target.files[0]
      if (this.selectedSliderImage) {
        const r = new FileReader(); r.onload = (ev) => { this.sliderImagePreview = ev.target.result }; r.readAsDataURL(this.selectedSliderImage)
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
      } catch (e) { this.sliderFormError = e.message }
      finally { this.submitting = false }
    },
    confirmDeleteSlider(img) { this.sliderImageToDelete = img; this.showDeleteSliderModal = true },
    async deleteSliderImage() {
      this.submitting = true
      try {
        await supabase.from('slider_images').delete().eq('id', this.sliderImageToDelete.id)
        await this.fetchSliderImages()
        this.showDeleteSliderModal = false
        this.toast.success('Image supprimée')
      } catch (e) { this.toast.error('Erreur: ' + e.message) }
      finally { this.submitting = false }
    },
  },
}
</script>

<style scoped>
/* ── Boutons réutilisables ─────────────────────────────────── */
.btn-primary {
  @apply px-4 py-2 bg-[var(--color-primary)] text-white rounded-xl font-semibold hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed;
}
.btn-secondary {
  @apply px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors;
}
.btn-ghost {
  @apply px-4 py-2 text-gray-600 dark:text-gray-400 font-medium hover:text-gray-900 dark:hover:text-gray-100 transition-colors;
}
.btn-danger {
  @apply px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-40;
}

/* ── Modals ───────────────────────────────────────────────── */
.modal-backdrop {
  @apply fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4;
}
.modal-box {
  @apply bg-white dark:bg-gray-900 w-full sm:rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 max-h-[95vh] flex flex-col overflow-hidden;
}
.modal-header {
  @apply flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800 flex-shrink-0;
}
.modal-title {
  @apply text-lg font-bold text-gray-900 dark:text-gray-100;
}
.modal-subtitle {
  @apply text-sm text-gray-500 dark:text-gray-400 mt-0.5;
}
.modal-close-btn {
  @apply p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 transition-colors text-sm font-medium;
}

/* ── Form ─────────────────────────────────────────────────── */
.form-label {
  @apply block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5;
}
.form-input {
  @apply w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900 transition-all;
}
.error-box {
  @apply p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400;
}
</style>
