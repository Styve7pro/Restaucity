<template>
  <div
    class="restaurant-card bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 cursor-pointer flex flex-col"
    @click="viewDetails"
  >
    <!-- ── Zone image ─────────────────────────────────────────── -->
    <div class="image-wrapper relative bg-gray-100 dark:bg-gray-800 flex-shrink-0">

      <!-- Image affichée en entier, sans crop, sans déformation -->
      <img
        :src="mainPhoto"
        :alt="restaurant.nom"
        loading="lazy"
        decoding="async"
        class="card-img"
        @error="handleImageError"
      />

      <!-- Overlay très léger au hover -->
      <div class="img-overlay absolute inset-0 bg-black/0 transition-colors duration-300" />

      <!-- Badge -->
      <div
        v-if="restaurant.badge"
        class="absolute top-3 left-3 px-2.5 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full shadow"
      >
        {{ restaurant.badge }}
      </div>

      <!-- Bouton favori -->
      <button
        @click.stop="toggleFavoriteHandler"
        :disabled="favoriteLoading"
        class="fav-btn absolute top-3 right-3 w-9 h-9 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md disabled:opacity-50"
        :aria-label="isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'"
      >
        <svg
          class="w-5 h-5 transition-all duration-200"
          :class="isFavorite
            ? 'fill-red-500 stroke-red-500 scale-110'
            : 'fill-none stroke-gray-500 dark:stroke-gray-400'"
          viewBox="0 0 24 24"
          stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>
    </div>

    <!-- ── Contenu ─────────────────────────────────────────────── -->
    <div class="flex flex-col flex-1 p-4 gap-2.5">

      <!-- Nom + type -->
      <div>
        <h3 class="text-[15px] font-bold text-gray-900 dark:text-gray-100 leading-snug line-clamp-1">
          {{ restaurant.nom }}
        </h3>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {{ restaurant.type || 'Restaurant' }}
        </p>
      </div>

      <!-- Note + prix -->
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-1">
          <svg class="w-4 h-4 fill-amber-400 flex-shrink-0" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span class="text-sm font-semibold text-gray-800 dark:text-gray-200">{{ restaurant.note || '—' }}</span>
          <span class="text-xs text-gray-400">({{ restaurant.reviewCount || 0 }})</span>
        </div>
        <span v-if="restaurant.prix" class="text-xs font-semibold text-orange-500 dark:text-orange-400 ml-auto">
          {{ restaurant.prix }}
        </span>
      </div>

      <!-- Adresse -->
      <div class="flex items-start gap-1.5 text-gray-500 dark:text-gray-400">
        <svg class="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span class="text-xs line-clamp-1">{{ restaurant.adresse }}</span>
      </div>

      <!-- CTA -->
      <button
        class="cta-btn mt-auto w-full py-2.5 rounded-xl text-sm font-semibold text-white"
        @click.stop="viewDetails"
      >
        Voir les détails
      </button>
    </div>
  </div>
</template>

<script>
import { useAuth } from '../composables/useAuth'
import { useRestaurants } from '../composables/useRestaurants'

export default {
  name: 'RestaurantCard',
  props: {
    restaurant: { type: Object, required: true },
  },
  emits: ['favorite-changed'],
  setup() {
    const { user } = useAuth()
    const { toggleFavorite, isFavorite: checkFavorite } = useRestaurants()
    return { user, toggleFavorite, checkFavorite }
  },
  data() {
    return {
      isFavorite: false,
      favoriteLoading: false,
    }
  },
  computed: {
    mainPhoto() {
      const photos = this.restaurant.photos || this.restaurant.photo || []
      return photos.length > 0 ? photos[0] : '/placeholder.svg'
    },
  },
  async mounted() {
    if (this.user) {
      this.isFavorite = await this.checkFavorite(this.restaurant.id)
    } else {
      const ids = JSON.parse(localStorage.getItem('favorites') || '[]')
      this.isFavorite = ids.includes(this.restaurant.id)
    }
  },
  methods: {
    viewDetails() {
      this.$router.push(`/restaurant/${this.restaurant.id}`)
    },
    handleImageError(e) {
      e.target.src = '/placeholder.svg'
    },
    async toggleFavoriteHandler() {
      this.favoriteLoading = true
      try {
        if (this.user) {
          const result = await this.toggleFavorite(this.restaurant.id)
          if (result.success) {
            this.isFavorite = result.isFavorite
            this.$emit('favorite-changed', { id: this.restaurant.id, isFavorite: this.isFavorite })
          }
        } else {
          this.isFavorite = !this.isFavorite
          const ids = JSON.parse(localStorage.getItem('favorites') || '[]')
          if (this.isFavorite) ids.push(this.restaurant.id)
          else ids.splice(ids.indexOf(this.restaurant.id), 1)
          localStorage.setItem('favorites', JSON.stringify(ids))
          this.$emit('favorite-changed', { id: this.restaurant.id, isFavorite: this.isFavorite })
        }
      } finally {
        this.favoriteLoading = false
      }
    },
  },
}
</script>

<style scoped>
/* ── Card ─────────────────────────────────────────────────────── */
.restaurant-card {
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.03);
  transition: transform 0.22s ease, box-shadow 0.22s ease;
  will-change: transform;
}
.restaurant-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.11), 0 0 0 1px rgba(0, 0, 0, 0.04);
}

/* ── Zone image ───────────────────────────────────────────────── */
.image-wrapper {
  /* Hauteur fixe → toutes les cards ont la même taille */
  height: 185px;
  overflow: hidden;
}

/*
 * GESTION DE L'IMAGE :
 * ─────────────────────────────────────────────────────────────────
 * On utilise `object-fit: contain` (et non `cover`) pour afficher
 * l'image EN ENTIER sans aucun crop ni déformation.
 *
 * Les "marges" de couleur que laisse `contain` (letterbox) sont
 * comblées par le fond `.bg-gray-100 / dark:bg-gray-800` du
 * conteneur `.image-wrapper`, ce qui donne un rendu neutre et pro.
 *
 * Alternative possible si le fond de l'image est blanc :
 * utiliser `background: url(...) center/contain no-repeat` en CSS
 * avec un pseudo-élément flouté en arrière-plan — mais `contain`
 * seul est suffisant et bien plus simple ici.
 * ─────────────────────────────────────────────────────────────────
 */
.card-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  display: block;
  transition: transform 0.35s ease;
}
.restaurant-card:hover .card-img {
  transform: scale(1.05);
}

/* Overlay subtil au hover */
.restaurant-card:hover .img-overlay {
  background-color: rgba(0, 0, 0, 0.07);
}

/* ── Bouton favori ────────────────────────────────────────────── */
.fav-btn {
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}
.fav-btn:hover:not(:disabled) {
  transform: scale(1.18);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
}

/* ── CTA ──────────────────────────────────────────────────────── */
.cta-btn {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  transition: background 0.2s ease, transform 0.15s ease, box-shadow 0.15s ease;
}
.cta-btn:hover {
  background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(249, 115, 22, 0.38);
}
.cta-btn:active {
  transform: translateY(0);
  box-shadow: none;
}
</style>
