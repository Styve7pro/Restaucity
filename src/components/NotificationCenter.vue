<template>
  <!-- Conteneur positionné en haut à droite sur desktop, en bas sur mobile -->
  <div class="notif-container" aria-live="polite" aria-label="Notifications">
    <TransitionGroup name="notif" tag="div" class="notif-list">
      <div
        v-for="notif in notifications"
        :key="notif.id"
        class="notif-card"
        :class="`notif-card--${notif.type}`"
        @click="handleClick(notif)"
        role="alert"
      >
        <!-- Photo du restaurant (si disponible) -->
        <div class="notif-thumb" v-if="notif.photo">
          <img :src="notif.photo" :alt="notif.title" class="w-full h-full object-cover" />
        </div>
        <div v-else class="notif-thumb notif-thumb--placeholder">
          <span>🍽️</span>
        </div>

        <!-- Contenu -->
        <div class="notif-body">
          <p class="notif-title">{{ notif.title }}</p>
          <p class="notif-message">{{ notif.message }}</p>
          <p v-if="notif.restaurantId" class="notif-cta">Voir le restaurant →</p>
        </div>

        <!-- Bouton fermer -->
        <button
          @click.stop="dismiss(notif.id)"
          class="notif-close"
          :aria-label="`Fermer la notification : ${notif.title}`"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        <!-- Barre de progression -->
        <div class="notif-progress">
          <div class="notif-progress-bar" :style="`animation-duration: ${dismissDelay}ms`"></div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script>
import { useNotifications } from '../composables/useNotifications.js'
import { useRouter } from 'vue-router'

export default {
  name: 'NotificationCenter',
  setup() {
    const { notifications, dismiss } = useNotifications()
    const router = useRouter()
    return { notifications, dismiss, router }
  },
  data() {
    return {
      dismissDelay: 6000, // doit correspondre à DISMISS_DELAY dans useNotifications
    }
  },
  methods: {
    handleClick(notif) {
      if (notif.restaurantId) {
        this.dismiss(notif.id)
        this.router.push(`/restaurant/${notif.restaurantId}`)
      }
    },
  },
}
</script>

<style scoped>
/* Conteneur — coin supérieur droit sur desktop, bas sur mobile */
.notif-container {
  position: fixed;
  top: 1.25rem;
  right: 1.25rem;
  z-index: 9999;
  width: 340px;
  max-width: calc(100vw - 2rem);
  pointer-events: none;
}
@media (max-width: 640px) {
  .notif-container {
    top: auto;
    bottom: 5.5rem; /* au-dessus de la bottom nav mobile */
    left: 1rem;
    right: 1rem;
    width: auto;
  }
}

.notif-list {
  display: flex;
  flex-direction: column;
  gap: .75rem;
}

/* Carte */
.notif-card {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: .75rem;
  padding: .875rem 2.25rem .875rem .875rem;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  box-shadow: 0 8px 24px rgba(0,0,0,.12), 0 2px 6px rgba(0,0,0,.06);
  cursor: pointer;
  pointer-events: all;
  overflow: hidden;
  transition: transform .15s, box-shadow .15s;
}
.notif-card:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(0,0,0,.15); }

.dark .notif-card {
  background: #1f2937;
  border-color: #374151;
  box-shadow: 0 8px 24px rgba(0,0,0,.4);
}

/* Accent couleur selon le type */
.notif-card--new_restaurant { border-left: 4px solid #f97316; }

/* Thumbnail */
.notif-thumb {
  width: 3rem; height: 3rem;
  border-radius: .625rem;
  flex-shrink: 0;
  overflow: hidden;
  background: #fef3c7;
}
.notif-thumb--placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
}

/* Texte */
.notif-body { flex: 1; min-width: 0; }
.notif-title {
  font-size: .8rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: .15rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dark .notif-title { color: #f9fafb; }
.notif-message {
  font-size: .8rem;
  color: #4b5563;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.dark .notif-message { color: #9ca3af; }
.notif-cta {
  font-size: .75rem;
  font-weight: 600;
  color: #f97316;
  margin-top: .25rem;
}

/* Bouton fermer */
.notif-close {
  position: absolute;
  top: .625rem;
  right: .625rem;
  padding: .2rem;
  color: #9ca3af;
  border-radius: .375rem;
  transition: color .15s, background .15s;
}
.notif-close:hover { color: #374151; background: #f3f4f6; }
.dark .notif-close:hover { color: #f9fafb; background: #374151; }

/* Barre de progression */
.notif-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(249,115,22,.15);
}
.notif-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #f97316, #fb923c);
  animation: progress linear forwards;
  transform-origin: left;
}
@keyframes progress {
  from { transform: scaleX(1); }
  to   { transform: scaleX(0); }
}

/* TransitionGroup animations */
.notif-enter-active { transition: all .3s cubic-bezier(.34,1.56,.64,1); }
.notif-leave-active { transition: all .2s ease; }
.notif-enter-from   { opacity: 0; transform: translateX(40px) scale(.95); }
.notif-leave-to     { opacity: 0; transform: translateX(40px); max-height: 0; }
.notif-move         { transition: transform .3s ease; }
</style>
