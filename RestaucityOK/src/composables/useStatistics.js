import { ref } from "vue"
import { supabase } from "../config/supabaseConfig.js"

export function useStatistics() {
  const loading = ref(false)
  const error = ref(null)

  const trackVisit = async (restaurantId) => {
    try {
      const { data: restaurant } = await supabase
        .from("restaurants")
        .select("visites")
        .eq("restaurant_id", restaurantId)
        .single()

      if (restaurant) {
        await supabase
          .from("restaurants")
          .update({ visites: (restaurant.visites || 0) + 1 })
          .eq("restaurant_id", restaurantId)

        console.log("[v0] Visit tracked for restaurant:", restaurantId)
      }
    } catch (err) {
      console.error("[v0] Error tracking visit:", err)
    }
  }

  const trackFavorite = async (restaurantId, userId, action = "add") => {
    try {
      const { data: restaurant } = await supabase
        .from("restaurants")
        .select("favorites")
        .eq("restaurant_id", restaurantId)
        .single()

      if (restaurant) {
        const incrementValue = action === "add" ? 1 : -1
        await supabase
          .from("restaurants")
          .update({ favorites: Math.max(0, (restaurant.favorites || 0) + incrementValue) })
          .eq("restaurant_id", restaurantId)

        console.log("[v0] Favorite tracked:", action, restaurantId)
      }
    } catch (err) {
      console.error("[v0] Error tracking favorite:", err)
    }
  }

  const getRestaurantStats = async (restaurantId) => {
    try {
      // Get visits from restaurants table
      const { data: restaurant } = await supabase
        .from("restaurants")
        .select("visites")
        .eq("restaurant_id", restaurantId)
        .single()

      // Count favorites from favorites table
      const { count: favoritesCount, error: favError } = await supabase
        .from("favorites")
        .select("*", { count: "exact", head: true })
        .eq("restaurant_id", restaurantId)

      if (favError) {
        console.error("[v0] Error counting favorites:", favError)
      }

      return {
        visites: restaurant?.visites || 0,
        favoris: favoritesCount || 0,
      }
    } catch (err) {
      console.error("[v0] Error getting restaurant stats:", err)
      return { visites: 0, favoris: 0 }
    }
  }

  const getGlobalStats = async () => {
    try {
      const { data: restaurants, error: restaurantsError } = await supabase.from("restaurants").select("visites, avis")

      if (restaurantsError) throw restaurantsError

      let totalVisites = 0
      let totalReviews = 0

      restaurants.forEach((r) => {
        totalVisites += r.visites || 0
        const avis = r.avis || []
        totalReviews += Array.isArray(avis) ? avis.length : 0
      })

      // Count total favorites from favorites table
      const { count: totalFavoris, error: favError } = await supabase
        .from("favorites")
        .select("*", { count: "exact", head: true })

      if (favError) {
        console.error("[v0] Error counting total favorites:", favError)
      }

      // Count unique users with favorites
      const { data: uniqueUsers, error: usersError } = await supabase.from("favorites").select("user_id")

      let usersWithFavorites = 0
      if (!usersError && uniqueUsers) {
        const uniqueUserIds = new Set(uniqueUsers.map((f) => f.user_id))
        usersWithFavorites = uniqueUserIds.size
      }

      return {
        totalRestaurants: restaurants.length,
        totalVisites,
        totalFavoris: totalFavoris || 0,
        totalReviews,
        usersWithFavorites,
      }
    } catch (err) {
      console.error("[v0] Error getting global stats:", err)
      return {
        totalRestaurants: 0,
        totalVisites: 0,
        totalFavoris: 0,
        totalReviews: 0,
        usersWithFavorites: 0,
      }
    }
  }

  return {
    loading,
    error,
    trackVisit,
    trackFavorite,
    getRestaurantStats,
    getGlobalStats,
  }
}
