import supabase from "../services/supabase.service.js";

export async function findAllUsers() {
  return await supabase.from("users").select("*");
}

export async function findUserById(id) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();
  return { data, error };
}

export async function insertUser(user) {
  return await supabase.from("users").insert([user]).select().single();
}

export async function updateUser(id, updateData) {
  return await supabase
    .from("users")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();
}

export async function deleteUser(id) {
  const { error } = await supabase.from("users").delete().eq("id", id);
  // Convención: devolver data nula si no hay error
  return { data: error ? null : { id }, error };
}

export async function findPlantsByUserId(userId) {
  return await supabase.from("plants").select("*").eq("user_id", userId);
}

export async function findUserByEmail(email) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();
  return { data, error };
}

export default {
  findAllUsers,
  findUserById,
  findUserByEmail,
  insertUser,
  updateUser,
  deleteUser,
  findPlantsByUserId,
};
// const supabaseCli = require("../services/supabase.service");

// const getAllUsers = async () => {
//   const { data, error } = await supabaseCli.from("users").select();
//   if (error) {
//     console.error(error);
//     return error;
//   }
//   return data;
// };

// const createUserInDB = async (user) => {
//   const { data, error } = await supabaseCli
//     .from("users")
//     .insert([user])
//     .select();

//   if (error) {
//     console.error(error);
//     return error;
//   }

//   return data;
// };

// const updateUserInDb = async (newData, userId) => {
//   const { data, error } = await supabaseCli
//     .from("users")
//     .update(newData)
//     .eq("id", userId)
//     .select();

//   if (error) {
//     console.error(error);
//   }

//   return data;
// };

// const deleteUserInDb = async (userId) => {
//   const { data, error } = await supabaseCli
//     .from("users")
//     .delete()
//     .eq("id", userId)
//     .select();

//   if (error) {
//     console.error(error);
//   }

//   return data;
// };

// module.exports = {
//   getAllUsers,
//   createUserInDB,
//   updateUserInDb,
//   deleteUserInDb,
// };
