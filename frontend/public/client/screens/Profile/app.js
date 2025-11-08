const USER_DATA = JSON.parse(localStorage.getItem("USER_DATA"));

// Actualizar la hora actual
function updateTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const timeElement = document.getElementById("current-time");
  if (timeElement) {
    timeElement.textContent = `${hours}:${minutes}`;
  }
}

// Actualizar la hora al cargar la página
updateTime();

// Actualizar la hora cada minuto
setInterval(updateTime, 60000);

// Cargar información del usuario desde localStorage
async function loadUserData() {
  if (!USER_DATA) {
    console.error("No user data found");
    window.location.href = "/client/screens/LogIn";
    return;
  }

  document.getElementById("userName").textContent = USER_DATA.name;
  
  // Cargar imagen de perfil si existe
  const profileImageEl = document.getElementById("profileImage");
  if (profileImageEl && USER_DATA.image) {
    if (USER_DATA.image.startsWith("data:")) {
      profileImageEl.src = USER_DATA.image;
    } else if (USER_DATA.image.startsWith("http://") || USER_DATA.image.startsWith("https://")) {
      profileImageEl.src = USER_DATA.image;
    } else {
      profileImageEl.src = `https://ecoabackendecoa.vercel.app${USER_DATA.image.startsWith("/") ? USER_DATA.image : "/" + USER_DATA.image}`;
    }
    profileImageEl.onerror = function() {
      this.src = "../../src/assets/images/Profile.png";
    };
  }

  try {
    const response = await fetch(
      `https://ecoabackendecoa.vercel.app/users/${USER_DATA.id}/plants`
    );
    const { success, count } = await response.json();
    console.log(success, count);

    if (success) document.getElementById("plantsCount").textContent = count;
  } catch (error) {
    console.error("Error loading user plants:", error);
  }
}

// Cargar datos al iniciar
window.addEventListener("DOMContentLoaded", loadUserData);

// Funciones de navegación del navbar (expuestas globalmente)
window.goToHome = function () {
  console.log("Navegando a Home");
  window.location.href = "/client/screens/Home";
};

window.goToPlants = function () {
  console.log("Navegando a Virtual Pet");
  window.location.href = "/client/screens/VirtualPet";
};

window.goToGlobe = function () {
  console.log("Navegando a Globe/Community");
  // Implementar cuando exista la página
  alert("Globe feature coming soon!");
};

window.goToProfile = function () {
  console.log("Ya estás en Profile");
  // Ya estamos aquí, no hacer nada
};

// Funciones de ajustes (expuestas globalmente)
window.goToChangePassword = function () {
  console.log("Navegando a Change Password");
  // Aquí iría la navegación a la página de cambio de contraseña
  alert("Change Password feature - Create this page next!");
};

// Funciones para el modal de editar perfil
window.openEditProfileModal = function () {
  const modal = document.getElementById("editProfileModal");
  const nameInput = document.getElementById("profileNameInput");
  const photoImg = document.getElementById("profilePhotoImg");
  
  if (modal && USER_DATA) {
    // Cargar datos actuales
    if (nameInput) {
      nameInput.value = USER_DATA.name || "";
    }
    
    // Cargar imagen actual si existe
    if (photoImg && USER_DATA.image) {
      if (USER_DATA.image.startsWith("data:")) {
        photoImg.src = USER_DATA.image;
      } else if (USER_DATA.image.startsWith("http://") || USER_DATA.image.startsWith("https://")) {
        photoImg.src = USER_DATA.image;
      } else {
        photoImg.src = `https://ecoabackendecoa.vercel.app${USER_DATA.image.startsWith("/") ? USER_DATA.image : "/" + USER_DATA.image}`;
      }
    }
    
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
    
    // Configurar subida de imagen
    setupProfilePhotoUpload();
  }
};

window.closeEditProfileModal = function () {
  const modal = document.getElementById("editProfileModal");
  if (modal) {
    modal.classList.remove("show");
    document.body.style.overflow = "";
    // Limpiar formulario
    const form = document.getElementById("editProfileForm");
    if (form) form.reset();
    const photoImg = document.getElementById("profilePhotoImg");
    if (photoImg && USER_DATA) {
      // Restaurar imagen original
      if (USER_DATA.image && USER_DATA.image.startsWith("data:")) {
        photoImg.src = USER_DATA.image;
      } else {
        photoImg.src = "../../src/assets/images/Profile.png";
      }
    }
  }
};

// Función para comprimir imagen de perfil
function compressProfileImage(file, callback) {
  const maxDataUrlSize = 150 * 1024; // 150KB
  const reader = new FileReader();
  
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      let width = img.width;
      let height = img.height;
      const maxDimension = 400; // Máximo 400px para foto de perfil
      
      if (width > height && width > maxDimension) {
        height = (height * maxDimension) / width;
        width = maxDimension;
      } else if (height > maxDimension) {
        width = (width * maxDimension) / height;
        height = maxDimension;
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      
      let quality = 0.9;
      let dataUrl = canvas.toDataURL('image/jpeg', quality);
      
      while (dataUrl.length > maxDataUrlSize && quality > 0.1) {
        quality -= 0.1;
        dataUrl = canvas.toDataURL('image/jpeg', quality);
      }
      
      if (dataUrl.length > maxDataUrlSize) {
        console.warn("Imagen muy grande después de comprimir");
        callback(null);
      } else {
        callback(dataUrl);
      }
    };
    img.onerror = () => callback(null);
    img.src = e.target.result;
  };
  reader.onerror = () => callback(null);
  reader.readAsDataURL(file);
}

// Configurar subida de foto de perfil
function setupProfilePhotoUpload() {
  const photoInput = document.getElementById("profilePhotoInput");
  const photoPreview = document.getElementById("profilePhotoPreview");
  const photoImg = document.getElementById("profilePhotoImg");
  
  if (!photoInput || !photoPreview || !photoImg) return;
  
  // Remover listeners anteriores
  const newInput = photoInput.cloneNode(true);
  photoInput.parentNode.replaceChild(newInput, photoInput);
  
  const currentInput = document.getElementById("profilePhotoInput");
  
  // Click en el preview para abrir selector
  photoPreview.addEventListener("click", () => {
    currentInput.click();
  });
  
  // Cambio de archivo
  currentInput.addEventListener("change", async () => {
    const file = currentInput.files && currentInput.files[0];
    if (!file) return;
    
    compressProfileImage(file, (dataUrl) => {
      if (dataUrl) {
        photoImg.src = dataUrl;
        photoImg.setAttribute("data-new-image", dataUrl);
        console.log("✅ Foto de perfil comprimida:", Math.round(dataUrl.length / 1024), "KB");
      } else {
        alert("La imagen es demasiado grande. Por favor selecciona una imagen más pequeña.");
      }
    });
  });
}

// Configurar formulario de edición
document.addEventListener("DOMContentLoaded", function() {
  const editForm = document.getElementById("editProfileForm");
  if (editForm) {
    editForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      await updateUserProfile();
    });
  }
  
  // Cerrar modal al hacer click fuera
  const modal = document.getElementById("editProfileModal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target.classList.contains("edit-profile-overlay")) {
        closeEditProfileModal();
      }
    });
  }
  
  // Cerrar modal con ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const modal = document.getElementById("editProfileModal");
      if (modal && modal.classList.contains("show")) {
        closeEditProfileModal();
      }
    }
  });
});

// Función para actualizar perfil
async function updateUserProfile() {
  if (!USER_DATA || !USER_DATA.id) {
    alert("Error: No se encontraron datos de usuario");
    return;
  }
  
  const nameInput = document.getElementById("profileNameInput");
  const photoImg = document.getElementById("profilePhotoImg");
  
  if (!nameInput) return;
  
  const newName = nameInput.value.trim();
  if (!newName) {
    alert("El nombre es requerido");
    return;
  }
  
  const updateData = {
    name: newName
  };
  
  // Agregar imagen si hay una nueva
  const newImage = photoImg?.getAttribute("data-new-image");
  if (newImage) {
    updateData.image = newImage;
  }
  
  try {
    const response = await fetch(`https://ecoabackendecoa.vercel.app/users/${USER_DATA.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
      // Actualizar USER_DATA en localStorage
      USER_DATA.name = result.data.name || newName;
      if (result.data.image) {
        USER_DATA.image = result.data.image;
      }
      localStorage.setItem("USER_DATA", JSON.stringify(USER_DATA));
      
      // Actualizar UI
      const userNameEl = document.getElementById("userName");
      const profileImageEl = document.getElementById("profileImage");
      
      if (userNameEl) {
        userNameEl.textContent = USER_DATA.name;
      }
      
      if (profileImageEl && USER_DATA.image) {
        if (USER_DATA.image.startsWith("data:")) {
          profileImageEl.src = USER_DATA.image;
        } else if (USER_DATA.image.startsWith("http://") || USER_DATA.image.startsWith("https://")) {
          profileImageEl.src = USER_DATA.image;
        } else {
          profileImageEl.src = `https://ecoabackendecoa.vercel.app${USER_DATA.image.startsWith("/") ? USER_DATA.image : "/" + USER_DATA.image}`;
        }
      }
      
      alert("Perfil actualizado exitosamente!");
      closeEditProfileModal();
    } else {
      throw new Error(result.message || "Error al actualizar el perfil");
    }
  } catch (error) {
    console.error("Error actualizando perfil:", error);
    alert("Error al actualizar el perfil: " + error.message);
  }
}

window.goToNotifications = function () {
  console.log("Navegando a Notifications");
  // Aquí iría la navegación a la página de notificaciones
  alert("Notifications settings - Create this page next!");
};

window.goToPrivacy = function () {
  console.log("Navegando a Privacy & Security");
  // Aquí iría la navegación a la página de privacidad
  alert("Privacy & Security settings - Create this page next!");
};

window.goToAbout = function () {
  console.log("Navegando a About");
  // Aquí iría la navegación a la página de acerca de
  alert("About ECOA - Version 1.0.0");
};

// Función para cerrar sesión (expuesta globalmente)
window.handleLogout = function () {
  // Confirmar antes de cerrar sesión
  const confirmLogout = confirm("Are you sure you want to log out?");

  if (confirmLogout) {
    console.log("Cerrando sesión...");

    // Limpiar datos de sesión del localStorage
    localStorage.removeItem("userToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("isLoggedIn");

    localStorage.removeItem("USER_DATA");

    // Opcional: Mantener algunos datos si quieres que persistan
    // localStorage.removeItem('userName');
    // localStorage.removeItem('userImage');

    // Mostrar mensaje
    alert("You have been logged out successfully");

    // Redirigir a la página de inicio de sesión
    window.location.href = "/client/screens/LogIn";
  }
};
