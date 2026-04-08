<template>
  <div class="relative">
    <div class="relative">
      <input
        type="text"
        v-model="searchQuery"
        @input="handleSearch"
        placeholder="Rechercher un restaurant, type de cuisine..."
        class="w-full px-4 py-3 pl-12 pr-4 rounded-xl border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-20 transition-all"
      />
      <svg 
        class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>

    <!-- Filters Button -->
    <button
      @click="$emit('toggle-filters')"
      class="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-[var(--color-surface)] hover:bg-[var(--color-surface-dark)] rounded-lg transition-colors flex items-center gap-2"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
      </svg>
      <span class="text-sm font-medium hidden sm:inline">Filtres</span>
    </button>
  </div>
</template>

<script>
export default {
  name: 'SearchBar',
  data() {
    return {
      searchQuery: ''
    }
  },
  methods: {
    handleSearch() {
      this.$emit('search', this.searchQuery)
    }
  }
}
</script>
