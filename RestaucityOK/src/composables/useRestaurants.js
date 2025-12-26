"use client"

import { ref, computed } from "vue"
import { supabase } from "../config/supabaseConfig.js"
import { useSupabaseStorage } from "./useSupabaseStorage.js"
import { useStatistics } from "./useStatistics.js"
import { useAuth } from "./useAuth.js"

export function useRestaurants() {
  const restaurants = ref([])
  const loading = ref(false)
  const error = ref(null)

  const menuItems = ref([])
  const menuLoading = ref(false)

  const { uploadRestaurantImages, uploadMenuImages } = useSupabaseStorage()
  const { getRestaurantStats } = useStatistics()
  const { user } = useAuth()

  const stats = computed(() => {
    const totalRestaurants = restaurants.value.length
    const totalReviews = restaurants.value.reduce((sum, r) => {
      const avis = r.avis || []
      return sum + (Array.isArray(avis) ? avis.length : 0)
    }, 0)
    const avgRating =
      restaurants.value.length > 0
        ? (restaurants.value.reduce((sum, r) => sum + (r.note || 0), 0) / restaurants.value.length).toFixed(1)
        : 0

    return {
      totalRestaurants,
      totalReviews,
      avgRating,
    }
  })

  const fetchRestaurants = async () => {
    loading.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await supabase
        .from("restaurants")
        .select("*")
        .order("nom", { ascending: true })

      if (fetchError) throw fetchError

      const restaurantsWithStats = await Promise.all(
        data.map(async (r) => {
          const stats = await getRestaurantStats(r.restaurant_id)

          // Count reviews for this restaurant
          const { count, error: countError } = await supabase
            .from("reviews")
            .select("*", { count: "exact", head: true })
            .eq("restaurant_id", r.restaurant_id)

          return {
            ...r,
            id: r.restaurant_id,
            stats,
            avis: { length: count || 0 }, // Add review count to match old structure
            reviewCount: count || 0, // Also add as reviewCount for clarity
          }
        }),
      )

      restaurants.value = restaurantsWithStats
      console.log("[v0] Restaurants loaded from Supabase:", restaurants.value.length)
    } catch (err) {
      error.value = err.message
      console.error("[v0] Error fetching restaurants:", err)
    } finally {
      loading.value = false
    }
  }

  const getRestaurantById = async (id) => {
    try {
      console.log("[v0] Getting restaurant by ID:", id)

      const existing = restaurants.value.find((r) => r.id === id || r.restaurant_id === id)
      if (existing) {
        console.log("[v0] Restaurant found in cache:", existing)
        return existing
      }

      const { data, error: fetchError } = await supabase
        .from("restaurants")
        .select("*")
        .eq("restaurant_id", id)
        .single()

      if (fetchError) {
        console.error("[v0] Error fetching restaurant from Supabase:", fetchError)
        throw fetchError
      }

      console.log("[v0] Restaurant fetched from Supabase:", data)
      return { ...data, id: data.restaurant_id }
    } catch (err) {
      console.error("[v0] Error fetching restaurant:", err)
      return null
    }
  }

  const addRestaurant = async (restaurantData, imageFiles = []) => {
    loading.value = true
    error.value = null
    try {
      console.log("[v0] Adding restaurant:", restaurantData.nom)
      console.log("[v0] Image files:", imageFiles.length)

      const restaurantId = `resto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      let photoUrls = []
      if (imageFiles && imageFiles.length > 0) {
        try {
          console.log("[v0] Uploading images to Supabase Storage...")
          const uploadResult = await uploadRestaurantImages(imageFiles, restaurantData.nom)
          if (uploadResult.success && uploadResult.urls) {
            photoUrls = uploadResult.urls
          } else if (Array.isArray(uploadResult)) {
            photoUrls = uploadResult
          }
          console.log("[v0] Images uploaded successfully, URLs:", photoUrls)
        } catch (uploadErr) {
          console.error("[v0] Image upload failed:", uploadErr)
          console.error("[v0] Error details:", uploadErr.message)
          error.value =
            "Les images n'ont pas pu être uploadées. Vérifiez que le bucket 'restaurants' existe et est configuré avec les bonnes permissions."
        }
      }

      const newRestaurant = {
        restaurant_id: restaurantId,
        nom: restaurantData.nom,
        type: restaurantData.type || "",
        adresse: restaurantData.adresse || "",
        description: restaurantData.description || "",
        numero: restaurantData.numero || "",
        prix: restaurantData.prix || "",
        note: restaurantData.note || 0,
        photos: photoUrls,
        favorites: 0,
        visites: 0,
        avis: [],
        horaire: restaurantData.horaire || {
          lundi: "08:00-20:00",
          mardi: "08:00-20:00",
          mercredi: "08:00-20:00",
          jeudi: "08:00-20:00",
          vendredi: "08:00-20:00",
          samedi: "09:00-22:00",
          dimanche: "09:00-22:00",
        },
      }

      console.log("[v0] Creating restaurant in Supabase:", newRestaurant)
      const { data, error: insertError } = await supabase.from("restaurants").insert([newRestaurant]).select()

      if (insertError) {
        console.error("[v0] Supabase insert error:", insertError)
        throw insertError
      }

      const addedRestaurant = { id: data[0].restaurant_id, ...data[0] }
      restaurants.value.push(addedRestaurant)

      console.log("[v0] Restaurant added successfully:", restaurantId)
      console.log("[v0] Restaurant data:", addedRestaurant)
      return { success: true, id: restaurantId }
    } catch (err) {
      error.value = err.message
      console.error("[v0] Error adding restaurant:", err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const updateRestaurant = async (id, restaurantData, imageFiles = []) => {
    loading.value = true
    error.value = null
    try {
      let photoUrls = restaurantData.photos || []

      if (imageFiles && imageFiles.length > 0) {
        try {
          console.log("[v0] Uploading new images to Supabase Storage...")
          const uploadResult = await uploadRestaurantImages(imageFiles, restaurantData.nom)
          let newPhotoUrls = []
          if (uploadResult.success && uploadResult.urls) {
            newPhotoUrls = uploadResult.urls
          } else if (Array.isArray(uploadResult)) {
            newPhotoUrls = uploadResult
          }
          photoUrls = [...photoUrls, ...newPhotoUrls]
          console.log("[v0] New images uploaded, total URLs:", photoUrls)
        } catch (uploadErr) {
          console.error("[v0] Image upload failed:", uploadErr)
          error.value = "Les images n'ont pas pu être uploadées, les autres modifications ont été enregistrées."
        }
      }

      const updatedData = {
        nom: restaurantData.nom,
        type: restaurantData.type || "",
        adresse: restaurantData.adresse || "",
        description: restaurantData.description || "",
        numero: restaurantData.numero || "",
        prix: restaurantData.prix || "",
        note: restaurantData.note || 0,
        photos: photoUrls,
        horaire: restaurantData.horaire || {},
      }

      const { error: updateError } = await supabase.from("restaurants").update(updatedData).eq("restaurant_id", id)

      if (updateError) throw updateError

      const index = restaurants.value.findIndex((r) => r.id === id)
      if (index !== -1) {
        restaurants.value[index] = {
          ...restaurants.value[index],
          ...updatedData,
        }
      }

      console.log("[v0] Restaurant updated successfully:", id)
      return { success: true }
    } catch (err) {
      error.value = err.message
      console.error("[v0] Error updating restaurant:", err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const deleteRestaurant = async (id) => {
    loading.value = true
    error.value = null
    try {
      const { error: deleteError } = await supabase.from("restaurants").delete().eq("restaurant_id", id)

      if (deleteError) throw deleteError

      restaurants.value = restaurants.value.filter((r) => r.id !== id && r.restaurant_id !== id)
      console.log("[v0] Restaurant deleted successfully:", id)
      return { success: true }
    } catch (err) {
      error.value = err.message
      console.error("[v0] Error deleting restaurant:", err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const fetchMenu = async (restaurantId) => {
    menuLoading.value = true
    try {
      console.log("[v0] Fetching menu for restaurant:", restaurantId)
      const { data, error: fetchError } = await supabase
        .from("menu")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("categorie", { ascending: true })

      if (fetchError) throw fetchError

      menuItems.value = data || []
      console.log("[v0] Menu items loaded:", menuItems.value.length)
      return data || []
    } catch (err) {
      console.error("[v0] Error fetching menu:", err)
      return []
    } finally {
      menuLoading.value = false
    }
  }

  const fetchMenuItems = fetchMenu

  const addMenuItem = async (restaurantId, menuData, imageFiles = []) => {
    try {
      console.log("[v0] Adding menu item for restaurant:", restaurantId)
      console.log("[v0] Menu data:", menuData)

      let restaurantName = "restaurant"
      const restaurant = restaurants.value.find((r) => r.id === restaurantId || r.restaurant_id === restaurantId)
      if (restaurant) {
        restaurantName = restaurant.nom
        console.log("[v0] Found restaurant name:", restaurantName)
      } else {
        // Fetch from database if not in cache
        const { data } = await supabase.from("restaurants").select("nom").eq("restaurant_id", restaurantId).single()
        if (data) {
          restaurantName = data.nom
          console.log("[v0] Fetched restaurant name from DB:", restaurantName)
        }
      }

      let imageUrl = null
      if (imageFiles && imageFiles.length > 0) {
        const dishName = menuData.nom || `dish_${Date.now()}`
        const uploadResult = await uploadMenuImages(imageFiles, restaurantName, dishName)
        console.log("[v0] Upload result:", uploadResult)
        if (uploadResult.success && uploadResult.urls && uploadResult.urls.length > 0) {
          imageUrl = uploadResult.urls[0]
        } else if (Array.isArray(uploadResult) && uploadResult.length > 0) {
          imageUrl = uploadResult[0]
        }
        console.log("[v0] Menu image uploaded:", imageUrl)
      }

      const newMenuItem = {
        restaurant_id: restaurantId,
        nom: menuData.nom || "",
        description: menuData.description || "",
        prix: Number.parseFloat(menuData.prix) || 0,
        categorie: menuData.categorie || "Plats",
        image: imageUrl || (typeof menuData.image === "string" ? menuData.image : null),
      }

      console.log("[v0] Inserting menu item:", newMenuItem)
      const { data, error: insertError } = await supabase.from("menu").insert([newMenuItem]).select()

      if (insertError) {
        console.error("[v0] Error inserting menu item:", insertError)
        throw insertError
      }

      menuItems.value.push(data[0])
      console.log("[v0] Menu item added successfully:", data[0])
      return { success: true, data: data[0] }
    } catch (err) {
      console.error("[v0] Error adding menu item:", err)
      return { success: false, error: err.message }
    }
  }

  const updateMenuItem = async (restaurantId, menuItemId, menuData, imageFiles = []) => {
    try {
      let restaurantName = "restaurant"
      const restaurant = restaurants.value.find((r) => r.id === restaurantId || r.restaurant_id === restaurantId)
      if (restaurant) {
        restaurantName = restaurant.nom
      } else {
        const { data } = await supabase.from("restaurants").select("nom").eq("restaurant_id", restaurantId).single()
        if (data) {
          restaurantName = data.nom
        }
      }

      let imageUrl = menuData.image
      if (Array.isArray(imageUrl) && imageUrl.length > 0) {
        imageUrl = imageUrl[0]
      }

      if (imageFiles && imageFiles.length > 0) {
        const dishName = menuData.nom || `dish_${Date.now()}`
        const uploadResult = await uploadMenuImages(imageFiles, restaurantName, dishName)
        if (uploadResult.success && uploadResult.urls && uploadResult.urls.length > 0) {
          imageUrl = uploadResult.urls[0]
        } else if (Array.isArray(uploadResult) && uploadResult.length > 0) {
          imageUrl = uploadResult[0]
        }
      }

      const updatedData = {
        nom: menuData.nom || "",
        description: menuData.description || "",
        prix: Number.parseFloat(menuData.prix) || 0,
        categorie: menuData.categorie || "Plats",
        image: typeof imageUrl === "string" ? imageUrl : null,
      }

      const { error: updateError } = await supabase.from("menu").update(updatedData).eq("id", menuItemId)

      if (updateError) throw updateError

      const index = menuItems.value.findIndex((m) => m.id === menuItemId)
      if (index !== -1) {
        menuItems.value[index] = { ...menuItems.value[index], ...updatedData }
      }

      console.log("[v0] Menu item updated successfully")
      return { success: true }
    } catch (err) {
      console.error("[v0] Error updating menu item:", err)
      return { success: false, error: err.message }
    }
  }

  const deleteMenuItem = async (restaurantId, menuItemId) => {
    try {
      console.log("[v0] Deleting menu item:", menuItemId, "from restaurant:", restaurantId)

      const { data: menuItem, error: fetchError } = await supabase
        .from("menu")
        .select("*")
        .eq("id", menuItemId)
        .single()

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("[v0] Error fetching menu item for deletion:", fetchError)
      }

      const { error: deleteError } = await supabase.from("menu").delete().eq("id", menuItemId)

      if (deleteError) {
        console.error("[v0] Error deleting menu item:", deleteError)
        throw deleteError
      }

      if (menuItem && menuItem.image) {
        try {
          const imageUrl = menuItem.image
          // Extract path from URL (after /storage/v1/object/public/restaurants/)
          const urlParts = imageUrl.split("/storage/v1/object/public/restaurants/")
          if (urlParts.length > 1) {
            const imagePath = urlParts[1]
            console.log("[v0] Attempting to delete image from storage:", imagePath)
            const { error: storageError } = await supabase.storage.from("restaurants").remove([imagePath])

            if (storageError) {
              console.warn("[v0] Could not delete image from storage:", storageError)
            } else {
              console.log("[v0] Image deleted from storage successfully")
            }
          }
        } catch (storageErr) {
          console.warn("[v0] Error deleting image from storage:", storageErr)
          // Don't throw - menu item was deleted successfully
        }
      }

      menuItems.value = menuItems.value.filter((m) => m.id !== menuItemId)
      console.log("[v0] Menu item deleted successfully")
      return { success: true }
    } catch (err) {
      console.error("[v0] Error deleting menu item:", err)
      return { success: false, error: err.message }
    }
  }

  const toggleFavorite = async (restaurantId) => {
    try {
      if (!user.value) {
        console.warn("[v0] User not logged in, cannot toggle favorite")
        return { success: false, error: "User not logged in" }
      }

      const userId = user.value.id
      console.log("[v0] Toggling favorite for restaurant:", restaurantId, "user:", userId)

      const { data: existing, error: checkError } = await supabase
        .from("favorites")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .eq("user_id", userId)
        .single()

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError
      }

      if (existing) {
        const { error: deleteError } = await supabase
          .from("favorites")
          .delete()
          .eq("restaurant_id", restaurantId)
          .eq("user_id", userId)

        if (deleteError) throw deleteError
        console.log("[v0] Favorite removed")
        return { success: true, isFavorite: false }
      } else {
        const { error: insertError } = await supabase
          .from("favorites")
          .insert([{ restaurant_id: restaurantId, user_id: userId }])

        if (insertError) throw insertError
        console.log("[v0] Favorite added")
        return { success: true, isFavorite: true }
      }
    } catch (err) {
      console.error("[v0] Error toggling favorite:", err)
      return { success: false, error: err.message }
    }
  }

  const isFavorite = async (restaurantId) => {
    try {
      if (!user.value) {
        return false
      }

      const userId = user.value.id

      const { data, error: checkError } = await supabase
        .from("favorites")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .eq("user_id", userId)
        .single()

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError
      }

      return !!data
    } catch (err) {
      console.error("[v0] Error checking favorite:", err)
      return false
    }
  }

  const getUserFavorites = async () => {
    try {
      if (!user.value) {
        console.warn("[v0] User not logged in, cannot get favorites")
        return []
      }

      const userId = user.value.id

      const { data, error: fetchError } = await supabase.from("favorites").select("restaurant_id").eq("user_id", userId)

      if (fetchError) throw fetchError

      const restaurantIds = data.map((f) => f.restaurant_id)

      if (restaurantIds.length === 0) {
        return []
      }

      const { data: restaurantsData, error: restaurantsError } = await supabase
        .from("restaurants")
        .select("*")
        .in("restaurant_id", restaurantIds)

      if (restaurantsError) throw restaurantsError

      return restaurantsData.map((r) => ({ ...r, id: r.restaurant_id }))
    } catch (err) {
      console.error("[v0] Error getting user favorites:", err)
      return []
    }
  }

  const incrementVisits = async (restaurantId) => {
    try {
      const { error: updateError } = await supabase.rpc("increment_visits", {
        restaurant_id_param: restaurantId,
      })

      if (updateError) {
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
        }
      }

      console.log("[v0] Visit incremented for restaurant:", restaurantId)
    } catch (err) {
      console.error("[v0] Error incrementing visits:", err)
    }
  }

  const getReviews = async (restaurantId) => {
    try {
      console.log("[v0] Fetching reviews for restaurant_id:", restaurantId)
      const { data, error: fetchError } = await supabase
        .from("reviews")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("created_at", { ascending: false })

      if (fetchError) {
        console.error("[v0] Supabase error fetching reviews:", fetchError)
        throw fetchError
      }

      console.log("[v0] Reviews fetched from Supabase:", data?.length || 0, data)
      return data || []
    } catch (err) {
      console.error("[v0] Error fetching reviews:", err)
      return []
    }
  }

  const deleteReview = async (reviewId, restaurantId) => {
    try {
      // Delete the review
      const { error: deleteError } = await supabase.from("reviews").delete().eq("id", reviewId)

      if (deleteError) throw deleteError

      // Recalculate average rating after deletion
      const { data: allReviews, error: fetchError } = await supabase
        .from("reviews")
        .select("rating")
        .eq("restaurant_id", restaurantId)

      if (!fetchError) {
        let newAverage = 0
        if (allReviews && allReviews.length > 0) {
          const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0)
          newAverage = Number.parseFloat((totalRating / allReviews.length).toFixed(1))
        }

        // Update restaurant's note field with new average (or 0 if no reviews left)
        const { error: updateError } = await supabase
          .from("restaurants")
          .update({ note: newAverage })
          .eq("restaurant_id", restaurantId)

        if (updateError) {
          console.error("[v0] Error updating restaurant rating after deletion:", updateError)
        }
      }

      await fetchRestaurants() // Reload restaurant list after rating update

      return { success: true }
    } catch (err) {
      console.error("[v0] Error deleting review:", err)
      return { success: false, error: err.message }
    }
  }

  return {
    restaurants,
    menuItems,
    fetchRestaurants,
    getRestaurantById,
    addRestaurant,
    updateRestaurant,
    deleteRestaurant,
    fetchMenu,
    fetchMenuItems: fetchMenu,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleFavorite,
    isFavorite,
    getUserFavorites,
    incrementVisits,
    getReviews,
    deleteReview,
  }
}
