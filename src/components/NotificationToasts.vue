<template>
  <div class="toast-container" aria-live="polite">
    <TransitionGroup name="toast" tag="div" class="toast-stack">
      <div
        v-for="notif in toasts"
        :key="notif.toastId || notif.id"
        class="toast-card"
        :class="`toast-card--${notif.type}`"
        @click="handleClick(notif)"
        role="alert"
      >
        <!-- Thumb -->
        <div class="toast-thumb">
          <img v-if="notif.photo" :src="notif.photo" :alt="notif.title" class="w-full h-full object-cover" />
          <span v-else>{{ notif.meta.emoji }}</span>
        </div>

        <!-- Body -->
        <div class="toast-body">
          <p class="toast-title">{{ notif.title }}</p>
          <p class="toast-msg">{{ notif.subtitle || notif.meta.label }}</p>
          <p v-if="notif.restaurantId" class="toast-cta">Voir →</p>
        </div>

        <!-- Close -->
        <button @click.stop="dismissToast(notif.toastId || notif.id)" class="toast-close" aria-label="Fermer">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        <!-- Progress bar -->
        <div class="toast-progress">
          <div class="toast-progress-fill" :class="`toast-progress-fill--${notif.meta?.color || 'orange'}`"></div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script>
import { useNotifications } from '../composables/useNotifications.js'
import { useRouter } from 'vue-router'

export default {
  name: 'NotificationToasts',
  setup() {
    const { toasts, dismissToast } = useNotifications()
    const router = useRouter()
    return { toasts, dismissToast, router }
  },
  methods: {
    handleClick(notif) {
      if (notif.restaurantId) {
        this.dismissToast(notif.toastId || notif.id)
        this.router.push(`/restaurant/${notif.restaurantId}`)
      }
    },
  },
}
</script>

<style scoped>
.toast-container {
  position: fixed; top: 1.25rem; right: 1.25rem;
  z-index: 9999; width: 320px; max-width: calc(100vw - 2rem);
  pointer-events: none;
}
@media (max-width: 640px) {
  .toast-container {
    top: auto; bottom: 5.5rem;
    left: 1rem; right: 1rem; width: auto;
  }
}
.toast-stack { display: flex; flex-direction: column; gap: .625rem; }

.toast-card {
  position: relative; display: flex; align-items: flex-start; gap: .75rem;
  padding: .75rem 2rem .75rem .75rem;
  background: #fff; border: 1px solid #e5e7eb; border-radius: .875rem;
  box-shadow: 0 8px 24px rgba(0,0,0,.12);
  cursor: pointer; pointer-events: all; overflow: hidden;
  transition: transform .15s, box-shadow .15s;
}
.toast-card:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(0,0,0,.16); }
.dark .toast-card { background: #1f2937; border-color: #374151; }
.toast-card--new_restaurant { border-left: 3px solid #f97316; }
.toast-card--new_dish       { border-left: 3px solid #22c55e; }

.toast-thumb {
  width: 2.75rem; height: 2.75rem; flex-shrink: 0;
  border-radius: .5rem; overflow: hidden; background: #f3f4f6;
  display: flex; align-items: center; justify-content: center; font-size: 1.25rem;
}
.dark .toast-thumb { background: #374151; }

.toast-body { flex: 1; min-width: 0; }
.toast-title { font-size: .8rem; font-weight: 700; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dark .toast-title { color: #f9fafb; }
.toast-msg { font-size: .75rem; color: #6b7280; margin-top: .1rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.dark .toast-msg { color: #9ca3af; }
.toast-cta { font-size: .72rem; font-weight: 600; color: #f97316; margin-top: .2rem; }

.toast-close { position: absolute; top: .5rem; right: .5rem; color: #9ca3af; padding: .2rem; border-radius: .375rem; transition: color .15s; }
.toast-close:hover { color: #374151; }
.dark .toast-close:hover { color: #f9fafb; }

.toast-progress { position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: rgba(0,0,0,.06); }
.toast-progress-fill { height: 100%; animation: shrink 6s linear forwards; }
.toast-progress-fill--orange { background: #f97316; }
.toast-progress-fill--green  { background: #22c55e; }
@keyframes shrink { from { transform: scaleX(1); } to { transform: scaleX(0); } }
.toast-progress-fill { transform-origin: left; }

.toast-enter-active { transition: all .28s cubic-bezier(.34,1.56,.64,1); }
.toast-leave-active  { transition: all .2s ease; }
.toast-enter-from    { opacity: 0; transform: translateX(30px) scale(.95); }
.toast-leave-to      { opacity: 0; transform: translateX(30px); }
.toast-move          { transition: transform .3s ease; }
</style>
