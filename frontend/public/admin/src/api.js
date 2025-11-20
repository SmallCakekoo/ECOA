// Servicio de API para el panel de administración
class AdminAPI {
  constructor() {
    const baseURL =
      window.AdminConfig?.API_BASE_URL || "https://ecoabackendecoa.vercel.app";
    // Asegurar que baseURL no termine con /
    this.baseURL = baseURL.endsWith("/") ? baseURL.slice(0, -1) : baseURL;
    this.token = localStorage.getItem(
      window.AdminConfig?.AUTH?.TOKEN_KEY || "admin_token"
    );
  }

  // Método genérico para hacer peticiones
  async request(endpoint, options = {}) {
    // Asegurar que endpoint comience con /
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = `${this.baseURL}${cleanEndpoint}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      // Verificar si la respuesta es JSON válido
      let data = {};
      const contentType = response.headers.get("content-type");
      
      try {
        if (contentType && contentType.includes("application/json")) {
          const text = await response.text();
          if (text) {
            data = JSON.parse(text);
          } else {
            data = { message: "Respuesta vacía del servidor" };
          }
        } else {
          const text = await response.text();
          data = { 
            message: text || `Error ${response.status}: ${response.statusText}`,
            rawResponse: text
          };
        }
      } catch (parseError) {
        console.error("Error parseando respuesta JSON:", parseError);
        const text = await response.text().catch(() => "");
        data = { 
          message: `Error ${response.status}: ${response.statusText}`,
          rawResponse: text,
          parseError: parseError.message
        };
      }

      if (!response.ok) {
        // Crear error con más información
        const error = new Error(
          data.message || `Error ${response.status}: ${response.statusText}`
        );
        error.response = data; // Incluir la respuesta completa (aunque esté vacía)
        error.status = response.status;
        error.statusText = response.statusText;
        throw error;
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      console.error("Error details:", {
        message: error.message,
        status: error.status,
        response: error.response,
        stack: error.stack
      });

      // Si el error no tiene response, crear uno básico
      if (!error.response) {
        error.response = {
          message: error.message || "Error desconocido",
          success: false
        };
      }

      // Manejar errores de CORS específicamente
      if (
        error.name === "TypeError" &&
        error.message.includes("Failed to fetch")
      ) {
        throw new Error(
          "Error de conexión: El servidor no permite peticiones desde este origen. Verifica la configuración CORS del backend."
        );
      }

      throw error;
    }
  }

  // ===== AUTENTICACIÓN =====
  async login(email, password) {
    try {
      // Validación básica - solo email es requerido
      if (!email) {
        throw new Error("Email es requerido");
      }

      if (!email.includes("@")) {
        throw new Error("Email inválido");
      }

      // Usar el endpoint de login del backend
      const response = await this.request("/users/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (!response.success || !response.data || !response.data.user) {
        throw new Error(response.message || "Error al iniciar sesión");
      }

      const user = response.data.user;

      // Verificar que el usuario tenga rol "admin"
      if (user.rol !== "admin") {
        throw new Error(
          "Acceso denegado: Solo administradores pueden acceder a este panel"
        );
      }

      // Generar token simple para el admin
      const token = `admin-token-${Date.now()}-${user.id}`;

      this.token = token;
      localStorage.setItem("admin_token", token);
      localStorage.setItem("admin_user", JSON.stringify(user));

      return { success: true, data: user, token: token };
    } catch (error) {
      console.error("Error en login:", error);
      throw error;
    }
  }

  logout() {
    this.token = null;
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
  }

  isAuthenticated() {
    // Verificar si hay token en localStorage
    const storedToken = localStorage.getItem("admin_token");
    if (!storedToken) {
      console.log("❌ No hay token en localStorage");
      return false;
    }

    // Actualizar el token en la instancia
    this.token = storedToken;

    // Para tokens simples del servidor local, solo verificar que exista
    if (storedToken.startsWith("admin-token-")) {
      console.log("✅ Token válido encontrado:", storedToken);
      return true;
    }

    // Para tokens JWT (si los usamos en el futuro)
    try {
      const payload = JSON.parse(atob(storedToken));
      const isExpired = payload.exp > Date.now();

      if (!isExpired) {
        // Token expirado, limpiar
        this.logout();
        return false;
      }

      return true;
    } catch (error) {
      // Token inválido, limpiar
      console.log("❌ Token inválido:", error.message);
      this.logout();
      return false;
    }
  }

  getCurrentUser() {
    const user = localStorage.getItem("admin_user");
    return user ? JSON.parse(user) : null;
  }

  // ===== USUARIOS =====
  async getUsers() {
    return await this.request("/users");
  }

  async getUser(id) {
    return await this.request(`/users/${id}`);
  }

  async createUser(userData) {
    return await this.request("/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id, userData) {
    return await this.request(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id) {
    return await this.request(`/users/${id}`, {
      method: "DELETE",
    });
  }

  async getUserPlants(userId) {
    return await this.request(`/users/${userId}/plants`);
  }

  // ===== PLANTAS =====
  async getPlants(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/plants?${queryParams}` : "/plants";
    return await this.request(endpoint);
  }

  async getPlant(id) {
    return await this.request(`/plants/${id}`);
  }

  async createPlant(plantData) {
    return await this.request("/plants", {
      method: "POST",
      body: JSON.stringify(plantData),
    });
  }

  async updatePlant(id, plantData) {
    return await this.request(`/plants/${id}`, {
      method: "PUT",
      body: JSON.stringify(plantData),
    });
  }

  async updatePlantMetrics(id, metricsData) {
    return await this.request(`/plants/${id}/metrics`, {
      method: "PUT",
      body: JSON.stringify(metricsData),
    });
  }

  async deletePlant(id) {
    return await this.request(`/plants/${id}`, {
      method: "DELETE",
    });
  }

  async assignAccessory(plantId, accessoryId) {
    return await this.request(`/plants/${plantId}/accessories`, {
      method: "POST",
      body: JSON.stringify({ accessory_id: accessoryId }),
    });
  }

  // ===== DISPOSITIVOS =====
  async getDevices() {
    return await this.request("/devices");
  }

  async getDevice(id) {
    return await this.request(`/devices/${id}`);
  }

  // ===== DONACIONES =====
  async getDonations(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/donations?${queryParams}` : "/donations";
    return await this.request(endpoint);
  }

  async getDonation(id) {
    return await this.request(`/donations/${id}`);
  }

  async createDonation(donationData) {
    return await this.request("/donations", {
      method: "POST",
      body: JSON.stringify(donationData),
    });
  }

  async updateDonation(id, donationData) {
    return await this.request(`/donations/${id}`, {
      method: "PUT",
      body: JSON.stringify(donationData),
    });
  }

  async updateDonationStatus(id, status) {
    return await this.request(`/donations/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  }

  async deleteDonation(id) {
    return await this.request(`/donations/${id}`, {
      method: "DELETE",
    });
  }

  async getDonationsByUser(userId) {
    return await this.request(`/donations/user/${userId}`);
  }

  async getDonationsByPlant(plantId) {
    return await this.request(`/donations/plant/${plantId}`);
  }

  // ===== ACCESORIOS =====
  async getAccessories() {
    return await this.request("/accessories");
  }

  async getAccessory(id) {
    return await this.request(`/accessories/${id}`);
  }

  async createAccessory(accessoryData) {
    return await this.request("/accessories", {
      method: "POST",
      body: JSON.stringify(accessoryData),
    });
  }

  async updateAccessory(id, accessoryData) {
    return await this.request(`/accessories/${id}`, {
      method: "PUT",
      body: JSON.stringify(accessoryData),
    });
  }

  async deleteAccessory(id) {
    return await this.request(`/accessories/${id}`, {
      method: "DELETE",
    });
  }

  // ===== FUNDACIONES =====
  async getFoundations() {
    return await this.request("/foundations");
  }

  async getFoundation(id) {
    return await this.request(`/foundations/${id}`);
  }

  async createFoundation(foundationData) {
    return await this.request("/foundations", {
      method: "POST",
      body: JSON.stringify(foundationData),
    });
  }

  async updateFoundation(id, foundationData) {
    return await this.request(`/foundations/${id}`, {
      method: "PUT",
      body: JSON.stringify(foundationData),
    });
  }

  async deleteFoundation(id) {
    return await this.request(`/foundations/${id}`, {
      method: "DELETE",
    });
  }

  // ===== ESTADÍSTICAS =====
  async getStats() {
    try {
      const [users, plants, donations] = await Promise.all([
        this.getUsers(),
        this.getPlants(),
        this.getDonations(),
      ]);

      const adoptedPlants = plants.data.filter((p) => p.is_adopted);
      const availablePlants = plants.data.filter((p) => !p.is_adopted);

      // Contar donaciones activas (si no tienen status, considerar todas como activas)
      const activeDonations = donations.data.filter(
        (d) => !d.status || d.status === "active" || d.status === "pending"
      );

      // Calcular plantas saludables (healthy o excellent mapeado a healthy)
      const healthyPlants = plants.data.filter((p) => {
        const status = p.health_status;
        return status === "healthy" || status === "excellent";
      });

      // Calcular nuevas adopciones este mes
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const adoptedThisMonth = adoptedPlants.filter((p) => {
        if (!p.created_at && !p.updated_at) return false;
        const date = new Date(p.updated_at || p.created_at);
        return (
          date.getMonth() === currentMonth && date.getFullYear() === currentYear
        );
      }).length;

      return {
        users: {
          total: users.count || users.data?.length || 0,
          new:
            users.data?.filter((u) => {
              if (!u.created_at) return false;
              const created = new Date(u.created_at);
              const monthAgo = new Date();
              monthAgo.setMonth(monthAgo.getMonth() - 1);
              return created > monthAgo;
            }).length || 0,
        },
        plants: {
          total: plants.count || plants.data?.length || 0,
          adopted: adoptedPlants.length,
          available: availablePlants.length,
          healthy: healthyPlants.length,
          needsCare: plants.data.filter(
            (p) =>
              p.health_status === "needs_care" ||
              p.health_status === "recovering"
          ).length,
        },
        donations: {
          total: donations.count || donations.data?.length || 0,
          active: activeDonations.length,
          completed: donations.data.filter((d) => d.status === "completed")
            .length,
          totalAmount: donations.data.reduce(
            (sum, d) => sum + (Number(d.amount) || 0),
            0
          ),
        },
      };
    } catch (error) {
      console.error("Error in getStats:", error);
      // Devolver estructura vacía en caso de error
      return {
        users: { total: 0, new: 0 },
        plants: {
          total: 0,
          adopted: 0,
          available: 0,
          healthy: 0,
          needsCare: 0,
        },
        donations: { total: 0, active: 0, completed: 0, totalAmount: 0 },
      };
    }
  }

  // ===== SUBIDA DE ARCHIVOS =====
  async uploadImage(file) {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(`${this.baseURL}/api/upload/image`, {
        method: "POST",
        body: formData,
        headers: {
          ...(this.token && { Authorization: `Bearer ${this.token}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        // Retornar la URL completa de la imagen
        return data.data.fullUrl;
      } else {
        throw new Error(data.message || "Error al subir la imagen");
      }
    } catch (error) {
      console.error("Error uploading image:", error);

      // Si falla la subida, usar base64 como fallback
      console.log("Usando base64 como fallback...");
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve(e.target.result);
        };
        reader.readAsDataURL(file);
      });
    }
  }
}

// Crear instancia global
window.AdminAPI = new AdminAPI();
