// src/composables/useSupabaseStorage.js
import { supabase } from '../config/supabaseConfig.js'

const BUCKET_NAME = 'restaurants'

const sanitizeName = (name) =>
  name.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase()

export function useSupabaseStorage() {
  const uploadImage = async (file, path) => {
    console.log('[Storage] Uploading:', file.name, '→', path)

    const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(path, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type,
    })

    if (error) {
      console.error('[Storage] Upload error:', error)
      throw new Error(`Échec upload: ${error.message}`)
    }

    const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path)
    if (!urlData?.publicUrl) throw new Error('Impossible de récupérer l\'URL publique')

    return urlData.publicUrl
  }

  const uploadMultipleImages = async (files, basePath) => {
    const results = await Promise.allSettled(
      files.map((file, index) => {
        const ext = file.name.split('.').pop()
        const path = `${basePath}/image_${Date.now()}_${index}.${ext}`
        return uploadImage(file, path)
      })
    )

    const urls = []
    const errors = []
    results.forEach((r) => {
      if (r.status === 'fulfilled') urls.push(r.value)
      else errors.push(r.reason?.message)
    })

    if (errors.length) console.warn('[Storage] Some uploads failed:', errors)
    return { success: urls.length > 0, urls, errors }
  }

  const uploadRestaurantImages = async (files, restaurantName) => {
    const basePath = `restaurants/${sanitizeName(restaurantName)}`
    return uploadMultipleImages(files, basePath)
  }

  const uploadMenuImages = async (files, restaurantName, dishName) => {
    const basePath = `restaurants/${sanitizeName(restaurantName)}/menu/${sanitizeName(dishName)}`
    return uploadMultipleImages(files, basePath)
  }

  const deleteImage = async (url) => {
    try {
      const parts = url.split(`/storage/v1/object/public/${BUCKET_NAME}/`)
      if (parts.length < 2) return false

      const { error } = await supabase.storage.from(BUCKET_NAME).remove([parts[1]])
      if (error) throw error
      return true
    } catch (err) {
      console.error('[Storage] Delete error:', err)
      return false
    }
  }

  return { uploadImage, uploadMultipleImages, uploadRestaurantImages, uploadMenuImages, deleteImage }
}
