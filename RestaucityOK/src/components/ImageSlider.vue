<template>
  <div class="relative w-full h-96 bg-gray-100 dark:bg-gray-800 overflow-hidden group">
    <!-- Loading/Empty State -->
    <div v-if="!images || images.length === 0" class="absolute inset-0 flex items-center justify-center">
      <div class="text-center">
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p class="text-gray-600 dark:text-gray-400">Aucune image dans le slider</p>
      </div>
    </div>

    <!-- Slider Images -->
    <div v-else class="relative w-full h-full">
      <div
        v-for="(image, index) in images"
        :key="index"
        class="absolute inset-0 transition-opacity duration-500"
        :class="index === currentIndex ? 'opacity-100' : 'opacity-0'"
      >
        <img
          :src="image"
          alt="Slide"
          class="w-full h-full object-contain cursor-pointer"
          @click="openImageModal(index)"
        />
      </div>

      <!-- Navigation Arrows -->
      <button
        v-if="images.length > 1"
        @click="previousSlide"
        class="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        v-if="images.length > 1"
        @click="nextSlide"
        class="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <!-- Indicators -->
      <div v-if="images.length > 1" class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        <button
          v-for="(_, index) in images"
          :key="index"
          @click="goToSlide(index)"
          class="w-2 h-2 rounded-full transition-all"
          :class="index === currentIndex ? 'bg-white w-8' : 'bg-white/50'"
        ></button>
      </div>
    </div>

    <!-- Image Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4" @click="closeModal">
      <button @click="closeModal" class="absolute top-4 right-4 text-white hover:text-gray-300 z-10">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <img :src="images[modalIndex]" alt="Full size" class="max-w-full max-h-full object-contain" @click.stop />
      <button v-if="images.length > 1" @click.stop="previousModalImage" class="absolute left-4 text-white hover:text-gray-300">
        <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button v-if="images.length > 1" @click.stop="nextModalImage" class="absolute right-4 text-white hover:text-gray-300">
        <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-full text-sm">
        {{ modalIndex + 1 }} / {{ images.length }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImageSlider',
  props: {
    images: {
      type: Array,
      default: () => []
    },
    autoPlay: {
      type: Boolean,
      default: true
    },
    interval: {
      type: Number,
      default: 5000
    }
  },
  data() {
    return {
      currentIndex: 0,
      timer: null,
      showModal: false,
      modalIndex: 0
    }
  },
  watch: {
    images: {
      handler(newImages) {
        console.log('[v0] Images changed, count:', newImages?.length)
        if (this.autoPlay && newImages && newImages.length > 1) {
          this.startAutoPlay()
        } else {
          this.stopAutoPlay()
        }
      },
      immediate: true
    },
    autoPlay(newVal) {
      console.log('[v0] AutoPlay changed to:', newVal)
      if (newVal && this.images.length > 1) {
        this.startAutoPlay()
      } else {
        this.stopAutoPlay()
      }
    },
    interval(newVal) {
      console.log('[v0] Interval changed to:', newVal)
      if (this.autoPlay && this.images.length > 1) {
        this.startAutoPlay()
      }
    }
  },
  mounted() {
    console.log('[v0] ImageSlider mounted with', this.images?.length, 'images')
  },
  beforeUnmount() {
    console.log('[v0] ImageSlider unmounting, stopping autoplay')
    this.stopAutoPlay()
  },
  methods: {
    startAutoPlay() {
      console.log('[v0] Starting autoplay with interval:', this.interval)
      this.stopAutoPlay()
      this.timer = setInterval(() => {
        console.log('[v0] Auto-advancing to next slide')
        this.nextSlide()
      }, this.interval)
    },
    stopAutoPlay() {
      if (this.timer) {
        console.log('[v0] Stopping autoplay')
        clearInterval(this.timer)
        this.timer = null
      }
    },
    nextSlide() {
      this.currentIndex = (this.currentIndex + 1) % this.images.length
      console.log('[v0] Next slide, currentIndex:', this.currentIndex)
    },
    previousSlide() {
      this.currentIndex = this.currentIndex === 0 ? this.images.length - 1 : this.currentIndex - 1
      console.log('[v0] Previous slide, currentIndex:', this.currentIndex)
    },
    goToSlide(index) {
      this.currentIndex = index
      console.log('[v0] Go to slide:', index)
      if (this.autoPlay) {
        this.startAutoPlay()
      }
    },
    openImageModal(index) {
      this.modalIndex = index
      this.showModal = true
      this.stopAutoPlay()
      console.log('[v0] Opened modal at index:', index)
    },
    closeModal() {
      this.showModal = false
      console.log('[v0] Closed modal, restarting autoplay')
      if (this.autoPlay) {
        this.startAutoPlay()
      }
    },
    nextModalImage() {
      this.modalIndex = (this.modalIndex + 1) % this.images.length
    },
    previousModalImage() {
      this.modalIndex = this.modalIndex === 0 ? this.images.length - 1 : this.modalIndex - 1
    }
  }
}
</script>
