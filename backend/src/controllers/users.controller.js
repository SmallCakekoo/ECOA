import {
  findAllUsers,
  findUserById,
  findUserByEmail,
  insertUser,
  updateUser,
  deleteUser,
  findPlantsByUserId,
} from "../db/users.db.js";
import { createUserModel, sanitizeUserUpdate } from "../models/users.model.js";

const handleError = (error, res) => {
  const status = error?.status || 500;
  const message = error?.message || "Error interno del servidor";

  // Forzar headers CORS en errores
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Accept, Origin"
  );

  return res.status(status).json({ success: false, message });
};

export const UsersController = {
  list: async (req, res) => {
    try {
      // Forzar headers CORS
      res.header("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      res.header(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-Requested-With, Accept, Origin"
      );

      const { data, error } = await findAllUsers();
      if (error) throw error;
      return res.status(200).json({ success: true, data, count: data.length });
    } catch (error) {
      return handleError(error, res);
    }
  },
  get: async (req, res) => {
    try {
      const { id } = req.params;
      const { data, error } = await findUserById(id);
      if (error) throw error;
      if (!data)
        return res
          .status(404)
          .json({ success: false, message: "Usuario no encontrado" });
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return handleError(error, res);
    }
  },
  create: async (req, res) => {
    try {
      const userData = createUserModel(req.body);
      const { data, error } = await insertUser(userData);
      if (error) throw error;
      req.io?.emit("user_created", {
        type: "user_created",
        data,
        timestamp: new Date().toISOString(),
      });
      return res
        .status(201)
        .json({ success: true, message: "Usuario creado exitosamente", data });
    } catch (error) {
      return handleError(error, res);
    }
  },
  update: async (req, res) => {
    try {
      const { id } = req.params;
      
      console.log("=".repeat(50));
      console.log("📝 INICIO ACTUALIZACIÓN USUARIO");
      console.log("📝 ID del usuario:", id);
      console.log("📝 Body recibido:", JSON.stringify(req.body, null, 2));
      
      const updateData = sanitizeUserUpdate(req.body);
      
      console.log("📝 Datos después de sanitización:", JSON.stringify(updateData, null, 2));
      
      // Verificar que hay datos para actualizar
      if (Object.keys(updateData).length === 0) {
        console.warn("⚠️ No hay datos válidos para actualizar");
        return res.status(400).json({
          success: false,
          message: "No hay datos válidos para actualizar. Se requiere al menos el campo 'name'.",
        });
      }
      
      // Verificar que el ID es válido
      if (!id || typeof id !== 'string' || id.length === 0) {
        console.error("❌ ID de usuario inválido:", id);
        return res.status(400).json({
          success: false,
          message: "ID de usuario inválido",
        });
      }
      
      console.log("📝 Llamando a updateUser con:", JSON.stringify(updateData, null, 2));
      
      // Actualizar directamente
      const { data, error } = await updateUser(id, updateData);
      
      if (error) {
        console.error("❌ ERROR DE SUPABASE:");
        console.error("   Código:", error.code);
        console.error("   Mensaje:", error.message);
        console.error("   Detalles:", error.details);
        console.error("   Hint:", error.hint);
        console.error("   Error completo:", JSON.stringify(error, null, 2));
        console.log("=".repeat(50));
        throw error;
      }
      
      if (!data) {
        console.warn("⚠️ No se encontró usuario con ID:", id);
        return res
          .status(404)
          .json({ success: false, message: "Usuario no encontrado" });
      }
      
      console.log("✅ Usuario actualizado exitosamente");
      console.log("✅ Datos devueltos:", JSON.stringify(data, null, 2));
      console.log("=".repeat(50));
      
      req.io?.emit("user_updated", {
        type: "user_updated",
        data,
        timestamp: new Date().toISOString(),
      });
      
      return res.status(200).json({
        success: true,
        message: "Usuario actualizado exitosamente",
        data,
      });
    } catch (error) {
      console.error("=".repeat(50));
      console.error("❌ ERROR GENERAL EN UPDATE:");
      console.error("   Tipo:", error.constructor.name);
      console.error("   Mensaje:", error.message);
      console.error("   Stack:", error.stack);
      console.error("=".repeat(50));
      return handleError(error, res);
    }
  },
  signup: async (req, res) => {
    try {
      // Forzar headers CORS
      res.header("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      res.header(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-Requested-With, Accept, Origin"
      );

      const { email, name } = req.body;
      // password se ignora ya que no se guarda en la BD (autenticación simulada)

      if (!email || !name) {
        return res.status(400).json({
          success: false,
          message: "Email and name are required",
        });
      }

      // Verificar si el usuario ya existe
      const { data: existingUser } = await findUserByEmail(email);

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email already registered",
        });
      }

      // Crear nuevo usuario (sin password - autenticación simulada)
      const userData = createUserModel({
        name,
        email,
        rol: "user", // rol por defecto
      });

      const { data: newUser, error } = await insertUser(userData);

      if (error) throw error;

      return res.status(201).json({
        success: true,
        message: "Account created successfully",
        data: {
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            rol: newUser.rol,
            registration_date: newUser.registration_date,
          },
        },
      });
    } catch (error) {
      return handleError(error, res);
    }
  },
  login: async (req, res) => {
    try {
      // Forzar headers CORS
      res.header("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      res.header(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-Requested-With, Accept, Origin"
      );

      const { email } = req.body;
      // password se ignora ya que la autenticación es simulada

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }

      // Buscar usuario por email (autenticación simulada - solo verifica que existe)
      const { data: user, error } = await findUserByEmail(email);

      if (error && error.code !== "PGRST116") {
        // PGRST116 es "no rows returned"
        throw error;
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found. Please sign up first.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            rol: user.rol || "user",
            registration_date: user.registration_date,
          },
        },
      });
    } catch (error) {
      return handleError(error, res);
    }
  },
  remove: async (req, res) => {
    try {
      const { id } = req.params;
      const { data, error } = await deleteUser(id);
      if (error) throw error;
      if (!data)
        return res
          .status(404)
          .json({ success: false, message: "Usuario no encontrado" });
      req.io?.emit("user_deleted", {
        type: "user_deleted",
        data: { id },
        timestamp: new Date().toISOString(),
      });
      return res
        .status(200)
        .json({ success: true, message: "Usuario eliminado exitosamente" });
    } catch (error) {
      return handleError(error, res);
    }
  },
  listPlants: async (req, res) => {
    try {
      const { id } = req.params;
      const { data, error } = await findPlantsByUserId(id);
      if (error) throw error;
      return res.status(200).json({ success: true, data, count: data.length });
    } catch (error) {
      return handleError(error, res);
    }
  },
};

export default UsersController;
