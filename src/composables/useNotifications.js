// src/composables/useNotifications.js
// ─────────────────────────────────────────────────────────────────────────────
//  Système de notifications temps réel via Supabase Realtime.
//
//  FONCTIONNEMENT :
//  Supabase Realtime envoie un événement INSERT sur la table `restaurants`
//  à TOUS les clients connectés dès qu'un nouveau restaurant est ajouté.
//  Aucune table supplémentaire nécessaire.
//
//  PRÉREQUIS (Supabase Dashboard) :
//  → Database → Replication → activer "Source" pour la table `restaurants`
//  → (OU) utiliser la publication supabase_realtime par défaut
//
//  ANTI-SPAM :
//  - Déduplication par restaurant_id (jamais deux fois la même notif)
//  - Max 5 notifications affichées simultanément
//  - Auto-dismiss après 6 secondes
//  - Cooldown 3s entre deux notifications
// ─────────────────────────────────────────────────────────────────────────────

import { ref, readonly } from 'vue'
import { supabase } from '../config/supabaseConfig.js'

// ── State singleton ────────────────────────────────────────────────────────
const notifications  = ref([])  // notifs affichées
const channel        = ref(null)
const isSubscribed   = ref(false)
const seenIds        = new Set()   // déduplication session
const MAX_VISIBLE    = 5
const DISMISS_DELAY  = 6000
const COOLDOWN_MS    = 3000
let   lastNotifTime  = 0

let idCounter = 0
function nextId() { return ++idCounter }

// ── Composable ─────────────────────────────────────────────────────────────
export function useNotifications() {

  /**
   * S'abonne aux INSERT sur la table restaurants.
   * Doit être appelé UNE SEULE FOIS (App.vue, mounted).
   */
  function subscribe() {
    if (isSubscribed.value) return

    channel.value = supabase
      .channel('restaurant-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'restaurants' },
        (payload) => handleNewRestaurant(payload.new)
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          isSubscribed.value = true
          console.log('[Notifications] Realtime connecté ✓')
        }
        if (status === 'CHANNEL_ERROR') {
          console.warn('[Notifications] Erreur canal Realtime')
        }
      })
  }

  /**
   * Se désabonne proprement (appelé dans beforeUnmount de App.vue).
   */
  function unsubscribe() {
    if (channel.value) {
      supabase.removeChannel(channel.value)
      channel.value    = null
      isSubscribed.value = false
    }
  }

  /**
   * Traite un nouveau restaurant reçu via Realtime.
   */
  function handleNewRestaurant(restaurant) {
    const id = restaurant.restaurant_id || restaurant.id

    // Anti-spam 1 : déduplication par ID
    if (id && seenIds.has(id)) return
    if (id) seenIds.add(id)

    // Anti-spam 2 : cooldown entre notifications
    const now = Date.now()
    if (now - lastNotifTime < COOLDOWN_MS) return
    lastNotifTime = now

    // Anti-spam 3 : max visible
    if (notifications.value.length >= MAX_VISIBLE) {
      notifications.value.shift() // retire la plus ancienne
    }

    push({
      id:          nextId(),
      type:        'new_restaurant',
      title:       '🍽️ Nouveau restaurant !',
      message:     `"${restaurant.nom}" vient d'être ajouté${restaurant.type ? ` — ${restaurant.type}` : ''}.`,
      restaurantId: id,
      photo:       restaurant.photos?.[0] || null,
      createdAt:   Date.now(),
    })
  }

  /**
   * Pousse une notification dans la liste et programme son dismiss.
   */
  function push(notif) {
    notifications.value.push(notif)
    setTimeout(() => dismiss(notif.id), DISMISS_DELAY)
  }

  /**
   * Retire une notification par id.
   */
  function dismiss(id) {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }

  /**
   * Retire toutes les notifications.
   */
  function dismissAll() {
    notifications.value = []
  }

  return {
    notifications: readonly(notifications),
    isSubscribed:  readonly(isSubscribed),
    subscribe,
    unsubscribe,
    dismiss,
    dismissAll,
  }
}
