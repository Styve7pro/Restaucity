<template>
  <div
    class="image-slider"
    :class="[`image-slider--${size}`, { 'image-slider--loading': loading }]"
    @touchstart.passive="onTouchStart"
    @touchend.passive="onTouchEnd"
    role="region"
    aria-label="Galerie photos"
  >

    <!-- ── Skeleton loader ─────────────────────────────────────── -->
    <div v-if="loading" class="slider-skeleton">
      <div class="skeleton-img animate-pulse"></div>
      <div class="skeleton-dots">
        <div v-for="i in 3" :key="i" class="skeleton-dot animate-pulse" :style="`animation-delay:${i*100}ms`"></div>
      </div>
    </div>

    <!-- ── Aucune image ────────────────────────────────────────── -->
    <div v-else-if="!images || images.length === 0" class="slider-empty">
      <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
      </svg>
      <p class="empty-text">{{ emptyText }}</p>
    </div>

    <!-- ── Carrousel ───────────────────────────────────────────── -->
    <div v-else class="slider-track-wrap group">

      <!-- Track (translate) -->
      <div
        class="slider-track"
        :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
      >
        <div
          v-for="(image, i) in validImages"
          :key="i"
          class="slider-slide"
          :aria-hidden="i !== currentIndex"
        >
          <!-- Placeholder flou pendant le chargement de l'image -->
          <div v-if="!loadedMap[i]" class="slide-placeholder">
            <div class="animate-pulse w-full h-full bg-gray-200 dark:bg-gray-700"></div>
          </div>
          <img
            :src="image"
            :alt="`Photo ${i + 1}`"
            :loading="i === 0 ? 'eager' : 'lazy'"
            decoding="async"
            class="slide-img"
            :class="{ 'loaded': loadedMap[i], 'cursor-zoom-in': allowZoom }"
            @load="onImgLoad(i)"
            @error="onImgError(i)"
            @click="allowZoom && openModal(i)"
          />
        </div>
      </div>

      <!-- Boutons prev/next — visibles au hover desktop, toujours visible mobile si 1+ images -->
      <template v-if="validImages.length > 1">
        <button
          class="slider-arrow slider-arrow--prev"
          :class="{ 'slider-arrow--mobile': isMobile }"
          @click.stop="prev"
          aria-label="Image précédente"
          :disabled="!loop && currentIndex === 0"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <button
          class="slider-arrow slider-arrow--next"
          :class="{ 'slider-arrow--mobile': isMobile }"
          @click.stop="next"
          aria-label="Image suivante"
          :disabled="!loop && currentIndex === validImages.length - 1"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </template>

      <!-- Compteur top-right -->
      <div v-if="validImages.length > 1" class="slide-counter">
        {{ currentIndex + 1 }} / {{ validImages.length }}
      </div>

      <!-- Points indicateurs (max 8, puis on affiche juste le counter) -->
      <div
        v-if="validImages.length > 1 && validImages.length <= dotsMaxCount"
        class="slide-dots"
        role="tablist"
        aria-label="Navigation images"
      >
        <button
          v-for="(_, i) in validImages" :key="i"
          class="dot"
          :class="i === currentIndex ? 'dot--active' : ''"
          @click="goTo(i)"
          :aria-label="`Image ${i + 1}`"
          :aria-selected="i === currentIndex"
          role="tab"
        ></button>
      </div>

    </div>

    <!-- ── Modal plein écran ───────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showModal"
          class="modal-overlay"
          @click.self="closeModal"
          @keydown.esc="closeModal"
          @keydown.left="prevModal"
          @keydown.right="nextModal"
          tabindex="0"
          ref="modalRef"
          role="dialog"
          aria-modal="true"
          :aria-label="`Photo ${modalIndex + 1} sur ${validImages.length}`"
        >
          <!-- Fermer -->
          <button class="modal-close" @click="closeModal" aria-label="Fermer">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          <!-- Image -->
          <img
            :src="validImages[modalIndex]"
            :alt="`Photo ${modalIndex + 1}`"
            class="modal-img"
            loading="lazy"
          />

          <!-- Navigation modal -->
          <template v-if="validImages.length > 1">
            <button class="modal-nav modal-nav--prev" @click.stop="prevModal" aria-label="Précédent">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <button class="modal-nav modal-nav--next" @click.stop="nextModal" aria-label="Suivant">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </template>

          <!-- Compteur modal -->
          <div class="modal-counter">{{ modalIndex + 1 }} / {{ validImages.length }}</div>

          <!-- Thumbnails strip (desktop) -->
          <div v-if="validImages.length > 1 && validImages.length <= 12" class="modal-thumbs">
            <button
              v-for="(img, i) in validImages" :key="i"
              class="modal-thumb"
              :class="{ 'modal-thumb--active': i === modalIndex }"
              @click="modalIndex = i"
            >
              <img :src="img" :alt="`Miniature ${i + 1}`" loading="lazy" class="w-full h-full object-cover" />
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script>
export default {
  name: 'ImageSlider',

  props: {
    images:        { type: Array,   default: () => [] },
    loading:       { type: Boolean, default: false },
    autoPlay:      { type: Boolean, default: false },
    interval:      { type: Number,  default: 4000 },
    loop:          { type: Boolean, default: true },
    allowZoom:     { type: Boolean, default: true },
    emptyText:     { type: String,  default: 'Aucune image disponible' },
    dotsMaxCount:  { type: Number,  default: 8 },
    // Taille prédéfinie : 'sm' | 'md' | 'lg' | 'full' | 'auto'
    size:          { type: String,  default: 'md' },
  },

  emits: ['slide-change'],

  data() {
    return {
      currentIndex: 0,
      loadedMap:    {},  // { index: true } quand l'image est chargée
      errorMap:     {},  // { index: true } si erreur
      showModal:    false,
      modalIndex:   0,
      timer:        null,
      touchStartX:  0,
      isMobile:     false,
    }
  },

  computed: {
    // Ne garder que les URLs valides (non nulles, non vides)
    validImages() {
      return (this.images || [])
        .filter(url => url && typeof url === 'string' && url.trim() !== '')
    },
  },

  watch: {
    validImages: {
      handler(imgs) {
        this.currentIndex = 0
        this.loadedMap    = {}
        this.errorMap     = {}
        if (this.autoPlay && imgs.length > 1) this.startAuto()
        else this.stopAuto()
      },
      immediate: true,
    },
    currentIndex(v) {
      this.$emit('slide-change', v)
    },
  },

  mounted() {
    this.checkMobile()
    window.addEventListener('resize', this.checkMobile)
  },

  beforeUnmount() {
    this.stopAuto()
    window.removeEventListener('resize', this.checkMobile)
  },

  methods: {
    checkMobile() { this.isMobile = window.innerWidth < 768 },

    // ── Navigation ─────────────────────────────────────────────
    next() {
      if (this.validImages.length <= 1) return
      if (!this.loop && this.currentIndex === this.validImages.length - 1) return
      this.currentIndex = (this.currentIndex + 1) % this.validImages.length
      if (this.autoPlay) this.startAuto() // reset timer
    },
    prev() {
      if (this.validImages.length <= 1) return
      if (!this.loop && this.currentIndex === 0) return
      this.currentIndex = (this.currentIndex - 1 + this.validImages.length) % this.validImages.length
      if (this.autoPlay) this.startAuto()
    },
    goTo(i) {
      this.currentIndex = i
      if (this.autoPlay) this.startAuto()
    },

    // ── Autoplay ───────────────────────────────────────────────
    startAuto() {
      this.stopAuto()
      this.timer = setInterval(this.next, this.interval)
    },
    stopAuto() {
      if (this.timer) { clearInterval(this.timer); this.timer = null }
    },

    // ── Touch / Swipe ──────────────────────────────────────────
    onTouchStart(e) { this.touchStartX = e.changedTouches[0].clientX },
    onTouchEnd(e) {
      const dx = e.changedTouches[0].clientX - this.touchStartX
      if (Math.abs(dx) < 40) return  // trop petit → ignore
      if (dx < 0) this.next()
      else        this.prev()
    },

    // ── Image events ───────────────────────────────────────────
    onImgLoad(i)  { this.loadedMap = { ...this.loadedMap, [i]: true } },
    onImgError(i) {
      this.errorMap = { ...this.errorMap, [i]: true }
      // Retirer l'image en erreur du tableau n'est pas possible (props)
      // On marque juste comme chargée pour masquer le placeholder
      this.loadedMap = { ...this.loadedMap, [i]: true }
    },

    // ── Modal ──────────────────────────────────────────────────
    openModal(i) {
      this.modalIndex = i
      this.showModal  = true
      this.stopAuto()
      this.$nextTick(() => this.$refs.modalRef?.focus())
    },
    closeModal() {
      this.showModal = false
      if (this.autoPlay && this.validImages.length > 1) this.startAuto()
    },
    nextModal() { this.modalIndex = (this.modalIndex + 1) % this.validImages.length },
    prevModal() { this.modalIndex = (this.modalIndex - 1 + this.validImages.length) % this.validImages.length },
  },
}
</script>

<style scoped>
/* ── Conteneur principal ──────────────────────────────────────────────── */
.image-slider {
  position: relative;
  width: 100%;
  background: #f3f4f6;
  border-radius: .75rem;
  overflow: hidden;
  user-select: none;
}
.dark .image-slider { background: #1f2937; }

/* Tailles prédéfinies */
.image-slider--sm   { height: 180px; }
.image-slider--md   { height: 260px; }
.image-slider--lg   { height: 380px; }
.image-slider--full { height: 480px; }
.image-slider--auto { height: auto;  aspect-ratio: 16/9; }

@media (min-width: 640px) {
  .image-slider--sm   { height: 220px; }
  .image-slider--md   { height: 320px; }
  .image-slider--lg   { height: 420px; }
  .image-slider--full { height: 540px; }
}
@media (min-width: 1024px) {
  .image-slider--md   { height: 380px; }
  .image-slider--lg   { height: 500px; }
  .image-slider--full { height: 600px; }
}

/* ── Skeleton ──────────────────────────────────────────────────────────── */
.slider-skeleton {
  width: 100%; height: 100%;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem;
}
.skeleton-img {
  width: 100%; height: calc(100% - 2rem);
  background: linear-gradient(90deg, #e5e7eb 25%, #f9fafb 50%, #e5e7eb 75%);
  background-size: 400% 100%;
  animation: shimmer 1.6s ease-in-out infinite;
}
.dark .skeleton-img { background: linear-gradient(90deg, #374151 25%, #4b5563 50%, #374151 75%); background-size: 400% 100%; }
.skeleton-dots { display: flex; gap: .5rem; }
.skeleton-dot  { width: .5rem; height: .5rem; border-radius: 50%; background: #d1d5db; }
.dark .skeleton-dot { background: #4b5563; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* ── Empty ─────────────────────────────────────────────────────────────── */
.slider-empty {
  width: 100%; height: 100%; min-height: 120px;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .75rem;
}
.empty-icon  { width: 3.5rem; height: 3.5rem; color: #9ca3af; }
.empty-text  { font-size: .875rem; color: #9ca3af; }

/* ── Track ─────────────────────────────────────────────────────────────── */
.slider-track-wrap {
  position: relative; width: 100%; height: 100%; overflow: hidden;
}
.slider-track {
  display: flex; width: 100%; height: 100%;
  transition: transform .4s cubic-bezier(.4,0,.2,1);
  will-change: transform;
}
.slider-slide {
  flex: 0 0 100%; width: 100%; height: 100%;
  position: relative; overflow: hidden;
}

/* ── Image ─────────────────────────────────────────────────────────────── */
.slide-placeholder { position: absolute; inset: 0; }
.slide-img {
  width: 100%; height: 100%;
  object-fit: contain;   /* ← contain pour voir 100% de l'image */
  object-position: center;
  opacity: 0; transition: opacity .3s ease;
  position: relative; z-index: 1;
}
.slide-img.loaded { opacity: 1; }
/* En mode dashboard (taille sm), cover est plus esthétique */
.image-slider--sm .slide-img { object-fit: cover; }

/* ── Flèches ───────────────────────────────────────────────────────────── */
.slider-arrow {
  position: absolute; top: 50%; transform: translateY(-50%);
  width: 2.25rem; height: 2.25rem; border-radius: 50%;
  background: rgba(0,0,0,.55); color: #fff;
  display: flex; align-items: center; justify-content: center;
  z-index: 10; transition: background .18s, opacity .18s, transform .18s;
  opacity: 0;
}
.group:hover .slider-arrow { opacity: 1; }
/* Toujours visible sur mobile */
.slider-arrow--mobile { opacity: .75 !important; }
.slider-arrow--prev { left: .625rem; }
.slider-arrow--next { right: .625rem; }
.slider-arrow:hover  { background: rgba(0,0,0,.8); transform: translateY(-50%) scale(1.08); }
.slider-arrow:disabled { opacity: .2 !important; cursor: not-allowed; }

/* ── Compteur ──────────────────────────────────────────────────────────── */
.slide-counter {
  position: absolute; top: .625rem; right: .75rem;
  padding: .2rem .6rem; background: rgba(0,0,0,.55); color: #fff;
  font-size: .72rem; font-weight: 600; border-radius: 9999px; z-index: 10;
}

/* ── Dots ──────────────────────────────────────────────────────────────── */
.slide-dots {
  position: absolute; bottom: .75rem; left: 50%; transform: translateX(-50%);
  display: flex; gap: .375rem; z-index: 10;
}
.dot {
  height: .375rem; border-radius: 9999px;
  background: rgba(255,255,255,.5); transition: all .25s ease;
  width: .375rem;
}
.dot--active { background: #fff; width: 1.5rem; }

/* ── Modal plein écran ─────────────────────────────────────────────────── */
.modal-overlay {
  position: fixed; inset: 0; z-index: 9998;
  background: rgba(0,0,0,.95);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 1rem;
  outline: none;
}

.modal-close {
  position: absolute; top: 1rem; right: 1rem; z-index: 10;
  width: 2.5rem; height: 2.5rem; border-radius: 50%;
  background: rgba(255,255,255,.15); color: #fff;
  display: flex; align-items: center; justify-content: center;
  transition: background .15s;
}
.modal-close:hover { background: rgba(255,255,255,.3); }

.modal-img {
  max-width: 100%; max-height: calc(100vh - 10rem);
  object-fit: contain; border-radius: .5rem;
  box-shadow: 0 20px 60px rgba(0,0,0,.5);
}

.modal-nav {
  position: absolute; top: 50%; transform: translateY(-50%);
  width: 3rem; height: 3rem; border-radius: 50%;
  background: rgba(255,255,255,.15); color: #fff;
  display: flex; align-items: center; justify-content: center;
  transition: background .15s;
}
.modal-nav:hover  { background: rgba(255,255,255,.3); }
.modal-nav--prev  { left: 1rem; }
.modal-nav--next  { right: 1rem; }

.modal-counter {
  position: absolute; bottom: 5rem; left: 50%; transform: translateX(-50%);
  color: rgba(255,255,255,.7); font-size: .875rem; font-weight: 500;
}

/* Thumbnails strip */
.modal-thumbs {
  position: absolute; bottom: 1rem; left: 50%; transform: translateX(-50%);
  display: flex; gap: .375rem; max-width: calc(100vw - 2rem); overflow-x: auto;
  scrollbar-width: none; padding: .25rem;
}
.modal-thumbs::-webkit-scrollbar { display: none; }
.modal-thumb {
  flex: 0 0 3.5rem; height: 2.75rem; border-radius: .375rem;
  overflow: hidden; opacity: .5; transition: opacity .15s;
  border: 2px solid transparent;
}
.modal-thumb--active { opacity: 1; border-color: #fff; }
.modal-thumb:hover   { opacity: .85; }

/* ── Transition modal ──────────────────────────────────────────────────── */
.modal-enter-active, .modal-leave-active { transition: opacity .2s ease; }
.modal-enter-from,   .modal-leave-to     { opacity: 0; }
</style>
