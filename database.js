// database.js - Supabase Data Persistence
import { supabase } from './supabase.js';

// Profiles
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function updateProfile(userId, profileData) {
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...profileData });
  if (error) throw error;
}

// Cats
export async function getCats(userId) {
  const { data, error } = await supabase
    .from('cats')
    .select('*')
    .eq('owner_id', userId)
    .eq('alive', true);
  if (error) throw error;
  return data;
}

export async function saveCat(catData) {
  const { error } = await supabase
    .from('cats')
    .upsert(catData);
  if (error) throw error;
}

export async function deleteCat(catId) {
  const { error } = await supabase
    .from('cats')
    .delete()
    .eq('id', catId);
  if (error) throw error;
}

// Inventory
export async function getInventory(userId) {
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .eq('owner_id', userId);
  if (error) throw error;
  return data;
}

export async function updateInventoryItem(userId, itemId, quantity) {
  if (quantity <= 0) {
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('owner_id', userId)
      .eq('item_id', itemId);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('inventory')
      .upsert({ owner_id: userId, item_id: itemId, quantity });
    if (error) throw error;
  }
}

// Marketplace
export async function getMarketplaceListings() {
  const { data, error } = await supabase
    .from('marketplace')
    .select('*, profiles(username)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}
