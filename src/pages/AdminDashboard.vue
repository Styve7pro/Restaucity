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

        <!-- ── Slider accueil ─────────────────────────────────────────── -->
        <div class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">

          <!-- Header -->
          <div class="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800 flex flex-wrap gap-3 items-center justify-between">
            <div>
              <h2 class="text-lg font-bold text-gray-900 dark:text-gray-100">Slider accueil</h2>
              <p class="text-sm text-gray-500 mt-0.5">{{ sliderImages.length }} image(s)</p>
            </div>
            <div class="flex items-center gap-2">
              <!-- Upload multiple direct (sans modal) -->
              <input
                ref="sliderMultiInput"
                type="file"
                accept="image/*"
                multiple
                class="hidden"
                @change="handleSliderMultiUpload"
              />
              <button
                @click="$refs.sliderMultiInput.click()"
                :disabled="sliderUploading"
                class="btn-secondary text-sm flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                {{ sliderUploading ? `${sliderUploadProgress}%…` : 'Importer' }}
              </button>
              <button @click="showAddSliderModal = true" class="btn-primary text-sm flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                <span class="hidden sm:inline">Ajouter</span>
                <span class="sm:hidden">+</span>
              </button>
            </div>
          </div>

          <!-- Preview slider live -->
          <div class="px-4 sm:px-6 pt-4" v-if="sliderImages.length > 0">
            <ImageSlider
              :images="sliderImages.map(i => i.url)"
              :loading="sliderLoading"
              size="sm"
              :auto-play="false"
              :allow-zoom="false"
              empty-text="Aucune image dans le slider"
            />
          </div>

          <!-- Grille d'images gérables -->
          <div class="p-4 sm:p-6">
            <!-- Skeleton -->
            <div v-if="sliderLoading" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <div v-for="i in 4" :key="i" class="aspect-video rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse"></div>
            </div>

            <!-- Barre de progression upload -->
            <div v-else-if="sliderUploading" class="py-6 text-center space-y-3">
              <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div class="h-2 bg-[var(--color-primary)] rounded-full transition-all duration-300" :style="`width:${sliderUploadProgress}%`"></div>
              </div>
              <p class="text-sm text-gray-500">Upload en cours… {{ sliderUploadProgress }}%</p>
            </div>

            <!-- Empty -->
            <div v-else-if="sliderImages.length === 0" class="py-12 flex flex-col items-center gap-3 text-center">
              <div class="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <svg class="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              </div>
              <p class="text-sm text-gray-500">Aucune image. Ajoutez-en une ci-dessus.</p>
            </div>

            <!-- Grille responsive -->
            <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              <div
                v-for="img in sliderImages" :key="img.id"
                class="relative group rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800"
                style="aspect-ratio: 16/9"
              >
                <img
                  :src="img.url"
                  alt="Slider"
                  loading="lazy"
                  class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <!-- Overlay actions -->
                <div class="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    @click="confirmDeleteSlider(img)"
                    class="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-lg"
                    title="Supprimer"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
                <!-- Numéro d'ordre -->
                <span class="absolute top-1.5 left-1.5 text-[.65rem] font-bold bg-black/60 text-white rounded px-1.5 py-0.5">
                  {{ img.order + 1 }}
                </span>
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
                  <option v-for="t in restaurantCategories" :key="t" :value="t">{{ t }}</option>
                </select>
                <!-- Ajouter une catégorie restaurant à la volée -->
                <div class="flex gap-2 mt-2">
                  <input
                    v-model="newRestaurantCat"
                    type="text"
                    placeholder="Nouvelle catégorie…"
                    class="flex-1 px-3 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-orange-500 focus:ring-1 focus:ring-orange-200 transition-all"
                    @keydown.enter.prevent="handleAddRestaurantCat"
                  />
                  <button
                    type="button"
                    @click="handleAddRestaurantCat"
                    :disabled="addingRestaurantCat || !newRestaurantCat.trim()"
                    class="px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/40 text-orange-600 dark:text-orange-400 text-xs font-semibold rounded-lg border border-orange-200 dark:border-orange-800 transition-colors disabled:opacity-40"
                  >
                    <svg v-if="addingRestaurantCat" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                    <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
                  </button>
                </div>
                <p v-if="newRestaurantCatError" class="text-xs text-red-500 mt-1">{{ newRestaurantCatError }}</p>
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
            <!-- ── Galerie photos du restaurant ──────────────────────── -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <label class="form-label mb-0">Photos du restaurant</label>
                <div class="flex items-center gap-2">
                  <!-- Bouton supprimer toutes (seulement en édition) -->
                  <button
                    v-if="editingRestaurant && formData.photos.length > 0"
                    type="button"
                    @click="confirmDeleteAllPhotos"
                    class="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    Supprimer toutes
                  </button>
                  <!-- Input fichier -->
                  <input ref="fileInput" type="file" accept="image/*" multiple class="hidden" @change="handleImageSelect" />
                  <button type="button" @click="$refs.fileInput.click()" class="btn-secondary text-xs flex items-center gap-1.5 py-1.5">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                    Ajouter
                  </button>
                </div>
              </div>

              <!-- Photos existantes (en édition) -->
              <div v-if="formData.photos.length > 0">
                <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Photos actuelles — <span class="text-[var(--color-primary)] font-semibold">cliquez sur ⭐ pour choisir la photo principale</span>
                </p>
                <div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  <div
                    v-for="(url, i) in formData.photos"
                    :key="url"
                    class="relative group rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer"
                    style="aspect-ratio:16/9"
                    @click="setCoverPhoto(url)"
                  >
                    <img :src="url" :alt="`Photo ${i+1}`" loading="lazy" class="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" />

                    <!-- Overlay actions -->
                    <div class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100">
                      <!-- Bouton image principale -->
                      <button
                        type="button"
                        @click.stop="setCoverPhoto(url)"
                        class="p-1.5 rounded-lg text-white transition-colors shadow"
                        :class="formData.cover_photo === url ? 'bg-amber-500' : 'bg-black/50 hover:bg-amber-500'"
                        :title="formData.cover_photo === url ? 'Image principale' : 'Définir comme principale'"
                      >
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      </button>
                      <!-- Bouton supprimer cette photo -->
                      <button
                        type="button"
                        @click.stop="removeExistingPhoto(i)"
                        class="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow"
                        title="Supprimer cette photo"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                      </button>
                    </div>

                    <!-- Badge "Principale" -->
                    <div
                      v-if="formData.cover_photo === url || (i === 0 && !formData.cover_photo)"
                      class="absolute top-1.5 left-1.5 flex items-center gap-1 bg-amber-500 text-white text-[.62rem] font-bold px-1.5 py-0.5 rounded-md shadow"
                    >
                      <svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      Principale
                    </div>
                  </div>
                </div>
              </div>

              <!-- Nouvelles images sélectionnées (previews) -->
              <div v-if="imagePreviews.length > 0">
                <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">Nouvelles images à ajouter ({{ imagePreviews.length }})</p>
                <div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  <div v-for="(p, i) in imagePreviews" :key="i"
                    class="relative group rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800"
                    style="aspect-ratio:16/9"
                  >
                    <img :src="p" class="w-full h-full object-cover" />
                    <button
                      type="button"
                      @click="removeNewImage(i)"
                      class="absolute top-1 right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                    >✕</button>
                    <div class="absolute bottom-1 left-1 bg-black/60 text-white text-[.6rem] px-1 rounded">Nouvelle</div>
                  </div>
                </div>
              </div>

              <!-- Empty state -->
              <div v-if="formData.photos.length === 0 && imagePreviews.length === 0"
                class="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center"
              >
                <svg class="w-10 h-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                <p class="text-sm text-gray-400 dark:text-gray-500">Aucune photo — cliquez sur "Ajouter" ci-dessus</p>
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

      <!-- ── Supprimer TOUTES les photos (hors menu) ──────────────────── -->
      <div v-if="showDeleteAllPhotosModal" class="modal-backdrop">
        <div class="modal-box max-w-md">
          <div class="p-6">
            <div class="flex items-start gap-4 mb-4">
              <div class="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <h3 class="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">Supprimer toutes les photos ?</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Les <strong>{{ formData.photos.length }} photo(s)</strong> de
                  <strong>{{ editingRestaurant?.nom }}</strong> seront définitivement supprimées du stockage.
                  <br/><span class="text-green-600 dark:text-green-400 font-medium mt-1 block">✓ Les photos du menu ne seront pas touchées.</span>
                </p>
              </div>
            </div>
            <div class="flex justify-end gap-3">
              <button @click="showDeleteAllPhotosModal = false" class="btn-ghost" :disabled="deletingAllPhotos">Annuler</button>
              <button @click="handleDeleteAllPhotos" :disabled="deletingAllPhotos" class="btn-danger flex items-center gap-2">
                <svg v-if="deletingAllPhotos" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                {{ deletingAllPhotos ? 'Suppression…' : 'Supprimer toutes' }}
              </button>
            </div>
          </div>
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
                  <option v-for="c in menuCategories" :key="c" :value="c">{{ c }}</option>
                </select>
                <!-- Ajouter une catégorie menu à la volée -->
                <div class="flex gap-2 mt-2">
                  <input
                    v-model="newMenuCat"
                    type="text"
                    placeholder="Nouvelle catégorie…"
                    class="flex-1 px-3 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-orange-500 focus:ring-1 focus:ring-orange-200 transition-all"
                    @keydown.enter.prevent="handleAddMenuCat"
                  />
                  <button
                    type="button"
                    @click="handleAddMenuCat"
                    :disabled="addingMenuCat || !newMenuCat.trim()"
                    class="px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/40 text-orange-600 dark:text-orange-400 text-xs font-semibold rounded-lg border border-orange-200 dark:border-orange-800 transition-colors disabled:opacity-40"
                  >
                    <svg v-if="addingMenuCat" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                    <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
                  </button>
                </div>
                <p v-if="newMenuCatError" class="text-xs text-red-500 mt-1">{{ newMenuCatError }}</p>
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

          <!-- form : overflow-y-auto + max-h pour que les boutons restent visibles sur mobile -->
          <form @submit.prevent="handleAddSliderImage" class="flex flex-col overflow-hidden">
            <!-- Zone scrollable -->
            <div class="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
              <input ref="sliderFileInput" type="file" accept="image/*" class="hidden" @change="handleSliderImageSelect" />

              <!-- Zone de drop / sélection -->
              <div
                class="relative border-2 border-dashed rounded-xl transition-colors cursor-pointer"
                :class="selectedSliderImage
                  ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/10'
                  : 'border-gray-300 dark:border-gray-600 hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/10'"
                @click="$refs.sliderFileInput.click()"
                @dragover.prevent
                @drop.prevent="onSliderDrop"
              >
                <!-- Preview image -->
                <div v-if="sliderImagePreview" class="relative">
                  <img
                    :src="sliderImagePreview"
                    class="w-full max-h-52 object-cover rounded-[10px]"
                    alt="Prévisualisation"
                  />
                  <div class="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors rounded-[10px] flex items-center justify-center">
                    <span class="opacity-0 hover:opacity-100 text-white text-xs font-semibold bg-black/60 px-3 py-1.5 rounded-lg transition-opacity">
                      Changer l'image
                    </span>
                  </div>
                </div>
                <!-- Placeholder -->
                <div v-else class="py-10 flex flex-col items-center gap-3 text-center px-4">
                  <div class="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-gray-700 dark:text-gray-300">Cliquez ou glissez une image</p>
                    <p class="text-xs text-gray-400 mt-0.5">PNG, JPG, WebP — max 10 Mo</p>
                  </div>
                </div>
              </div>

              <div v-if="sliderFormError" class="error-box">{{ sliderFormError }}</div>
            </div>

            <!-- Boutons TOUJOURS visibles en bas — flex-shrink-0 empêche d'être poussé hors écran -->
            <div class="flex gap-3 p-4 sm:p-6 pt-0 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
              <button
                type="button"
                @click="showAddSliderModal = false"
                class="flex-1 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                :disabled="submitting || !selectedSliderImage"
                class="flex-1 py-2.5 btn-primary text-sm flex items-center justify-center gap-2"
              >
                <svg v-if="submitting" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                {{ submitting ? 'Ajout en cours…' : 'Ajouter au slider' }}
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
import { useCategories } from '../composables/useCategories'
import { supabase } from '../config/supabaseConfig'

// Catégories gérées dynamiquement via useCategories
const DEFAULT_HORAIRE = () => ({ lundi:'08:00-20:00',mardi:'08:00-20:00',mercredi:'08:00-20:00',jeudi:'08:00-20:00',vendredi:'08:00-20:00',samedi:'09:00-22:00',dimanche:'09:00-22:00' })

export default {
  name: 'AdminDashboard',
  components: { Navbar, JsonImporter, MenuByCategory, ImageEditor },

  setup() {
    const { user, loading: authLoading, isAdmin, logout } = useAuth()
    const { restaurants, loading, fetchRestaurants, addRestaurant, updateRestaurant, deleteRestaurant, deleteAllRestaurantPhotos, menuLoading, fetchMenu, addMenuItem, updateMenuItem, deleteMenuItem } = useRestaurants()
    const { getGlobalStats } = useStatistics()
    const { uploadMultipleImages } = useSupabaseStorage()
    const toast = useToast()
    const { restaurantCategories, menuCategories, fetchCategories, addCategory, deleteCategory } = useCategories()

    onMounted(async () => {
      if (isAdmin.value) {
        await Promise.all([fetchRestaurants(), fetchCategories()])
      }
    })

    return { user, authLoading, isAdmin, logout, restaurants, loading, fetchRestaurants, addRestaurant, updateRestaurant, deleteRestaurant, deleteAllRestaurantPhotos, menuLoading, fetchMenu, addMenuItem, updateMenuItem, deleteMenuItem, getGlobalStats, uploadMultipleImages, toast, restaurantCategories, menuCategories, fetchCategories, addCategory, deleteCategory }
  },

  data() {
    return {
      // cuisineTypes et menuCategoryList viennent de useCategories (setup)
      // UI pour ajouter une catégorie
      newRestaurantCat: '', newRestaurantCatError: '', addingRestaurantCat: false,
      newMenuCat: '', newMenuCatError: '', addingMenuCat: false,

      // Stats
      globalStats: { totalRestaurants:0, totalVisites:0, totalFavoris:0, usersWithFavorites:0 },

      // Restaurant form
      showModal: false, editingRestaurant: null, submitting: false, formError: '',
      formData: { nom:'', type:'', adresse:'', description:'', numero:'', prix:'', note:0, horaire: DEFAULT_HORAIRE(), photos:[], cover_photo: null },
      selectedImages: [], imagePreviews: [],
      showDeleteAllPhotosModal: false, deletingAllPhotos: false,
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
      sliderUploading: false, sliderUploadProgress: 0,
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
      this.formData = { nom:'', type:'', adresse:'', description:'', numero:'', prix:'', note:0, horaire: DEFAULT_HORAIRE(), photos:[], cover_photo: null }
      this.selectedImages = []; this.imagePreviews = []; this.formError = ''
      this.showModal = true
    },
    openEditModal(r) {
      this.editingRestaurant = r
      this.formData = { nom:r.nom, type:r.type||'', adresse:r.adresse, description:r.description, numero:r.numero||'', prix:r.prix||'', note:r.note||0, horaire:{...DEFAULT_HORAIRE(),...(r.horaire||{})}, photos:[...(r.photos||[])], cover_photo: r.cover_photo || (r.photos?.[0] || null) }
      this.selectedImages = []; this.imagePreviews = []; this.formError = ''
      this.showModal = true
    },
    closeModal() { this.showModal = false; this.editingRestaurant = null; this.selectedImages = []; this.imagePreviews = []; this.formError = ''; this.showDeleteAllPhotosModal = false },
    handleImageSelect(e) {
      const newFiles = Array.from(e.target.files)
      this.selectedImages = [...this.selectedImages, ...newFiles]
      newFiles.forEach(f => {
        const r = new FileReader()
        r.onload = ev => this.imagePreviews.push(ev.target.result)
        r.readAsDataURL(f)
      })
      e.target.value = '' // reset pour permettre re-sélection
    },
    // Retire une nouvelle image (pas encore uploadée)
    removeNewImage(i) {
      this.selectedImages.splice(i, 1)
      this.imagePreviews.splice(i, 1)
    },
    // Retire une photo existante (déjà en DB)
    removeExistingPhoto(i) {
      const url = this.formData.photos[i]
      this.formData.photos.splice(i, 1)
      // Si c'était la principale, réaffecter à la première restante
      if (this.formData.cover_photo === url) {
        this.formData.cover_photo = this.formData.photos[0] || null
      }
    },
    // Définit l'image principale
    setCoverPhoto(url) {
      this.formData.cover_photo = url
    },
    // Confirmation suppression de toutes les photos
    confirmDeleteAllPhotos() {
      this.showDeleteAllPhotosModal = true
    },
    // Supprime toutes les photos (hors menu) du restaurant en cours d'édition
    async handleDeleteAllPhotos() {
      if (!this.editingRestaurant) return
      this.deletingAllPhotos = true
      try {
        const result = await this.deleteAllRestaurantPhotos(
          this.editingRestaurant.id,
          this.editingRestaurant.nom
        )
        if (result.success) {
          this.formData.photos = []
          this.formData.cover_photo = null
          this.showDeleteAllPhotosModal = false
          this.toast.success(`${result.deletedCount || 'Toutes les'} photo(s) supprimée(s) !`)
        } else {
          this.toast.error('Erreur: ' + result.error)
        }
      } catch (e) {
        this.toast.error('Erreur: ' + e.message)
      } finally {
        this.deletingAllPhotos = false
      }
    },
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
    // ── Catégories dynamiques ───────────────────────────────────────────────
    async handleAddRestaurantCat() {
      const nom = this.newRestaurantCat.trim()
      if (!nom) return
      this.addingRestaurantCat = true
      this.newRestaurantCatError = ''
      const result = await this.addCategory(nom, 'restaurant')
      if (result.success) {
        this.formData.type    = nom      // sélectionner auto la nouvelle catégorie
        this.newRestaurantCat = ''
        this.toast.success(`Catégorie "${nom}" ajoutée !`)
      } else {
        this.newRestaurantCatError = result.error
      }
      this.addingRestaurantCat = false
    },

    async handleAddMenuCat() {
      const nom = this.newMenuCat.trim()
      if (!nom) return
      this.addingMenuCat = true
      this.newMenuCatError = ''
      const result = await this.addCategory(nom, 'menu')
      if (result.success) {
        this.menuItemFormData.categorie = nom   // sélectionner auto
        this.newMenuCat = ''
        this.toast.success(`Catégorie "${nom}" ajoutée !`)
      } else {
        this.newMenuCatError = result.error
      }
      this.addingMenuCat = false
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

    // ── Slider ─────────────────────────────────────────────────────────────
    async fetchSliderImages() {
      this.sliderLoading = true
      try {
        const { data, error } = await supabase
          .from('slider_images')
          .select('*')
          .order('order', { ascending: true })
        if (error) throw error
        this.sliderImages = data || []
      } catch (e) {
        this.toast.error('Erreur chargement slider: ' + e.message)
      } finally {
        this.sliderLoading = false
      }
    },

    // Upload multiple direct (bouton "Importer")
    async handleSliderMultiUpload(e) {
      const files = Array.from(e.target.files)
      if (!files.length) return
      this.sliderUploading = true
      this.sliderUploadProgress = 0
      try {
        const total = files.length
        let done    = 0
        const inserts = []
        for (const file of files) {
          const result = await this.uploadMultipleImages([file], 'slider')
          const url    = result.urls?.[0]
          if (url) {
            inserts.push({ url, order: this.sliderImages.length + inserts.length, created_at: new Date().toISOString() })
          }
          done++
          this.sliderUploadProgress = Math.round((done / total) * 100)
        }
        if (inserts.length) {
          await supabase.from('slider_images').insert(inserts)
          await this.fetchSliderImages()
          this.toast.success(`${inserts.length} image(s) ajoutée(s) au slider !`)
        }
      } catch (e) {
        this.toast.error('Erreur upload: ' + e.message)
      } finally {
        this.sliderUploading = false
        this.sliderUploadProgress = 0
        e.target.value = ''  // reset input file
      }
    },

    // Upload via modal (1 image avec preview)
    handleSliderImageSelect(e) {
      this.selectedSliderImage = e.target.files[0]
      if (this.selectedSliderImage) {
        const r = new FileReader()
        r.onload = (ev) => { this.sliderImagePreview = ev.target.result }
        r.readAsDataURL(this.selectedSliderImage)
      }
    },
    onSliderDrop(e) {
      const file = e.dataTransfer.files?.[0]
      if (!file || !file.type.startsWith('image/')) return
      this.selectedSliderImage = file
      const r = new FileReader()
      r.onload = (ev) => { this.sliderImagePreview = ev.target.result }
      r.readAsDataURL(file)
    },
    async handleAddSliderImage() {
      if (!this.selectedSliderImage) return
      this.submitting = true
      this.sliderFormError = ''
      try {
        const result = await this.uploadMultipleImages([this.selectedSliderImage], 'slider')
        const url    = result.urls?.[0]
        if (!url) throw new Error('Upload échoué')
        await supabase.from('slider_images').insert([{
          url,
          order: this.sliderImages.length,
          created_at: new Date().toISOString(),
        }])
        await this.fetchSliderImages()
        this.showAddSliderModal    = false
        this.selectedSliderImage   = null
        this.sliderImagePreview    = null
        this.toast.success('Image ajoutée au slider !')
      } catch (e) {
        this.sliderFormError = e.message
      } finally {
        this.submitting = false
      }
    },

    confirmDeleteSlider(img) {
      this.sliderImageToDelete    = img
      this.showDeleteSliderModal  = true
    },
    async deleteSliderImage() {
      this.submitting = true
      try {
        await supabase.from('slider_images').delete().eq('id', this.sliderImageToDelete.id)
        await this.fetchSliderImages()
        this.showDeleteSliderModal = false
        this.toast.success('Image supprimée')
      } catch (e) {
        this.toast.error('Erreur: ' + e.message)
      } finally {
        this.submitting = false
      }
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
  @apply bg-white dark:bg-gray-900 w-full sm:rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 max-h-[92vh] flex flex-col;
  /* overflow:hidden retiré — chaque section gère son propre scroll via overflow-y-auto */
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
