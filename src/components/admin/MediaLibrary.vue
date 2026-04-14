<template>
  <Teleport to="body">
    <Transition enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100">
      <div v-if="isOpen" class="fixed inset-0 z-[70] bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4" @click.self="$emit('close')">
        <div class="bg-white dark:bg-gray-900 w-full sm:rounded-2xl sm:max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">

          <!-- Header -->
          <div class="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
            <div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100">Médiathèque</h3>
              <p class="text-sm text-gray-500 mt-0.5">Sélectionnez une image existante ou uploadez-en une nouvelle</p>
            </div>
            <button @click="$emit('close')" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- Search + filter -->
          <div class="p-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0 flex gap-3">
            <div class="relative flex-1">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Rechercher une image…"
                class="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900 transition-all"
              />
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
            <select v-model="filterCategory" class="px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-[var(--color-primary)] transition-all">
              <option value="">Tous les plats</option>
              <option v-for="cat in availableCategories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>

          <!-- Grid images -->
          <div class="flex-1 overflow-y-auto p-4">
            <div v-if="loading" class="flex items-center justify-center py-16">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
            </div>

            <div v-else-if="filteredImages.length === 0" class="text-center py-16">
              <svg class="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              <p class="text-sm text-gray-500">Aucune image trouvée</p>
            </div>

            <div v-else class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              <button
                v-for="img in filteredImages"
                :key="img.url"
                class="image-thumb relative group rounded-xl overflow-hidden border-2 transition-all duration-150 aspect-square"
                :class="selectedUrl === img.url
                  ? 'border-orange-500 ring-2 ring-orange-200 dark:ring-orange-900'
                  : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'"
                @click="selectedUrl = img.url"
                @dblclick="confirmSelection"
              >
                <img :src="img.url" :alt="img.nom" loading="lazy" class="w-full h-full object-cover" @error="(e) => e.target.src='/placeholder.svg'" />
                <!-- Overlay sélection -->
                <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-150 flex items-center justify-center">
                  <div v-if="selectedUrl === img.url" class="w-7 h-7 bg-[var(--color-primary)] rounded-full flex items-center justify-center shadow-lg">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                  </div>
                </div>
                <!-- Tooltip nom -->
                <div class="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-1.5 py-1 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                  {{ img.nom }}
                </div>
              </button>
            </div>
          </div>

          <!-- Preview + actions -->
          <div class="border-t border-gray-200 dark:border-gray-800 p-4 flex items-center gap-4 flex-shrink-0">
            <div class="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 border border-gray-200 dark:border-gray-700">
              <img v-if="selectedUrl" :src="selectedUrl" alt="Sélection" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center">
                <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              </div>
            </div>
            <p class="flex-1 text-sm text-gray-500 dark:text-gray-400">
              {{ selectedUrl ? 'Image sélectionnée — double-clic pour confirmer' : 'Aucune image sélectionnée' }}
            </p>
            <button @click="$emit('close')" class="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
              Annuler
            </button>
            <button
              @click="confirmSelection"
              :disabled="!selectedUrl"
              class="px-5 py-2 bg-[var(--color-primary)] text-white text-sm font-semibold rounded-xl hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-40"
            >
              Utiliser cette image
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import { supabase } from '../../config/supabaseConfig.js'

export default {
  name: 'MediaLibrary',
  props: {
    isOpen: { type: Boolean, default: false },
  },
  emits: ['close', 'select'],
  data() {
    return {
      images: [],
      loading: false,
      searchQuery: '',
      filterCategory: '',
      selectedUrl: '',
    }
  },
  computed: {
    availableCategories() {
      return [...new Set(this.images.map((i) => i.categorie).filter(Boolean))].sort()
    },
    filteredImages() {
      const q = this.searchQuery.toLowerCase()
      return this.images.filter((img) => {
        const matchSearch = !q || img.nom?.toLowerCase().includes(q) || img.categorie?.toLowerCase().includes(q)
        const matchCat = !this.filterCategory || img.categorie === this.filterCategory
        return matchSearch && matchCat
      })
    },
  },
  watch: {
    isOpen(val) {
      if (val) this.loadImages()
    },
  },
  methods: {
    async loadImages() {
      this.loading = true
      this.selectedUrl = ''
      try {
        // Récupère tous les plats qui ont une image
        const { data, error } = await supabase
          .from('menu')
          .select('id, nom, categorie, image, restaurant_id')
          .not('image', 'is', null)
          .neq('image', '')

        if (error) throw error

        // Dédoublonnage par URL d'image
        const seen = new Set()
        this.images = (data || [])
          .map((item) => {
            let url = item.image
            if (typeof url === 'string' && url.startsWith('[')) {
              try { url = JSON.parse(url.replace(/'/g, '"'))[0] } catch { /* ignore */ }
            }
            return { ...item, url }
          })
          .filter((item) => {
            if (!item.url || seen.has(item.url)) return false
            seen.add(item.url)
            return true
          })
      } catch (err) {
        console.error('[MediaLibrary] loadImages error:', err)
      } finally {
        this.loading = false
      }
    },
    confirmSelection() {
      if (!this.selectedUrl) return
      this.$emit('select', this.selectedUrl)
      this.$emit('close')
    },
  },
}
</script>
