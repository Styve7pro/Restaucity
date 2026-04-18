// src/composables/useSupabaseStorage.js
// ─────────────────────────────────────────────────────────────────────────────
//
//  DIAGNOSTIC — POURQUOI DES IMAGES MANQUENT
//  ──────────────────────────────────────────
//
//  Problème 1 — Pagination silencieuse de list()
//  Supabase Storage list() ne retourne que 100 fichiers par défaut.
//  Si un restaurant a plus de 100 images (ou si le dossier racine
//  contient beaucoup de sous-dossiers), les fichiers au-delà sont ignorés.
//  → Solution : paginer avec limit + offset jusqu'à épuisement.
//
//  Problème 2 — URL non-canonique / timestamp dans le nom de fichier
//  Les URLs sont buildées avec `image_${Date.now()}_${index}.ext`.
//  Si deux uploads surviennent dans la même milliseconde (Promise.allSettled),
//  les fichiers s'écrasent (upsert:true) ou produisent des conflits de chemin.
//  → Solution : UUID dans le nom de fichier, séquence stricte si besoin.
//
//  Problème 3 — Pas de vérification d'existence avant getPublicUrl
//  getPublicUrl() ne fait pas d'appel réseau — elle génère l'URL statiquement.
//  Si le fichier n'existe pas en storage, l'URL est "valide" mais retourne 404.
//  → Solution : listStorageImages() pour reconstruire les URLs depuis storage.
//
//  Problème 4 — Cache CDN
//  Après upsert (même chemin), le CDN Supabase peut servir l'ancienne version.
//  → Solution : bustCache param `?t=<timestamp>` sur l'URL si upsert.
//
// ─────────────────────────────────────────────────────────────────────────────

import { supabase } from '../config/supabaseConfig.js'

const BUCKET = 'restaurants'
const PAGE_SIZE = 100  // max de Supabase Storage par appel

// Sanitize un nom pour l'utiliser comme chemin storage
const sanitize = (name) =>
  name.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase()

// Génère un nom de fichier unique (UUID-like, sans timestamp collision)
const uniqueFilename = (file, index = 0) => {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const rand = Math.random().toString(36).slice(2, 10)
  const ts   = Date.now().toString(36)
  return `img_${ts}_${rand}_${index}.${ext}`
}

export function useSupabaseStorage() {

  // ── Upload d'une seule image ───────────────────────────────────────────
  const uploadImage = async (file, path, { upsert = false } = {}) => {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, {
        cacheControl: '3600',
        upsert,
        contentType: file.type,
      })

    if (error) {
      console.error('[Storage] Upload error:', path, error.message)
      throw new Error(`Échec upload "${file.name}": ${error.message}`)
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path)
    if (!urlData?.publicUrl) throw new Error('URL publique introuvable')
    return urlData.publicUrl
  }

  // ── Upload multiple — noms uniques, erreurs partielles tolérées ──────────
  const uploadMultipleImages = async (files, basePath) => {
    if (!files?.length) return { success: false, urls: [], errors: ['Aucun fichier'] }

    // Upload séquentiel pour éviter les collisions de timestamp
    const urls   = []
    const errors = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const path = `${basePath}/${uniqueFilename(file, i)}`
      try {
        const url = await uploadImage(file, path)
        urls.push(url)
      } catch (err) {
        errors.push(`${file.name}: ${err.message}`)
        console.warn('[Storage] Partial upload failure:', err.message)
      }
    }

    if (errors.length) console.warn('[Storage] Errors during upload:', errors)
    return { success: urls.length > 0, urls, errors }
  }

  // ── Upload images d'un restaurant ────────────────────────────────────────
  const uploadRestaurantImages = (files, restaurantName) =>
    uploadMultipleImages(files, `restaurants/${sanitize(restaurantName)}`)

  // ── Upload images d'un plat ──────────────────────────────────────────────
  const uploadMenuImages = (files, restaurantName, dishName) =>
    uploadMultipleImages(
      files,
      `restaurants/${sanitize(restaurantName)}/menu/${sanitize(dishName)}`
    )

  // ── FIX PRINCIPAL : lister TOUTES les images d'un dossier (pagination) ──
  /**
   * Retourne les URLs publiques de TOUS les fichiers dans `folder`,
   * en paginant automatiquement pour contourner la limite de 100.
   *
   * @param {string} folder  - ex: "restaurants/le_roi_burger"
   * @param {boolean} recursive - si true, descend dans les sous-dossiers
   * @returns {Promise<string[]>} - tableau d'URLs publiques
   */
  const listStorageImages = async (folder, { recursive = false } = {}) => {
    const allUrls = []
    let offset    = 0
    let hasMore   = true

    while (hasMore) {
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .list(folder, {
          limit:  PAGE_SIZE,
          offset,
          sortBy: { column: 'created_at', order: 'asc' },
        })

      if (error) {
        console.error('[Storage] list() error:', folder, error.message)
        break
      }

      if (!data || data.length === 0) {
        hasMore = false
        break
      }

      for (const item of data) {
        if (item.id === null) {
          // C'est un sous-dossier (metadata.id = null pour les dossiers)
          if (recursive) {
            const subUrls = await listStorageImages(`${folder}/${item.name}`, { recursive: true })
            allUrls.push(...subUrls)
          }
        } else {
          // C'est un fichier — construire l'URL publique
          const { data: urlData } = supabase.storage
            .from(BUCKET)
            .getPublicUrl(`${folder}/${item.name}`)
          if (urlData?.publicUrl) allUrls.push(urlData.publicUrl)
        }
      }

      // S'il y a moins de PAGE_SIZE résultats, on a tout
      if (data.length < PAGE_SIZE) {
        hasMore = false
      } else {
        offset += PAGE_SIZE
      }
    }

    return allUrls
  }

  /**
   * Récupère TOUTES les images d'un restaurant depuis le storage
   * et les fusionne avec celles stockées dans la DB (photos[]).
   * Retourne un tableau dédupliqué.
   *
   * @param {string} restaurantName  - nom du restaurant
   * @param {string[]} dbPhotos      - URLs déjà en base
   */
  const getAllRestaurantImages = async (restaurantName, dbPhotos = []) => {
    const folder = `restaurants/${sanitize(restaurantName)}`

    // Récupère les images depuis storage (listing complet paginé)
    const storageUrls = await listStorageImages(folder)

    // Fusionner + dédupliquer par URL normalisée (sans query string)
    const normalize = (url) => url.split('?')[0].toLowerCase()
    const seen      = new Set()
    const merged    = []

    for (const url of [...storageUrls, ...dbPhotos]) {
      const key = normalize(url)
      if (!seen.has(key)) {
        seen.add(key)
        merged.push(url)
      }
    }

    return merged
  }

  // ── Suppression ──────────────────────────────────────────────────────────
  const deleteImage = async (url) => {
    try {
      // Extraire le chemin depuis l'URL publique
      const marker = `/storage/v1/object/public/${BUCKET}/`
      const idx    = url.indexOf(marker)
      if (idx === -1) {
        console.warn('[Storage] Impossible d\'extraire le chemin depuis:', url)
        return false
      }
      // Retirer les query params éventuels
      const path = url.slice(idx + marker.length).split('?')[0]
      const { error } = await supabase.storage.from(BUCKET).remove([path])
      if (error) throw error
      return true
    } catch (err) {
      console.error('[Storage] Delete error:', err.message)
      return false
    }
  }

  // ── Suppression d'un dossier entier (restaurant supprimé) ────────────────
  const deleteRestaurantFolder = async (restaurantName) => {
    const folder = `restaurants/${sanitize(restaurantName)}`
    const urls   = await listStorageImages(folder, { recursive: true })
    if (!urls.length) return

    // Extraire les chemins
    const marker = `/storage/v1/object/public/${BUCKET}/`
    const paths  = urls
      .map(url => url.slice(url.indexOf(marker) + marker.length).split('?')[0])
      .filter(Boolean)

    if (paths.length) {
      const { error } = await supabase.storage.from(BUCKET).remove(paths)
      if (error) console.warn('[Storage] Partial folder delete error:', error.message)
    }
  }

  return {
    uploadImage,
    uploadMultipleImages,
    uploadRestaurantImages,
    uploadMenuImages,
    listStorageImages,
    getAllRestaurantImages,
    deleteImage,
    deleteRestaurantFolder,
  }
}
