import { defineConfig } from "vite";
import path from "path";
import { readdirSync, statSync, existsSync } from "fs";

const { resolve } = path;

// Función para encontrar todos los index.html recursivamente
function getAllHtmlFiles(dir, baseDir = "", entries = {}) {
  if (!existsSync(dir)) return entries;

  const files = readdirSync(dir);

  files.forEach((file) => {
    const fullPath = resolve(dir, file);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      // Recursivamente buscar en subdirectorios
      getAllHtmlFiles(fullPath, `${baseDir}${file}/`, entries);
    } else if (file === "index.html") {
      // Crear nombre de entrada basado en la ruta
      const entryName = baseDir
        ? baseDir.replace(/\//g, "-").slice(0, -1)
        : "root";
      entries[entryName] = fullPath;
    }
  });

  return entries;
}

export default defineConfig({
  root: resolve(__dirname, "public"),

  server: {
    port: 5000,
    open: "/client/screens/Home/index.html", // abre Home como página principal
  },

  build: {
    outDir: resolve(__dirname, "../dist"),
    emptyOutDir: true,

    rollupOptions: {
      input: {
        // CLIENT - Screens principales
        "client-adopt": resolve(
          __dirname,
          "public/client/screens/Adopt/index.html"
        ),
        "client-adoptdetail": resolve(
          __dirname,
          "public/client/screens/AdoptDetail/index.html"
        ),
        "client-garden": resolve(
          __dirname,
          "public/client/screens/Garden/index.html"
        ),
        "client-home": resolve(
          __dirname,
          "public/client/screens/Home/index.html"
        ),
        "client-login": resolve(
          __dirname,
          "public/client/screens/Login/index.html"
        ),
        "client-profile": resolve(
          __dirname,
          "public/client/screens/Profile/index.html"
        ),
        "client-shop": resolve(
          __dirname,
          "public/client/screens/Shop/index.html"
        ),
        "client-singup": resolve(
          __dirname,
          "public/client/screens/SingUp/index.html"
        ),
        "client-virtualpet": resolve(
          __dirname,
          "public/client/screens/VirtualPet/index.html"
        ),

        // CLIENT - Feedback screens (error/success dentro de AdoptFeedback)
        "client-adoptfeedback-error": resolve(
          __dirname,
          "public/client/screens/AdoptFeedback/error/index.html"
        ),
        "client-adoptfeedback-success": resolve(
          __dirname,
          "public/client/screens/AdoptFeedback/success/index.html"
        ),

        // CLIENT - Shop Feedback screens
        "client-shopfeedback-error": resolve(
          __dirname,
          "public/client/screens/ShopFeedback/error/index.html"
        ),
        "client-shopfeedback-success": resolve(
          __dirname,
          "public/client/screens/ShopFeedback/success/index.html"
        ),

        // ADMIN - Screens
        "admin-dashboard": resolve(
          __dirname,
          "public/admin/screens/dashboard/index.html"
        ),
        "admin-donationlog": resolve(
          __dirname,
          "public/admin/screens/donationlog/index.html"
        ),
        "admin-login": resolve(
          __dirname,
          "public/admin/screens/login/index.html"
        ),
        "admin-plantcatalog": resolve(
          __dirname,
          "public/admin/screens/PlantCatalog/index.html"
        ),
      },
    },
  },

  resolve: {
    alias: {
      "@": resolve(__dirname, "public"),
      "@client": resolve(__dirname, "public/client"),
      "@admin": resolve(__dirname, "public/admin"),
      "@screens": resolve(__dirname, "public/client/screens"),
    },
  },
});
