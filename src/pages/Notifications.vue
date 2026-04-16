<template>
  <div class="max-w-2xl mx-auto px-4 py-6">

    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-black text-[var(--color-text)]">Notifications</h1>
        <p class="text-sm text-[var(--color-text-secondary)] mt-0.5">Derniers ajouts en temps réel</p>
      </div>
      <button
        v-if="unreadCount > 0"
        @click="markAllRead"
        class="text-xs font-semibold text-[var(--color-primary)] hover:opacity-75 transition-opacity px-3 py-1.5 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20"
      >
        Tout marquer lu
      </button>
    </div>

    <!-- Filtres -->
    <div class="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
      <button
        v-for="f in filters" :key="f.value"
        @click="activeFilter = f.value"
        class="filter-pill flex-shrink-0"
        :class="activeFilter === f.value ? 'filter-pill--active' : ''"
      >
        <span>{{ f.emoji }}</span>
        <span>{{ f.label }}</span>
        <span v-if="f.count > 0" class="filter-count" :class="activeFilter === f.value ? 'filter-count--active' : ''">
          {{ f.count }}
        </span>
      </button>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="space-y-3">
      <div v-for="i in 6" :key="i" class="notif-skeleton">
        <div class="skeleton-thumb"></div>
        <div class="flex-1 space-y-2">
          <div class="skeleton-line w-3/4"></div>
          <div class="skeleton-line w-1/2"></div>
        </div>
      </div>
    </div>

    <!-- Liste -->
    <TransitionGroup
      v-else-if="filteredItems.length"
      name="notif-item"
      tag="div"
      class="space-y-2"
    >
      <div
        v-for="item in filteredItems"
        :key="item.id"
        class="notif-row"
        :class="{ 'notif-row--new': item.isNew }"
        @click="navigateTo(item)"
        :role="item.restaurantId ? 'button' : 'article'"
        :tabindex="item.restaurantId ? 0 : -1"
        @keyup.enter="navigateTo(item)"
      >
        <!-- Thumbnail -->
        <div class="notif-thumb">
          <img
            v-if="item.photo"
            :src="item.photo"
            :alt="item.title"
            class="w-full h-full object-cover"
            loading="lazy"
          />
          <span v-else class="text-2xl">{{ item.meta.emoji }}</span>
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <div class="flex items-start gap-2 justify-between">
            <div class="min-w-0">
              <!-- Badge type -->
              <span class="type-badge" :class="`type-badge--${item.meta.color}`">
                {{ item.meta.label }}
              </span>
              <p class="notif-title">{{ item.title }}</p>
              <p v-if="item.subtitle" class="notif-subtitle">{{ item.subtitle }}</p>
            </div>
            <span class="notif-time flex-shrink-0">{{ formatDate(item.createdAt) }}</span>
          </div>
        </div>

        <!-- Arrow (si cliquable) -->
        <svg v-if="item.restaurantId" class="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
      </div>
    </TransitionGroup>

    <!-- Empty state -->
    <div v-else-if="!loading" class="empty-state">
      <div class="empty-icon">
        <span v-if="activeFilter === 'all'">🔔</span>
        <span v-else-if="activeFilter === 'new_restaurant'">🍽️</span>
        <span v-else>🥘</span>
      </div>
      <p class="text-base font-semibold text-[var(--color-text)] mb-1">Aucune notification</p>
      <p class="text-sm text-[var(--color-text-secondary)]">
        {{ activeFilter === 'all' ? 'Les nouveaux restaurants et plats apparaîtront ici.' : 'Aucun élément dans cette catégorie.' }}
      </p>
    </div>

    <!-- Indicateur Realtime -->
    <div class="flex items-center justify-center gap-2 mt-8">
      <div class="w-2 h-2 rounded-full flex-shrink-0" :class="isSubscribed ? 'bg-green-400 animate-pulse' : 'bg-gray-300'"></div>
      <p class="text-xs text-[var(--color-text-secondary)]">
        {{ isSubscribed ? 'Connecté — mises à jour en temps réel' : 'Connexion au flux…' }}
      </p>
    </div>

  </div>
</template>

<script>
import { useNotifications } from '../composables/useNotifications.js'
import { useRouter } from 'vue-router'

export default {
  name: 'NotificationsPage',
  setup() {
    const { feedItems, unreadCount, historyLoaded, isSubscribed, markAllRead, fetchHistory } = useNotifications()
    const router = useRouter()
    return { feedItems, unreadCount, historyLoaded, isSubscribed, markAllRead, fetchHistory, router }
  },
  data() {
    return {
      loading: false,
      activeFilter: 'all',
    }
  },
  computed: {
    filteredItems() {
      if (this.activeFilter === 'all') return this.feedItems
      return this.feedItems.filter(i => i.type === this.activeFilter)
    },
    restosCount() {
      return this.feedItems.filter(i => i.type === 'new_restaurant').length
    },
    dishesCount() {
      return this.feedItems.filter(i => i.type === 'new_dish').length
    },
    filters() {
      return [
        { value: 'all',            emoji: '🔔', label: 'Tout',        count: this.feedItems.length },
        { value: 'new_restaurant', emoji: '🍽️', label: 'Restaurants', count: this.restosCount },
        { value: 'new_dish',       emoji: '🥘', label: 'Plats',       count: this.dishesCount },
      ]
    },
  },
  async mounted() {
    if (!this.historyLoaded) {
      this.loading = true
      await this.fetchHistory()
      this.loading = false
    }
    this.markAllRead()
  },
  methods: {
    navigateTo(item) {
      if (!item.restaurantId) return
      this.router.push(`/restaurant/${item.restaurantId}`)
    },
    formatDate(iso) {
      if (!iso) return ''
      const d = new Date(iso)
      const now = new Date()
      const diff = now - d

      if (diff < 60_000)          return 'À l\'instant'
      if (diff < 3_600_000)       return `Il y a ${Math.floor(diff / 60_000)} min`
      if (diff < 86_400_000)      return `Il y a ${Math.floor(diff / 3_600_000)} h`
      if (diff < 7 * 86_400_000) {
        const days = Math.floor(diff / 86_400_000)
        return days === 1 ? 'Hier' : `Il y a ${days} j`
      }
      return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    },
  },
}
</script>

<style scoped>
/* ── Filtres ────────────────────────────────────────────────── */
.filter-pill {
  display: inline-flex; align-items: center; gap: .375rem;
  padding: .375rem .875rem; border-radius: 9999px;
  font-size: .8rem; font-weight: 600;
  border: 1.5px solid #e5e7eb;
  background: #fff; color: #6b7280;
  transition: all .18s; cursor: pointer;
}
.dark .filter-pill { background: #1f2937; border-color: #374151; color: #9ca3af; }
.filter-pill--active {
  background: #fff7ed; border-color: #f97316; color: #ea580c;
}
.dark .filter-pill--active { background: rgba(249,115,22,.15); }
.filter-count {
  background: #f3f4f6; color: #374151;
  font-size: .7rem; padding: .1rem .4rem; border-radius: 9999px; font-weight: 700;
}
.dark .filter-count { background: #374151; color: #d1d5db; }
.filter-count--active { background: #fed7aa; color: #c2410c; }
.dark .filter-count--active { background: rgba(249,115,22,.3); color: #fb923c; }

/* ── Ligne notification ─────────────────────────────────────── */
.notif-row {
  display: flex; align-items: center; gap: .875rem;
  padding: .875rem 1rem;
  background: #fff; border: 1px solid #f3f4f6;
  border-radius: 1rem;
  transition: all .15s; cursor: default;
}
.dark .notif-row { background: #1f2937; border-color: #374151; }
.notif-row[role="button"] { cursor: pointer; }
.notif-row[role="button"]:hover { background: #f9fafb; transform: translateX(2px); border-color: #e5e7eb; }
.dark .notif-row[role="button"]:hover { background: #374151; }
.notif-row--new { border-left: 3px solid #f97316; }

/* Thumbnail */
.notif-thumb {
  width: 3.25rem; height: 3.25rem; flex-shrink: 0;
  border-radius: .75rem; overflow: hidden;
  background: #f3f4f6;
  display: flex; align-items: center; justify-content: center;
}
.dark .notif-thumb { background: #374151; }

/* Text */
.notif-title {
  font-size: .875rem; font-weight: 600;
  color: var(--color-text);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  margin-top: .15rem;
}
.notif-subtitle {
  font-size: .78rem; color: var(--color-text-secondary);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  margin-top: .1rem;
}
.notif-time {
  font-size: .72rem; color: var(--color-text-secondary);
  white-space: nowrap; margin-top: .1rem;
}

/* Type badge */
.type-badge {
  display: inline-block;
  font-size: .68rem; font-weight: 700; letter-spacing: .02em; text-transform: uppercase;
  padding: .1rem .5rem; border-radius: 9999px; margin-bottom: .15rem;
}
.type-badge--orange { background: #fff7ed; color: #ea580c; }
.type-badge--green  { background: #f0fdf4; color: #16a34a; }
.dark .type-badge--orange { background: rgba(249,115,22,.2); color: #fb923c; }
.dark .type-badge--green  { background: rgba(34,197,94,.15); color: #4ade80; }

/* ── Skeleton ───────────────────────────────────────────────── */
.notif-skeleton {
  display: flex; align-items: center; gap: .875rem;
  padding: .875rem 1rem;
  background: #fff; border: 1px solid #f3f4f6; border-radius: 1rem;
}
.dark .notif-skeleton { background: #1f2937; border-color: #374151; }
.skeleton-thumb {
  width: 3.25rem; height: 3.25rem; flex-shrink: 0;
  border-radius: .75rem; background: #f3f4f6;
  animation: shimmer 1.4s ease-in-out infinite;
}
.dark .skeleton-thumb { background: #374151; }
.skeleton-line {
  height: .75rem; border-radius: .375rem; background: #f3f4f6;
  animation: shimmer 1.4s ease-in-out infinite;
}
.dark .skeleton-line { background: #374151; }
@keyframes shimmer {
  0%, 100% { opacity: 1; }
  50%       { opacity: .4; }
}

/* ── Empty state ─────────────────────────────────────────────── */
.empty-state {
  text-align: center; padding: 3rem 1rem;
}
.empty-icon {
  width: 4rem; height: 4rem; border-radius: 1.25rem;
  background: #f3f4f6; margin: 0 auto 1rem;
  display: flex; align-items: center; justify-content: center; font-size: 1.75rem;
}
.dark .empty-icon { background: #1f2937; }

/* ── Transitions ─────────────────────────────────────────────── */
.notif-item-enter-active { transition: all .25s cubic-bezier(.34,1.56,.64,1); }
.notif-item-leave-active  { transition: all .2s ease; }
.notif-item-enter-from    { opacity: 0; transform: translateY(-10px) scale(.97); }
.notif-item-leave-to      { opacity: 0; transform: translateX(20px); }
.notif-item-move          { transition: transform .3s ease; }

/* Hide scrollbar on filter row */
.scrollbar-hide { scrollbar-width: none; }
.scrollbar-hide::-webkit-scrollbar { display: none; }
</style>
