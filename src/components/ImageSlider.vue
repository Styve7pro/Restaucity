<template>
  <div class="relative w-full h-96 bg-gray-100 dark:bg-gray-800 overflow-hidden group">
    <!-- Empty -->
    <div v-if="!images || images.length === 0" class="absolute inset-0 flex items-center justify-center">
      <div class="text-center">
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p class="text-gray-500 dark:text-gray-400">Aucune image disponible</p>
      </div>
    </div>

    <!-- Slides -->
    <div v-else class="relative w-full h-full">
      <div
        v-for="(image, index) in images"
        :key="index"
        class="absolute inset-0 transition-opacity duration-500"
        :class="index === currentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'"
      >
        <img
          :src="image"
          alt="Slide"
          loading="lazy"
          decoding="async"
          class="w-full h-full object-contain cursor-pointer"
          @click="openImageModal(index)"
          @error="(e) => e.target.src = '/placeholder.svg'"
        />
      </div>

      <!-- Arrows -->
      <button
        v-if="images.length > 1"
        @click="previousSlide"
        class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
        aria-label="Image précédente"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        v-if="images.length > 1"
        @click="nextSlide"
        class="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
        aria-label="Image suivante"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <!-- Indicators -->
      <div v-if="images.length > 1" class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        <button
          v-for="(_, index) in images"
          :key="index"
          @click="goToSlide(index)"
          class="h-2 rounded-full transition-all"
          :class="index === currentIndex ? 'bg-white w-8' : 'bg-white/50 w-2'"
          :aria-label="`Aller à l'image ${index + 1}`"
        />
      </div>

      <!-- Counter -->
      <div v-if="images.length > 1" class="absolute top-3 right-3 px-2 py-1 bg-black/50 text-white text-xs rounded-full">
        {{ currentIndex + 1 }} / {{ images.length }}
      </div>
    </div>

    <!-- Full-screen modal -->
    <Teleport to="body">
      <div
        v-if="showModal"
        class="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
        @click.self="closeModal"
      >
        <button @click="closeModal" class="absolute top-4 right-4 text-white hover:text-gray-300 z-10 p-2">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <img :src="images[modalIndex]" alt="Plein écran" class="max-w-full max-h-full object-contain rounded-lg" />
        <button v-if="images.length > 1" @click.stop="previousModalImage" class="absolute left-4 text-white hover:text-gray-300 p-2">
          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button v-if="images.length > 1" @click.stop="nextModalImage" class="absolute right-4 text-white hover:text-gray-300 p-2">
          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <div class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm">
          {{ modalIndex + 1 }} / {{ images.length }}
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script>
export default {
  name: 'ImageSlider',
  props: {
    images: { type: Array, default: () => [] },
    autoPlay: { type: Boolean, default: true },
    interval: { type: Number, default: 4000 },
  },
  data() {
    return {
      currentIndex: 0,
      timer: null,
      showModal: false,
      modalIndex: 0,
    }
  },
  watch: {
    images: {
      handler(newImages) {
        this.currentIndex = 0
        if (this.autoPlay && newImages?.length > 1) this.startAutoPlay()
        else this.stopAutoPlay()
      },
      immediate: true,
    },
  },
  beforeUnmount() {
    this.stopAutoPlay()
  },
  methods: {
    startAutoPlay() {
      this.stopAutoPlay()
      this.timer = setInterval(this.nextSlide, this.interval)
    },
    stopAutoPlay() {
      if (this.timer) { clearInterval(this.timer); this.timer = null }
    },
    nextSlide() {
      this.currentIndex = (this.currentIndex + 1) % this.images.length
    },
    previousSlide() {
      this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length
    },
    goToSlide(index) {
      this.currentIndex = index
      if (this.autoPlay) this.startAutoPlay()
    },
    openImageModal(index) {
      this.modalIndex = index
      this.showModal = true
      this.stopAutoPlay()
    },
    closeModal() {
      this.showModal = false
      if (this.autoPlay && this.images.length > 1) this.startAutoPlay()
    },
    nextModalImage() {
      this.modalIndex = (this.modalIndex + 1) % this.images.length
    },
    previousModalImage() {
      this.modalIndex = (this.modalIndex - 1 + this.images.length) % this.images.length
    },
  },
}
</script>
