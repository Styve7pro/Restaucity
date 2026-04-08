// src/composables/useStatistics.js
import { ref } from 'vue'
import { supabase } from '../config/supabaseConfig.js'

export function useStatistics() {
  const loading = ref(false)
  const error = ref(null)

  const trackVisit = async (restaurantId) => {
    try {
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('visites')
        .eq('restaurant_id', restaurantId)
        .single()

      if (restaurant) {
        await supabase
          .from('restaurants')
          .update({ visites: (restaurant.visites || 0) + 1 })
          .eq('restaurant_id', restaurantId)
      }
    } catch (err) {
      console.error('[Stats] trackVisit error:', err)
    }
  }

  const getRestaurantStats = async (restaurantId) => {
    try {
      const [restaurantRes, favoritesRes] = await Promise.all([
        supabase
          .from('restaurants')
          .select('visites')
          .eq('restaurant_id', restaurantId)
          .single(),
        supabase
          .from('favorites')
          .select('*', { count: 'exact', head: true })
          .eq('restaurant_id', restaurantId),
      ])

      return {
        visites: restaurantRes.data?.visites || 0,
        favoris: favoritesRes.count || 0,
      }
    } catch (err) {
      console.error('[Stats] getRestaurantStats error:', err)
      return { visites: 0, favoris: 0 }
    }
  }

  const getGlobalStats = async () => {
    try {
      const [restaurantsRes, favoritesRes, uniqueUsersRes, reviewsRes] = await Promise.all([
        supabase.from('restaurants').select('visites'),
        supabase.from('favorites').select('restaurant_id', { count: 'exact' }),
        supabase.from('favorites').select('user_id'),
        supabase.from('reviews').select('restaurant_id', { count: 'exact' }),
      ])

      const totalVisites = (restaurantsRes.data || []).reduce(
        (sum, r) => sum + (r.visites || 0), 0
      )

      const uniqueUserIds = new Set(
        (uniqueUsersRes.data || []).map((f) => f.user_id)
      )

      return {
        totalRestaurants: restaurantsRes.data?.length || 0,
        totalVisites,
        totalFavoris: favoritesRes.data?.length || 0,
        totalReviews: reviewsRes.data?.length || 0,
        usersWithFavorites: uniqueUserIds.size,
      }
    } catch (err) {
      console.error('[Stats] getGlobalStats error:', err)
      return {
        totalRestaurants: 0,
        totalVisites: 0,
        totalFavoris: 0,
        totalReviews: 0,
        usersWithFavorites: 0,
      }
    }
  }

  return { loading, error, trackVisit, getRestaurantStats, getGlobalStats }
}
