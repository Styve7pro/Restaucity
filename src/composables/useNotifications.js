// src/composables/useNotifications.js
// ─────────────────────────────────────────────────────────────────────────────
//  Notifications temps réel + historique persistant en session.
//  Écoute 2 tables : `restaurants` (INSERT) + `menu` (INSERT)
//  Expose aussi fetchHistory() pour charger les N derniers événements.
// ─────────────────────────────────────────────────────────────────────────────

import { ref, readonly, computed } from 'vue'
import { supabase } from '../config/supabaseConfig.js'

// ── State singleton ────────────────────────────────────────────────────────
const toasts         = ref([])   // bulles temporaires (coin écran)
const feedItems      = ref([])   // historique pour la page /notifications
const unreadCount    = ref(0)
const isSubscribed   = ref(false)
const historyLoaded  = ref(false)
const channel        = ref(null)

const seenIds  = new Set()  // anti-duplication realtime

const TOAST_DURATION = 6000
const MAX_TOASTS     = 4
let   idCounter      = 0
const nextId = () => `notif-${++idCounter}`

// ── Types de notifications ────────────────────────────────────────────────
const TYPES = {
  new_restaurant: { label: 'Nouveau restaurant', emoji: '🍽️', color: 'orange' },
  new_dish:       { label: 'Nouveau plat',        emoji: '🥘', color: 'green'  },
}

// ── Composable ─────────────────────────────────────────────────────────────
export function useNotifications() {

  // ── Realtime subscribe ───────────────────────────────────────────────────
  function subscribe() {
    if (isSubscribed.value) return

    channel.value = supabase
      .channel('app-notifications')
      // Nouveau restaurant
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'restaurants' },
        (payload) => onNewRestaurant(payload.new)
      )
      // Nouveau plat dans le menu
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'menu' },
        (payload) => onNewDish(payload.new)
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          isSubscribed.value = true
          console.log('[Notifs] Realtime connecté ✓')
        }
        if (status === 'CHANNEL_ERROR') {
          console.warn('[Notifs] Erreur canal Realtime')
        }
      })
  }

  function unsubscribe() {
    if (channel.value) {
      supabase.removeChannel(channel.value)
      channel.value      = null
      isSubscribed.value = false
    }
  }

  // ── Handlers Realtime ────────────────────────────────────────────────────
  function onNewRestaurant(row) {
    const key = `resto-${row.restaurant_id || row.id}`
    if (seenIds.has(key)) return
    seenIds.add(key)

    const item = buildItem({
      type:        'new_restaurant',
      title:       row.nom || 'Nouveau restaurant',
      subtitle:    row.type || row.adresse || '',
      photo:       row.photos?.[0] || null,
      restaurantId: row.restaurant_id || row.id,
      createdAt:   new Date().toISOString(),
    })

    prependFeed(item)
    showToast(item)
  }

  function onNewDish(row) {
    const key = `dish-${row.id}`
    if (seenIds.has(key)) return
    seenIds.add(key)

    const item = buildItem({
      type:         'new_dish',
      title:        row.nom || 'Nouveau plat',
      subtitle:     row.categorie ? `${row.categorie}${row.prix ? ` • ${row.prix} FCFA` : ''}` : '',
      photo:        row.image || null,
      restaurantId: row.restaurant_id,
      dishId:       row.id,
      createdAt:    new Date().toISOString(),
    })

    prependFeed(item)
    showToast(item)
  }

  // ── Charger l'historique depuis Supabase ──────────────────────────────────
  async function fetchHistory(limit = 40) {
    if (historyLoaded.value) return

    try {
      // Restaurants récents
      const { data: restaurants } = await supabase
        .from('restaurants')
        .select('restaurant_id, nom, type, adresse, photos, created_at')
        .order('created_at', { ascending: false })
        .limit(limit / 2)

      // Plats récents
      const { data: dishes } = await supabase
        .from('menu')
        .select('id, nom, categorie, prix, image, restaurant_id, created_at')
        .order('created_at', { ascending: false })
        .limit(limit / 2)

      const items = [
        ...(restaurants || []).map(r => buildItem({
          type:         'new_restaurant',
          title:        r.nom || 'Restaurant',
          subtitle:     r.type || r.adresse || '',
          photo:        r.photos?.[0] || null,
          restaurantId: r.restaurant_id,
          createdAt:    r.created_at,
        })),
        ...(dishes || []).map(d => buildItem({
          type:         'new_dish',
          title:        d.nom || 'Plat',
          subtitle:     d.categorie ? `${d.categorie}${d.prix ? ` • ${d.prix} FCFA` : ''}` : '',
          photo:        d.image || null,
          restaurantId: d.restaurant_id,
          dishId:       d.id,
          createdAt:    d.created_at,
        })),
      ]

      // Trier par date décroissante
      items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

      feedItems.value    = items
      historyLoaded.value = true
    } catch (err) {
      console.error('[Notifs] fetchHistory error:', err)
    }
  }

  // ── Helpers internes ──────────────────────────────────────────────────────
  function buildItem({ type, title, subtitle, photo, restaurantId, dishId, createdAt }) {
    return {
      id:           nextId(),
      type,
      meta:         TYPES[type],
      title,
      subtitle,
      photo,
      restaurantId,
      dishId,
      createdAt,
    }
  }

  function prependFeed(item) {
    feedItems.value.unshift(item)
    unreadCount.value++
  }

  function showToast(item) {
    if (toasts.value.length >= MAX_TOASTS) toasts.value.shift()
    toasts.value.push({ ...item, toastId: nextId() })
    setTimeout(() => dismissToast(item.toastId || item.id), TOAST_DURATION)
  }

  function dismissToast(id) {
    toasts.value = toasts.value.filter(t => (t.toastId || t.id) !== id)
  }

  function markAllRead() {
    unreadCount.value = 0
  }

  return {
    // Pour le feed (page /notifications)
    feedItems:    readonly(feedItems),
    unreadCount:  readonly(unreadCount),
    historyLoaded: readonly(historyLoaded),
    // Pour les toasts flottants
    toasts:       readonly(toasts),
    isSubscribed: readonly(isSubscribed),
    // Actions
    subscribe,
    unsubscribe,
    fetchHistory,
    dismissToast,
    markAllRead,
    TYPES,
  }
}
