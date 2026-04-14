<template>
  <div class="menu-by-category space-y-3">
    <!-- Vide -->
    <div v-if="categories.length === 0" class="text-center py-10">
      <svg class="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
      </svg>
      <p class="text-gray-500 dark:text-gray-400 text-sm">Aucun plat. Ajoutez-en un !</p>
    </div>

    <!-- Catégories -->
    <div v-for="cat in categories" :key="cat.name" class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">

      <!-- Folder header cliquable -->
      <button
        class="w-full flex items-center gap-3 px-4 py-3.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors text-left"
        @click="toggleCategory(cat.name)"
      >
        <!-- Flèche animée -->
        <svg
          class="w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 flex-shrink-0"
          :class="{ 'rotate-90': expanded.includes(cat.name) }"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
        </svg>

        <!-- Icône catégorie -->
        <span class="text-lg flex-shrink-0">{{ categoryIcon(cat.name) }}</span>

        <div class="flex-1 min-w-0">
          <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">{{ cat.name }}</span>
        </div>

        <!-- Badge count -->
        <span class="px-2.5 py-0.5 bg-[var(--color-primary)] text-white text-xs font-semibold rounded-full flex-shrink-0">
          {{ cat.items.length }}
        </span>
      </button>

      <!-- Items collapsibles -->
      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 max-h-0"
        enter-to-class="opacity-100 max-h-[2000px]"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 max-h-[2000px]"
        leave-to-class="opacity-0 max-h-0"
      >
        <div v-show="expanded.includes(cat.name)" class="border-t border-gray-200 dark:border-gray-700">
          <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 p-3">
            <div
              v-for="item in cat.items"
              :key="item.id"
              class="menu-item-card flex gap-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden group"
            >
              <!-- Image -->
              <div class="w-20 h-20 flex-shrink-0 bg-gray-100 dark:bg-gray-700 overflow-hidden">
                <img
                  :src="getImage(item)"
                  :alt="item.nom"
                  loading="lazy"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  @error="(e) => e.target.src = '/placeholder.svg'"
                />
              </div>

              <!-- Info -->
              <div class="flex-1 min-w-0 py-2 pr-2 flex flex-col justify-between">
                <div>
                  <p class="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate leading-tight">{{ item.nom }}</p>
                  <p v-if="item.description" class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2 leading-snug">{{ item.description }}</p>
                </div>
                <div class="flex items-center justify-between mt-1.5">
                  <span class="text-sm font-bold text-[var(--color-primary)]">{{ item.prix }} FCFA</span>

                  <!-- Actions -->
                  <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      @click="$emit('edit-item', item)"
                      class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <svg class="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    </button>
                    <button
                      @click="$emit('delete-item', item)"
                      class="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <svg class="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script>
const CATEGORY_ICONS = {
  'Hamburger': '🍔', 'Pizza': '🍕', 'Salade': '🥗', 'Sandwich': '🥪',
  'Viande': '🥩', 'Volailles': '🍗', 'Poissons': '🐟', 'Pates': '🍝',
  'Dessert': '🍰', 'Gâteau': '🎂', 'Milkshakes': '🥤', 'Smoothies': '🧃',
  'BubbleTea': '🧋', 'Crepes': '🥞', 'Cocktails': '🍹', 'Cafe': '☕',
  'Boisson': '🥤', 'Entrée': '🥙', 'Plat principal': '🍽️', 'Accompagnements': '🍟',
  'Plats locaux': '🫕', 'Omelletes': '🍳',
}

export default {
  name: 'MenuByCategory',
  props: {
    items: { type: Array, default: () => [] },
    // Ouvrir automatiquement toutes les catégories
    expandAll: { type: Boolean, default: false },
  },
  emits: ['edit-item', 'delete-item'],
  data() {
    return { expanded: [] }
  },
  computed: {
    categories() {
      const map = {}
      this.items.forEach((item) => {
        const cat = item.categorie || 'Autres'
        if (!map[cat]) map[cat] = []
        map[cat].push(item)
      })
      return Object.keys(map)
        .sort((a, b) => a.localeCompare(b, 'fr'))
        .map((name) => ({ name, items: map[name] }))
    },
  },
  watch: {
    categories: {
      immediate: true,
      handler(cats) {
        if (this.expandAll && cats.length > 0) {
          this.expanded = cats.map((c) => c.name)
        }
      },
    },
  },
  methods: {
    toggleCategory(name) {
      const idx = this.expanded.indexOf(name)
      if (idx === -1) this.expanded.push(name)
      else this.expanded.splice(idx, 1)
    },
    categoryIcon(name) {
      return CATEGORY_ICONS[name] || '🍴'
    },
    getImage(item) {
      if (!item.image) return '/placeholder.svg'
      if (typeof item.image === 'string') {
        if (item.image.startsWith('[')) {
          try { return JSON.parse(item.image.replace(/'/g, '"'))[0] || '/placeholder.svg' } catch { return item.image }
        }
        return item.image
      }
      if (Array.isArray(item.image)) return item.image[0] || '/placeholder.svg'
      return '/placeholder.svg'
    },
  },
}
</script>

<style scoped>
.menu-item-card {
  transition: box-shadow 0.18s ease, transform 0.18s ease;
}
.menu-item-card:hover {
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}
</style>
