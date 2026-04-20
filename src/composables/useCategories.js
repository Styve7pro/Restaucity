// src/composables/useCategories.js
// ─────────────────────────────────────────────────────────────────────────────
//  Gestion des catégories dynamiques (restaurants + menus).
//  Stockées dans Supabase, table `categories` :
//    id          uuid  (généré auto)
//    nom         text  UNIQUE NOT NULL
//    type        text  CHECK (type IN ('restaurant','menu','both'))
//    created_at  timestamptz
//
//  SQL de migration (à exécuter dans Supabase Dashboard → SQL Editor) :
//  ──────────────────────────────────────────────────────────────────────
//  CREATE TABLE IF NOT EXISTS public.categories (
//    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
//    nom        text NOT NULL,
//    type       text NOT NULL DEFAULT 'both'
//                CHECK (type IN ('restaurant','menu','both')),
//    created_at timestamptz NOT NULL DEFAULT now(),
//    CONSTRAINT categories_nom_type_unique UNIQUE (nom, type)
//  );
//  ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
//  CREATE POLICY "Public read" ON public.categories FOR SELECT USING (true);
//  CREATE POLICY "Admin write" ON public.categories FOR ALL
//    USING (auth.role() = 'authenticated');
// ─────────────────────────────────────────────────────────────────────────────

import { ref, computed } from 'vue'
import { supabase } from '../config/supabaseConfig.js'

// Valeurs par défaut (utilisées si la table est vide ou inaccessible)
const DEFAULT_CUISINE = [
  'Pâtisserie','Fastfood','Cuisine Africaine','Cuisine Française',
  'Cuisine Italienne','Cuisine Asiatique','Pizzeria','Burger',
  'Café','Bar','Restaurant Gastronomique',
]
const DEFAULT_MENU = [
  'Hamburger','Pizza','Salade','Sandwich','Viande','Volailles',
  'Poissons','Pates','Dessert','Gâteau','Milkshakes','Smoothies',
  'BubbleTea','Crepes','Cocktails','Cafe','Boisson',
  'Entrée','Plat principal','Accompagnements','Plats locaux','Omelletes',
]

// ── State singleton ────────────────────────────────────────────────────────
const allCategories = ref([])   // toutes les catégories depuis Supabase
const loaded        = ref(false)

export function useCategories() {

  // ── Listes filtrées ────────────────────────────────────────────────────
  const restaurantCategories = computed(() => {
    const fromDb = allCategories.value
      .filter(c => c.type === 'restaurant' || c.type === 'both')
      .map(c => c.nom)
    // Fusionner avec les défauts, dédoublonner, trier
    return [...new Set([...fromDb, ...DEFAULT_CUISINE])].sort()
  })

  const menuCategories = computed(() => {
    const fromDb = allCategories.value
      .filter(c => c.type === 'menu' || c.type === 'both')
      .map(c => c.nom)
    return [...new Set([...fromDb, ...DEFAULT_MENU])].sort()
  })

  // ── Fetch depuis Supabase ──────────────────────────────────────────────
  const fetchCategories = async () => {
    if (loaded.value) return
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, nom, type')
        .order('nom', { ascending: true })
      if (error) throw error
      allCategories.value = data || []
      loaded.value = true
    } catch (err) {
      // Table inexistante ou non accessible → on retombe sur les défauts
      console.warn('[Categories] Table non disponible, utilisation des valeurs par défaut:', err.message)
      loaded.value = true
    }
  }

  // ── Ajouter une catégorie ──────────────────────────────────────────────
  const addCategory = async (nom, type = 'both') => {
    const trimmed = nom.trim()
    if (!trimmed) return { success: false, error: 'Le nom ne peut pas être vide.' }

    // Vérification doublon côté frontend (insensible à la casse)
    const listToCheck = type === 'restaurant'
      ? restaurantCategories.value
      : type === 'menu'
        ? menuCategories.value
        : [...restaurantCategories.value, ...menuCategories.value]

    if (listToCheck.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      return { success: false, error: `La catégorie "${trimmed}" existe déjà.` }
    }

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ nom: trimmed, type }])
        .select()
        .single()

      if (error) {
        // Code 23505 = contrainte UNIQUE violée (doublon DB)
        if (error.code === '23505') {
          return { success: false, error: `La catégorie "${trimmed}" existe déjà.` }
        }
        throw error
      }

      // Mise à jour locale immédiate (sans refetch)
      allCategories.value.push(data)
      return { success: true, category: data }
    } catch (err) {
      console.error('[Categories] addCategory error:', err)
      return { success: false, error: err.message }
    }
  }

  // ── Supprimer une catégorie ────────────────────────────────────────────
  const deleteCategory = async (id) => {
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) throw error
      allCategories.value = allCategories.value.filter(c => c.id !== id)
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  return {
    allCategories,
    restaurantCategories,
    menuCategories,
    loaded,
    fetchCategories,
    addCategory,
    deleteCategory,
  }
}
