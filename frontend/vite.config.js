import { defineConfig } from "vite";
import path from "path";
import { readdirSync, statSync, existsSync } from "fs";

const { resolve } = path;

// Función para encontrar todos los index.html recursivamente
function getAllHtmlFiles(dir, baseDir = "", entries = {}) {
  if (!existsSync(dir)) return entries;
  
  try {
    const files = readdirSync(dir);

    files.forEach((file) => {
      const fullPath = resolve(dir, file);
      
      try {
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
          // Recursivamente buscar en subdirectorios
          getAllHtmlFiles(fullPath, `${baseDir}${file}/`, entries);
        } else if (file === "index.html") {
          // Crear nombre de entrada basado en la ruta
          const entryName = baseDir ? baseDir.replace(/\//g, "-").slice(0, -1) : "root";
          entries[entryName] = fullPath;
          console.log(`✓ Found: ${entryName} -> ${fullPath}`);
        }
      } catch (err) {
        console.warn(`⚠ Skipping ${fullPath}: ${err.message}`);
      }
    });
  } catch (err) {
    console.warn(`⚠ Cannot read directory ${dir}: ${err.message}`);
  }

  return entries;
}

// Buscar todos los archivos HTML automáticamente
const rootDir = resolve(__dirname);
const publicDir = resolve(__dirname, "public");
const clientDir = resolve(publicDir, "client/screens");
const adminDir = resolve(publicDir, "admin/screens");

console.log("\n🔍 Scanning for HTML files...\n");

const allEntries = {
  ...getAllHtmlFiles(clientDir, "client-"),
  ...getAllHtmlFiles(adminDir, "admin-"),
};

console.log(`\n✅ Found ${Object.keys(allEntries).length} entry points\n`);

export default defineConfig({
  root: rootDir,  // ← Cambio importante: root en la raíz del proyecto
  publicDir: publicDir,  // ← Especificar dónde están los assets
  
  server: {
    port: 5000,
    open: "/public/client/screens/Home/index.html",
  },

  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: allEntries,
      output: {
        // Aplanar la estructura - todos los HTML en la raíz
        entryFileNames: '[name].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
  },

  resolve: {
    alias: {
      "@": publicDir,
      "@client": resolve(publicDir, "client"),
      "@admin": resolve(publicDir, "admin"),
      "@screens": resolve(publicDir, "client/screens"),
    },
  },
});