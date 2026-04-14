<template>
  <div class="json-importer">

    <!-- ── Drop zone ───────────────────────────────────────────── -->
    <div
      v-if="!parsedData"
      class="drop-zone relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer"
      :class="isDragging
        ? 'border-[var(--color-primary)] bg-orange-50 dark:bg-orange-900/20 scale-[1.01]'
        : 'border-gray-300 dark:border-gray-600 hover:border-[var(--color-primary)] hover:bg-orange-50/50 dark:hover:bg-orange-900/10'"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      @click="$refs.fileInput.click()"
    >
      <input
        ref="fileInput"
        type="file"
        accept=".json,application/json"
        class="hidden"
        @change="handleFileInput"
      />

      <div class="flex flex-col items-center justify-center py-10 px-6 text-center select-none">
        <!-- Icône animée -->
        <div
          class="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-200"
          :class="isDragging ? 'bg-orange-100 dark:bg-orange-900/40 scale-110' : 'bg-gray-100 dark:bg-gray-800'"
        >
          <svg class="w-8 h-8" :class="isDragging ? 'text-[var(--color-primary)]' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>

        <p class="font-semibold text-gray-700 dark:text-gray-300 mb-1">
          {{ isDragging ? 'Déposez le fichier ici' : 'Glissez votre fichier JSON' }}
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          ou <span class="text-[var(--color-primary)] font-medium">parcourez vos fichiers</span>
        </p>
        <p class="text-xs text-gray-400 dark:text-gray-500 mt-3">Fichiers .json uniquement</p>

        <!-- Lien exemple -->
        <a
          v-if="exampleUrl"
          :href="exampleUrl"
          download
          class="mt-4 text-xs text-[var(--color-primary)] hover:underline flex items-center gap-1"
          @click.stop
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Télécharger un exemple JSON
        </a>
      </div>
    </div>

    <!-- ── Erreur de parsing ────────────────────────────────────── -->
    <div v-if="parseError" class="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-2">
      <svg class="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      <div>
        <p class="text-sm font-medium text-red-700 dark:text-red-400">{{ parseError }}</p>
        <button @click="reset" class="text-xs text-red-600 hover:underline mt-1">Réessayer</button>
      </div>
    </div>

    <!-- ── Preview des données ─────────────────────────────────── -->
    <div v-if="parsedData" class="space-y-4">

      <!-- Header résumé -->
      <div class="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
          </div>
          <div>
            <p class="text-sm font-semibold text-green-800 dark:text-green-300">
              {{ parsedData.length }} {{ itemLabel }}{{ parsedData.length > 1 ? 's' : '' }} détecté{{ parsedData.length > 1 ? 's' : '' }}
            </p>
            <p class="text-xs text-green-600 dark:text-green-400">{{ fileName }}</p>
          </div>
        </div>
        <button @click="reset" class="text-xs text-green-700 dark:text-green-400 hover:underline flex items-center gap-1">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Changer
        </button>
      </div>

      <!-- Erreurs de validation -->
      <div v-if="validationErrors.length" class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
        <p class="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">⚠️ {{ validationErrors.length }} erreur(s) de validation :</p>
        <ul class="space-y-1">
          <li v-for="(err, i) in validationErrors" :key="i" class="text-xs text-red-600 dark:text-red-400 flex items-start gap-1">
            <span class="flex-shrink-0">•</span> {{ err }}
          </li>
        </ul>
      </div>

      <!-- Table preview -->
      <div class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div class="bg-gray-50 dark:bg-gray-800 px-4 py-2.5 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
          <p class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Aperçu des données</p>
          <span class="text-xs text-gray-400">{{ Math.min(parsedData.length, previewLimit) }} / {{ parsedData.length }} affichés</span>
        </div>
        <div class="max-h-64 overflow-y-auto">
          <div
            v-for="(item, i) in parsedData.slice(0, previewLimit)"
            :key="i"
            class="flex items-start gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            :class="{ 'bg-red-50/50 dark:bg-red-900/10': hasError(i) }"
          >
            <span class="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 text-xs font-bold text-gray-600 dark:text-gray-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              {{ i + 1 }}
            </span>
            <div class="flex-1 min-w-0">
              <slot name="preview-item" :item="item" :index="i">
                <p class="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{{ item.nom || '(sans nom)' }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ getSubtitle(item) }}</p>
              </slot>
            </div>
            <svg v-if="hasError(i)" class="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01" /></svg>
          </div>
        </div>
        <div v-if="parsedData.length > previewLimit" class="px-4 py-2 bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 text-center border-t border-gray-200 dark:border-gray-700">
          … et {{ parsedData.length - previewLimit }} autres
        </div>
      </div>

      <!-- Barre de progression (pendant l'import) -->
      <div v-if="importing" class="space-y-2">
        <div class="flex justify-between text-xs text-gray-600 dark:text-gray-400">
          <span>Import en cours…</span>
          <span>{{ importProgress }}/{{ parsedData.length }}</span>
        </div>
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            class="h-2 rounded-full bg-[var(--color-primary)] transition-all duration-300"
            :style="{ width: `${(importProgress / parsedData.length) * 100}%` }"
          />
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-3">
        <button
          @click="reset"
          :disabled="importing"
          class="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-40"
        >
          Annuler
        </button>
        <button
          @click="confirmImport"
          :disabled="importing || validationErrors.length > 0"
          class="flex-1 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
        >
          <svg v-if="importing" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          {{ importing ? 'Import en cours…' : `Importer ${parsedData.length} ${itemLabel}${parsedData.length > 1 ? 's' : ''}` }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'JsonImporter',
  props: {
    // Fonction de validation : (item) => string[] (liste d'erreurs)
    validator: { type: Function, required: true },
    // Label affiché (ex: "plat", "restaurant")
    itemLabel: { type: String, default: 'élément' },
    // URL de téléchargement de l'exemple
    exampleUrl: { type: String, default: '' },
    // Nombre max d'items dans la preview
    previewLimit: { type: Number, default: 8 },
  },
  emits: ['import'],
  data() {
    return {
      isDragging: false,
      parsedData: null,
      parseError: '',
      validationErrors: [],
      errorMap: {},   // { index: [erreurs] }
      fileName: '',
      importing: false,
      importProgress: 0,
    }
  },
  methods: {
    // ── Entrée fichier ──────────────────────────────────────────
    handleFileInput(e) {
      const file = e.target.files[0]
      if (file) this.processFile(file)
      e.target.value = ''
    },
    handleDrop(e) {
      this.isDragging = false
      const file = e.dataTransfer.files[0]
      if (!file) return
      if (!file.name.endsWith('.json') && file.type !== 'application/json') {
        this.parseError = 'Seuls les fichiers .json sont acceptés.'
        return
      }
      this.processFile(file)
    },

    // ── Parsing & validation ────────────────────────────────────
    processFile(file) {
      this.parseError = ''
      this.fileName = file.name
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          let data = JSON.parse(e.target.result)
          // Accepte objet seul ou tableau
          if (!Array.isArray(data)) data = [data]
          if (data.length === 0) throw new Error('Le fichier JSON est vide.')
          this.parsedData = data
          this.validate()
        } catch (err) {
          this.parseError = err.message.includes('JSON')
            ? 'JSON invalide — vérifiez la syntaxe de votre fichier.'
            : err.message
        }
      }
      reader.readAsText(file)
    },
    validate() {
      this.validationErrors = []
      this.errorMap = {}
      this.parsedData.forEach((item, i) => {
        const errors = this.validator(item)
        if (errors.length) {
          this.errorMap[i] = errors
          errors.forEach((e) =>
            this.validationErrors.push(`Ligne ${i + 1} — ${e}`)
          )
        }
      })
    },
    hasError(index) {
      return !!this.errorMap[index]
    },

    // ── Import avec progression ─────────────────────────────────
    async confirmImport() {
      this.importing = true
      this.importProgress = 0
      try {
        // Émet l'événement avec les données + callback de progression
        await this.$emit('import', {
          items: this.parsedData,
          onProgress: (n) => { this.importProgress = n },
        })
        this.reset()
      } finally {
        this.importing = false
      }
    },

    reset() {
      this.parsedData = null
      this.parseError = ''
      this.validationErrors = []
      this.errorMap = {}
      this.fileName = ''
      this.importing = false
      this.importProgress = 0
    },

    // ── Helpers ─────────────────────────────────────────────────
    getSubtitle(item) {
      const parts = []
      if (item.categorie) parts.push(item.categorie)
      if (item.prix !== undefined) parts.push(`${item.prix} FCFA`)
      if (item.type) parts.push(item.type)
      if (item.adresse) parts.push(item.adresse)
      return parts.join(' · ') || '—'
    },
  },
}
</script>
