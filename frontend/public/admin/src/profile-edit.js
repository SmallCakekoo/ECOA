// Funciones compartidas para edición de perfil en admin

// Función para actualizar la visualización del perfil
function updateProfileDisplay(user) {
  const userNameEl = document.getElementById("userName");
  const userEmailEl = document.getElementById("userEmail");
  const avatar = document.getElementById("profileAvatar");
  const dropdownAvatar = document.querySelector(".dropdown-avatar");
  
  if (userNameEl) userNameEl.textContent = user.name || "Administrador";
  if (userEmailEl) userEmailEl.textContent = user.email || "admin@ecoa.org";
  
  // Actualizar avatares
  const avatarUrl = user.image || 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=200&auto=format&fit=crop';
  if (avatar) {
    avatar.style.backgroundImage = `url(${avatarUrl})`;
  }
  if (dropdownAvatar) {
    dropdownAvatar.style.backgroundImage = `url(${avatarUrl})`;
  }
}

// Función para abrir el modal de edición de perfil
function openEditProfileModal() {
  const modal = document.getElementById("editProfileModal");
  const user = window.AdminAPI.getCurrentUser();
  
  if (!modal || !user) return;
  
  // Cargar datos actuales
  const nameInput = document.getElementById("profileName");
  const photoPreview = document.getElementById("profilePhotoPreview");
  const photoInput = document.getElementById("profilePhotoInput");
  
  if (nameInput) {
    nameInput.value = user.name || "";
  }
  
  if (photoPreview) {
    const avatarUrl = user.image || 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=200&auto=format&fit=crop';
    photoPreview.src = avatarUrl;
    photoPreview.style.display = user.image ? "block" : "none";
  }
  
  if (photoInput) {
    photoInput.value = "";
  }
  
  modal.style.display = "flex";
}

// Función para cerrar el modal de edición de perfil
function closeEditProfileModal() {
  const modal = document.getElementById("editProfileModal");
  if (modal) {
    modal.style.display = "none";
  }
}

// Configurar eventos del modal de edición de perfil
function setupEditProfileModal() {
  const modal = document.getElementById("editProfileModal");
  const closeBtn = document.getElementById("closeEditProfileModal");
  const cancelBtn = document.getElementById("cancelEditProfile");
  const form = document.getElementById("editProfileForm");
  const photoInput = document.getElementById("profilePhotoInput");
  const photoPreview = document.getElementById("profilePhotoPreview");
  
  // Cerrar modal
  if (closeBtn) {
    closeBtn.addEventListener("click", closeEditProfileModal);
  }
  
  if (cancelBtn) {
    cancelBtn.addEventListener("click", closeEditProfileModal);
  }
  
  // Cerrar al hacer clic fuera del modal
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeEditProfileModal();
      }
    });
  }
  
  // Manejar subida de foto
  if (photoInput) {
    photoInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        // Convertir a base64
        const reader = new FileReader();
        reader.onload = (event) => {
          if (photoPreview) {
            photoPreview.src = event.target.result;
            photoPreview.style.display = "block";
          }
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error("Error al cargar imagen:", error);
        alert("Error al cargar la imagen. Por favor, intenta de nuevo.");
      }
    });
  }
  
  // Manejar envío del formulario
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const user = window.AdminAPI.getCurrentUser();
      if (!user || !user.id) {
        alert("Error: No se pudo identificar al usuario.");
        return;
      }
      
      const nameInput = document.getElementById("profileName");
      const name = nameInput ? nameInput.value.trim() : "";
      
      if (!name) {
        alert("El nombre es requerido.");
        return;
      }
      
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Guardando...";
      }
      
      try {
        // Obtener imagen (base64 o URL)
        let imageUrl = null;
        if (photoPreview && photoPreview.style.display !== "none") {
          if (photoPreview.src.startsWith("data:")) {
            imageUrl = photoPreview.src;
          } else if (photoPreview.src && !photoPreview.src.includes("unsplash.com")) {
            imageUrl = photoPreview.src;
          }
        }
        
        // Actualizar usuario
        const updateData = {
          name: name
        };
        
        if (imageUrl) {
          updateData.image = imageUrl;
        }
        
        const response = await window.AdminAPI.updateUser(user.id, updateData);
        
        if (response.success) {
          // Actualizar usuario en localStorage
          const updatedUser = { ...user, ...response.data };
          localStorage.setItem("admin_user", JSON.stringify(updatedUser));
          
          // Actualizar visualización
          updateProfileDisplay(updatedUser);
          
          // Cerrar modal
          closeEditProfileModal();
          
          alert("Perfil actualizado exitosamente.");
        } else {
          throw new Error(response.message || "Error al actualizar el perfil");
        }
      } catch (error) {
        console.error("Error al actualizar perfil:", error);
        alert(`Error al actualizar el perfil: ${error.message}`);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Guardar Cambios";
        }
      }
    });
  }
}

// Exportar funciones globalmente
if (typeof window !== 'undefined') {
  window.updateProfileDisplay = updateProfileDisplay;
  window.openEditProfileModal = openEditProfileModal;
  window.closeEditProfileModal = closeEditProfileModal;
  window.setupEditProfileModal = setupEditProfileModal;
}

