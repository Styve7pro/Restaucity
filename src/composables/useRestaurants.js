// src/composables/useRestaurants.js
import { ref } from 'vue'
import { supabase } from '../config/supabaseConfig.js'
import { useSupabaseStorage } from './useSupabaseStorage.js'
import { useStatistics } from './useStatistics.js'
import { useAuth } from './useAuth.js'

// ── Cache simple avec TTL ──────────────────────────────────────────────────
const CACHE_TTL = 2 * 60 * 1000 // 2 minutes
const cache = { data: null, ts: 0 }
const isStale = () => !cache.data || Date.now() - cache.ts > CACHE_TTL
const setCache = (data) => { cache.data = data; cache.ts = Date.now() }
const clearCache = () => { cache.data = null; cache.ts = 0 }

// ── State partagé ──────────────────────────────────────────────────────────
const restaurants = ref([])
const loading = ref(false)
const error = ref(null)
const menuItems = ref([])
const menuLoading = ref(false)

export function useRestaurants() {
  const { uploadRestaurantImages, uploadMenuImages } = useSupabaseStorage()
  const { getRestaurantStats } = useStatistics()
  const { user } = useAuth()

  // ── Fetch restaurants (requête groupée, 1 seul appel) ──────────────────
  const fetchRestaurants = async (force = false) => {
    if (!force && !isStale() && restaurants.value.length > 0) {
      restaurants.value = cache.data
      return
    }

    loading.value = true
    error.value = null

    try {
      // Requête principale — restaurants uniquement
      const { data, error: fetchError } = await supabase
        .from('restaurants')
        .select('*')
        .order('nom', { ascending: true })

      if (fetchError) throw fetchError

      // Comptes reviews et favoris en parallèle (2 requêtes au lieu de N×2)
      const [reviewsRes, favoritesRes] = await Promise.all([
        supabase.from('reviews').select('restaurant_id'),
        supabase.from('favorites').select('restaurant_id'),
      ])

      // Construire des maps id → count pour éviter N boucles
      const reviewCounts = {}
      ;(reviewsRes.data || []).forEach((r) => {
        reviewCounts[r.restaurant_id] = (reviewCounts[r.restaurant_id] || 0) + 1
      })

      const favoriteCounts = {}
      ;(favoritesRes.data || []).forEach((f) => {
        favoriteCounts[f.restaurant_id] = (favoriteCounts[f.restaurant_id] || 0) + 1
      })

      restaurants.value = data.map((r) => ({
        ...r,
        id: r.restaurant_id,
        reviewCount: reviewCounts[r.restaurant_id] || 0,
        favoritesCount: favoriteCounts[r.restaurant_id] || 0,
        avis: { length: reviewCounts[r.restaurant_id] || 0 },
      }))

      setCache(restaurants.value)
      console.log('[Restaurants] Loaded:', restaurants.value.length)
    } catch (err) {
      error.value = err.message
      console.error('[Restaurants] fetchRestaurants error:', err)
    } finally {
      loading.value = false
    }
  }

  // ── Get by ID ──────────────────────────────────────────────────────────
  const getRestaurantById = async (id) => {
    // Chercher dans le cache d'abord
    const cached = restaurants.value.find(
      (r) => r.id === id || r.restaurant_id === id
    )
    if (cached) return cached

    try {
      const { data, error: fetchError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('restaurant_id', id)
        .single()

      if (fetchError) throw fetchError
      return { ...data, id: data.restaurant_id }
    } catch (err) {
      console.error('[Restaurants] getRestaurantById error:', err)
      return null
    }
  }

  // ── Add restaurant ──────────────────────────────────────────────────────
  const addRestaurant = async (restaurantData, imageFiles = []) => {
    loading.value = true
    error.value = null

    try {
      const restaurantId = `resto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      let photoUrls = []
      if (imageFiles?.length > 0) {
        const result = await uploadRestaurantImages(imageFiles, restaurantData.nom)
        photoUrls = result.urls || []
      }

      const payload = {
        restaurant_id: restaurantId,
        nom: restaurantData.nom,
        type: restaurantData.type || '',
        adresse: restaurantData.adresse || '',
        description: restaurantData.description || '',
        numero: restaurantData.numero || '',
        prix: restaurantData.prix || '',
        note: restaurantData.note || 0,
        photos: photoUrls,
        favorites: 0,
        visites: 0,
        avis: [],
        horaire: restaurantData.horaire || defaultHoraire(),
      }

      const { data, error: insertError } = await supabase
        .from('restaurants')
        .insert([payload])
        .select()

      if (insertError) throw insertError

      clearCache()
      await fetchRestaurants(true)
      return { success: true, id: restaurantId }
    } catch (err) {
      error.value = err.message
      console.error('[Restaurants] addRestaurant error:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // ── Update restaurant ───────────────────────────────────────────────────
  // restaurantData.photos[]     = URLs existantes conservées
  // restaurantData.cover_photo  = URL image principale
  // imageFiles[]                = nouveaux fichiers à uploader
  const updateRestaurant = async (id, restaurantData, imageFiles = []) => {
    loading.value = true
    error.value   = null

    try {
      let photoUrls = [...(restaurantData.photos || [])]

      // Upload des nouvelles images
      if (imageFiles?.length > 0) {
        const result = await uploadRestaurantImages(imageFiles, restaurantData.nom)
        photoUrls = [...photoUrls, ...(result.urls || [])]
      }

      // Image principale toujours en 1ère position
      let cover = restaurantData.cover_photo || null
      if (cover && photoUrls.includes(cover)) {
        photoUrls = [cover, ...photoUrls.filter(u => u !== cover)]
      } else if (!cover && photoUrls.length > 0) {
        cover = photoUrls[0]
      }

      const payload = {
        nom:         restaurantData.nom,
        type:        restaurantData.type        || '',
        adresse:     restaurantData.adresse      || '',
        description: restaurantData.description  || '',
        numero:      restaurantData.numero       || '',
        prix:        restaurantData.prix         || '',
        note:        restaurantData.note         || 0,
        photos:      photoUrls,
        cover_photo: cover,
        horaire:     restaurantData.horaire      || {},
      }

      const { error: updateError } = await supabase
        .from('restaurants')
        .update(payload)
        .eq('restaurant_id', id)

      if (updateError) throw updateError

      const idx = restaurants.value.findIndex(r => r.id === id || r.restaurant_id === id)
      if (idx !== -1) restaurants.value[idx] = { ...restaurants.value[idx], ...payload, id }

      clearCache()
      return { success: true }
    } catch (err) {
      error.value = err.message
      console.error('[Restaurants] updateRestaurant error:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // ── Supprimer TOUTES les photos d'un restaurant (hors menu) ─────────────
  const deleteAllRestaurantPhotos = async (id, restaurantName) => {
    const sanitize = n => n.trim().replace(/\s+/g,'_').replace(/[^a-zA-Z0-9_-]/g,'').toLowerCase()
    const { listStorageImages, deleteImage } = useSupabaseStorage()
    try {
      const folder = `restaurants/${sanitize(restaurantName)}`
      const allFiles = await listStorageImages(folder)
      // Exclure tout ce qui est dans /menu/
      const rootFiles = allFiles.filter(url => {
        const after = url.split(`/storage/v1/object/public/restaurants/`)[1] || ''
        return !after.includes('/menu/')
      })
      // Supprimer les fichiers storage
      await Promise.allSettled(rootFiles.map(url => deleteImage(url)))
      // Vider en DB
      const { error: dbErr } = await supabase
        .from('restaurants')
        .update({ photos: [], cover_photo: null })
        .eq('restaurant_id', id)
      if (dbErr) throw dbErr
      // Mise à jour locale
      const idx = restaurants.value.findIndex(r => r.id === id || r.restaurant_id === id)
      if (idx !== -1) restaurants.value[idx] = { ...restaurants.value[idx], photos: [], cover_photo: null }
      clearCache()
      return { success: true, deletedCount: rootFiles.length }
    } catch (err) {
      console.error('[Restaurants] deleteAllRestaurantPhotos error:', err)
      return { success: false, error: err.message }
    }
  }

  // ── Delete restaurant ───────────────────────────────────────────────────
  const deleteRestaurant = async (id) => {
    loading.value = true
    try {
      const { error: deleteError } = await supabase
        .from('restaurants')
        .delete()
        .eq('restaurant_id', id)

      if (deleteError) throw deleteError

      restaurants.value = restaurants.value.filter(
        (r) => r.id !== id && r.restaurant_id !== id
      )
      clearCache()
      return { success: true }
    } catch (err) {
      error.value = err.message
      console.error('[Restaurants] deleteRestaurant error:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // ── Menu ────────────────────────────────────────────────────────────────
  const fetchMenu = async (restaurantId) => {
    menuLoading.value = true
    try {
      const { data, error: fetchError } = await supabase
        .from('menu')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('categorie', { ascending: true })

      if (fetchError) throw fetchError
      menuItems.value = data || []
      return data || []
    } catch (err) {
      console.error('[Menu] fetchMenu error:', err)
      return []
    } finally {
      menuLoading.value = false
    }
  }

  const addMenuItem = async (restaurantId, menuData, imageFiles = []) => {
    try {
      let imageUrl = null

      if (imageFiles?.length > 0) {
        const dishName = menuData.nom || `dish_${Date.now()}`
        const restaurant = restaurants.value.find(
          (r) => r.id === restaurantId || r.restaurant_id === restaurantId
        )
        const restaurantName = restaurant?.nom || 'restaurant'
        const result = await uploadMenuImages(imageFiles, restaurantName, dishName)
        imageUrl = result.urls?.[0] || null
      }

      const payload = {
        restaurant_id: restaurantId,
        nom: menuData.nom || '',
        description: menuData.description || '',
        prix: parseFloat(menuData.prix) || 0,
        categorie: menuData.categorie || 'Plats',
        image: imageUrl || (typeof menuData.image === 'string' ? menuData.image : null),
      }

      const { data, error: insertError } = await supabase.from('menu').insert([payload]).select()
      if (insertError) throw insertError

      menuItems.value.push(data[0])
      return { success: true, data: data[0] }
    } catch (err) {
      console.error('[Menu] addMenuItem error:', err)
      return { success: false, error: err.message }
    }
  }

  const updateMenuItem = async (restaurantId, menuItemId, menuData, imageFiles = []) => {
    try {
      let imageUrl = menuData.image
      if (Array.isArray(imageUrl)) imageUrl = imageUrl[0] || null

      if (imageFiles?.length > 0) {
        const restaurant = restaurants.value.find(
          (r) => r.id === restaurantId || r.restaurant_id === restaurantId
        )
        const restaurantName = restaurant?.nom || 'restaurant'
        const result = await uploadMenuImages(imageFiles, restaurantName, menuData.nom)
        imageUrl = result.urls?.[0] || imageUrl
      }

      const payload = {
        nom: menuData.nom || '',
        description: menuData.description || '',
        prix: parseFloat(menuData.prix) || 0,
        categorie: menuData.categorie || 'Plats',
        image: typeof imageUrl === 'string' ? imageUrl : null,
      }

      const { error: updateError } = await supabase.from('menu').update(payload).eq('id', menuItemId)
      if (updateError) throw updateError

      const idx = menuItems.value.findIndex((m) => m.id === menuItemId)
      if (idx !== -1) menuItems.value[idx] = { ...menuItems.value[idx], ...payload }

      return { success: true }
    } catch (err) {
      console.error('[Menu] updateMenuItem error:', err)
      return { success: false, error: err.message }
    }
  }

  const deleteMenuItem = async (restaurantId, menuItemId) => {
    try {
      const { data: item } = await supabase.from('menu').select('*').eq('id', menuItemId).single()

      const { error: deleteError } = await supabase.from('menu').delete().eq('id', menuItemId)
      if (deleteError) throw deleteError

      menuItems.value = menuItems.value.filter((m) => m.id !== menuItemId)
      return { success: true }
    } catch (err) {
      console.error('[Menu] deleteMenuItem error:', err)
      return { success: false, error: err.message }
    }
  }

  // ── Favoris ─────────────────────────────────────────────────────────────
  const toggleFavorite = async (restaurantId) => {
    if (!user.value) return { success: false, error: 'Non connecté' }

    try {
      const userId = user.value.id
      const { data: existing, error: checkError } = await supabase
        .from('favorites')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('user_id', userId)
        .single()

      if (checkError && checkError.code !== 'PGRST116') throw checkError

      if (existing) {
        await supabase.from('favorites').delete().eq('restaurant_id', restaurantId).eq('user_id', userId)
        return { success: true, isFavorite: false }
      } else {
        await supabase.from('favorites').insert([{ restaurant_id: restaurantId, user_id: userId }])
        return { success: true, isFavorite: true }
      }
    } catch (err) {
      console.error('[Favorites] toggleFavorite error:', err)
      return { success: false, error: err.message }
    }
  }

  const isFavorite = async (restaurantId) => {
    if (!user.value) return false
    try {
      const { data } = await supabase
        .from('favorites')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('user_id', user.value.id)
        .single()
      return !!data
    } catch {
      return false
    }
  }

  const getUserFavorites = async () => {
    if (!user.value) return []
    try {
      const { data: favData } = await supabase
        .from('favorites')
        .select('restaurant_id')
        .eq('user_id', user.value.id)

      const ids = (favData || []).map((f) => f.restaurant_id)
      if (!ids.length) return []

      const { data } = await supabase.from('restaurants').select('*').in('restaurant_id', ids)
      return (data || []).map((r) => ({ ...r, id: r.restaurant_id }))
    } catch (err) {
      console.error('[Favorites] getUserFavorites error:', err)
      return []
    }
  }

  // ── Reviews ─────────────────────────────────────────────────────────────
  const getReviews = async (restaurantId) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('reviews')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      return data || []
    } catch (err) {
      console.error('[Reviews] getReviews error:', err)
      return []
    }
  }

  const deleteReview = async (reviewId, restaurantId) => {
    try {
      const { error: deleteError } = await supabase.from('reviews').delete().eq('id', reviewId)
      if (deleteError) throw deleteError

      // Recalculer la note moyenne
      const { data: allReviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('restaurant_id', restaurantId)

      const newNote =
        allReviews?.length > 0
          ? parseFloat((allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length).toFixed(1))
          : 0

      await supabase.from('restaurants').update({ note: newNote }).eq('restaurant_id', restaurantId)

      clearCache()
      await fetchRestaurants(true)
      return { success: true }
    } catch (err) {
      console.error('[Reviews] deleteReview error:', err)
      return { success: false, error: err.message }
    }
  }

  const incrementVisits = async (restaurantId) => {
    try {
      const { data } = await supabase
        .from('restaurants')
        .select('visites')
        .eq('restaurant_id', restaurantId)
        .single()

      if (data) {
        await supabase
          .from('restaurants')
          .update({ visites: (data.visites || 0) + 1 })
          .eq('restaurant_id', restaurantId)
      }
    } catch (err) {
      console.error('[Stats] incrementVisits error:', err)
    }
  }

  return {
    restaurants,
    loading,
    error,
    menuItems,
    menuLoading,
    fetchRestaurants,
    getRestaurantById,
    addRestaurant,
    updateRestaurant,
    deleteRestaurant,
    deleteAllRestaurantPhotos,
    fetchMenu,
    fetchMenuItems: fetchMenu,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleFavorite,
    isFavorite,
    getUserFavorites,
    getReviews,
    deleteReview,
    incrementVisits,
  }
}

function defaultHoraire() {
  return {
    lundi: '08:00-20:00',
    mardi: '08:00-20:00',
    mercredi: '08:00-20:00',
    jeudi: '08:00-20:00',
    vendredi: '08:00-20:00',
    samedi: '09:00-22:00',
    dimanche: '09:00-22:00',
  }
}
