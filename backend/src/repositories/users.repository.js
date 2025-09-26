import { supabase } from "../services/supabase.service.js";

export async function findAllUsers() {
  return await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });
}

export async function findUserById(userId) {
  return await supabase.from("users").select("*").eq("id", userId).single();
}

export async function insertUser(userData) {
  return await supabase.from("users").insert([userData]).select().single();
}

export async function updateUser(userId, updateData) {
  return await supabase
    .from("users")
    .update(updateData)
    .eq("id", userId)
    .select()
    .single();
}

export async function deleteUser(userId) {
  return await supabase
    .from("users")
    .delete()
    .eq("id", userId)
    .select()
    .single();
}

export async function findPlantsByUserId(userId) {
  return await supabase
    .from("plants")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
}
