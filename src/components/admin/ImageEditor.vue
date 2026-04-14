<template>
  <div class="image-editor space-y-2">
    <!-- Preview actuelle -->
    <div class="relative group w-full h-40 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <img
        v-if="currentImage"
        :src="currentImage"
        :alt="label"
        class="w-full h-full object-cover"
        @error="(e) => e.target.src = '/placeholder.svg'"
      />
      <div v-else class="w-full h-full flex flex-col items-center justify-center gap-2">
        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
        <span class="text-xs text-gray-400">Aucune image</span>
      </div>

      <!-- Actions overlay -->
      <div class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
        <button
          type="button"
          @click="$refs.fileInput.click()"
          class="px-3 py-1.5 bg-white text-gray-900 text-xs font-semibold rounded-lg shadow hover:bg-gray-100 transition-colors"
          title="Uploader une image"
        >
          📁 Upload
        </button>
        <button
          type="button"
          @click="showLibrary = true"
          class="px-3 py-1.5 bg-white text-gray-900 text-xs font-semibold rounded-lg shadow hover:bg-gray-100 transition-colors"
          title="Choisir dans la médiathèque"
        >
          🖼️ Médiathèque
        </button>
        <button
          v-if="currentImage"
          type="button"
          @click="clearImage"
          class="p-1.5 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition-colors"
          title="Supprimer l'image"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
    </div>

    <!-- Input file caché -->
    <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleUpload" />

    <!-- Loader upload -->
    <div v-if="uploading" class="flex items-center gap-2 text-xs text-gray-500">
      <svg class="animate-spin w-3.5 h-3.5 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
      Upload en cours…
    </div>

    <!-- Boutons rapides si pas d'image -->
    <div v-if="!currentImage && !uploading" class="flex gap-2">
      <button type="button" @click="$refs.fileInput.click()" class="flex-1 py-2 text-xs font-medium rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors">
        📁 Uploader
      </button>
      <button type="button" @click="showLibrary = true" class="flex-1 py-2 text-xs font-medium rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors">
        🖼️ Médiathèque
      </button>
    </div>

    <!-- MediaLibrary -->
    <MediaLibrary
      :is-open="showLibrary"
      @close="showLibrary = false"
      @select="handleLibrarySelect"
    />
  </div>
</template>

<script>
import MediaLibrary from './MediaLibrary.vue'
import { useSupabaseStorage } from '../../composables/useSupabaseStorage.js'

export default {
  name: 'ImageEditor',
  components: { MediaLibrary },
  props: {
    modelValue: { type: String, default: '' },
    label: { type: String, default: 'Image' },
    // Pour l'upload dans le bon dossier
    restaurantName: { type: String, default: 'restaurant' },
    dishName: { type: String, default: 'dish' },
  },
  emits: ['update:modelValue'],
  setup() {
    const { uploadMenuImages } = useSupabaseStorage()
    return { uploadMenuImages }
  },
  data() {
    return {
      showLibrary: false,
      uploading: false,
    }
  },
  computed: {
    currentImage() {
      return this.modelValue || ''
    },
  },
  methods: {
    async handleUpload(e) {
      const file = e.target.files[0]
      if (!file) return
      this.uploading = true
      try {
        const result = await this.uploadMenuImages([file], this.restaurantName, this.dishName || file.name)
        if (result.urls?.[0]) {
          this.$emit('update:modelValue', result.urls[0])
        }
      } catch (err) {
        console.error('[ImageEditor] upload error:', err)
      } finally {
        this.uploading = false
        e.target.value = ''
      }
    },
    handleLibrarySelect(url) {
      this.$emit('update:modelValue', url)
    },
    clearImage() {
      this.$emit('update:modelValue', '')
    },
  },
}
</script>
