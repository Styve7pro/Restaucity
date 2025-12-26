import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("[v0] Missing Supabase environment variables for Storage.")
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  },
})

export function useSupabaseStorage() {
  const BUCKET_NAME = "restaurants"

  /**
   * Upload a single image to Supabase Storage
   * @param {File} file - The image file to upload
   * @param {string} path - The storage path (e.g., "restaurants/RestaurantName/menu/DishName/image.jpg")
   * @returns {Promise<string>} - The public URL of the uploaded image
   */
  const uploadImage = async (file, path) => {
    try {
      console.log("[v0] Starting upload to Supabase Storage")
      console.log("[v0] File:", file.name, "Size:", file.size, "Type:", file.type)
      console.log("[v0] Path:", path)
      console.log("[v0] Bucket:", BUCKET_NAME)

      console.log("[v0] Uploading file...")
      const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(path, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type,
      })

      if (error) {
        console.error("[v0] Supabase upload error:", error)
        console.error("[v0] Error details:", JSON.stringify(error, null, 2))
        if (error.message.includes("new row violates row-level security policy")) {
          throw new Error(
            `Storage RLS policy error. Please configure Storage policies in Supabase Dashboard:\n` +
              `1. Go to Storage > Policies\n` +
              `2. Create policies for bucket 'restaurants' to allow INSERT, SELECT, UPDATE, DELETE\n` +
              `Error: ${error.message}`,
          )
        }
        throw new Error(`Failed to upload image: ${error.message}`)
      }

      console.log("[v0] Upload successful, data:", data)

      const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path)

      if (!publicUrlData || !publicUrlData.publicUrl) {
        console.error("[v0] Failed to get public URL")
        throw new Error("Failed to get public URL for uploaded image")
      }

      console.log("[v0] Image uploaded successfully!")
      console.log("[v0] Public URL:", publicUrlData.publicUrl)
      return publicUrlData.publicUrl
    } catch (error) {
      console.error("[v0] Upload error:", error)
      throw error
    }
  }

  /**
   * Upload multiple images to Supabase Storage
   * @param {File[]} files - Array of image files
   * @param {string} basePath - Base path for the images
   * @returns {Promise<string[]>} - Array of public URLs
   */
  const uploadMultipleImages = async (files, basePath) => {
    try {
      const uploadPromises = files.map((file, index) => {
        const extension = file.name.split(".").pop()
        const fileName = `image_${index + 1}.${extension}`
        const fullPath = `${basePath}/${fileName}`
        return uploadImage(file, fullPath)
      })
      const urls = await Promise.all(uploadPromises)
      return urls
    } catch (error) {
      console.error("[v0] Multiple images upload error:", error)
      throw error
    }
  }

  /**
   * Upload restaurant images to Supabase Storage
   * @param {File[]} files - Array of image files
   * @param {string} restaurantName - Name of the restaurant
   * @returns {Promise<string[]>} - Array of public URLs
   */
  const uploadRestaurantImages = async (files, restaurantName) => {
    const sanitizedName = restaurantName
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_-]/g, "")
      .toLowerCase()

    console.log("[v0] Sanitized restaurant name:", sanitizedName)
    const basePath = `restaurants/${sanitizedName}`
    return uploadMultipleImages(files, basePath)
  }

  /**
   * Upload menu item images to Supabase Storage
   * @param {File[]} files - Array of image files
   * @param {string} restaurantName - Name of the restaurant
   * @param {string} dishName - Name of the dish
   * @returns {Promise<string[]>} - Array of public URLs
   */
  const uploadMenuImages = async (files, restaurantName, dishName) => {
    const sanitizedRestaurantName = restaurantName
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_-]/g, "")
      .toLowerCase()

    const sanitizedDishName = dishName
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_-]/g, "")
      .toLowerCase()

    console.log("[v0] Sanitized names - Restaurant:", sanitizedRestaurantName, "Dish:", sanitizedDishName)
    const basePath = `restaurants/${sanitizedRestaurantName}/menu/${sanitizedDishName}`
    return uploadMultipleImages(files, basePath)
  }

  /**
   * Delete an image from Supabase Storage
   * @param {string} path - The storage path of the image to delete
   * @returns {Promise<boolean>} - Success status
   */
  const deleteImage = async (path) => {
    try {
      const { error } = await supabase.storage.from(BUCKET_NAME).remove([path])

      if (error) {
        console.error("[v0] Supabase delete error:", error)
        throw new Error(`Failed to delete image: ${error.message}`)
      }

      console.log("[v0] Image deleted successfully:", path)
      return true
    } catch (error) {
      console.error("[v0] Supabase delete error:", error)
      return false
    }
  }

  return {
    uploadImage,
    uploadMultipleImages,
    uploadRestaurantImages,
    uploadMenuImages,
    deleteImage,
  }
}
