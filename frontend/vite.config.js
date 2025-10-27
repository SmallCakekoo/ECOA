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
          const entryName = baseDir
            ? baseDir.replace(/\//g, "-").slice(0, -1)
            : "root";
          entries[entryName] = fullPath;
          console.log(`✓ Found HTML: ${entryName} -> ${fullPath}`);
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

// Función para encontrar todos los archivos JS (app.js, dashboard.js, etc.) recursivamente
function getAllJsFiles(dir, baseDir = "", entries = {}) {
  if (!existsSync(dir)) return entries;

  try {
    const files = readdirSync(dir);

    files.forEach((file) => {
      const fullPath = resolve(dir, file);

      try {
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
          // Recursivamente buscar en subdirectorios
          getAllJsFiles(fullPath, `${baseDir}${file}/`, entries);
        } else if (
          file.endsWith(".js") &&
          file !== "config.js" &&
          file !== "utils.js" &&
          file !== "auth.js" &&
          file !== "api.js"
        ) {
          // Crear nombre de entrada basado en la ruta y nombre del archivo
          const fileName = file.replace(".js", "");
          const entryName = baseDir
            ? `${baseDir.replace(/\//g, "-")}${fileName}`
            : fileName;
          entries[entryName] = fullPath;
          console.log(`✓ Found JS: ${entryName} -> ${fullPath}`);
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

// Buscar todos los archivos HTML y JS automáticamente
const publicDir = resolve(__dirname, "public");
const clientDir = resolve(publicDir, "client/screens");
const adminDir = resolve(publicDir, "admin/screens");
const adminSrcDir = resolve(publicDir, "admin/src");

console.log("\n🔍 Scanning for HTML and JS files...\n");

const htmlEntries = {
  ...getAllHtmlFiles(clientDir, "client-"),
  ...getAllHtmlFiles(adminDir, "admin-"),
};

const jsEntries = {
  ...getAllJsFiles(clientDir, "client-screens-"),
  ...getAllJsFiles(adminDir, "admin-screens-"),
};

// Agregar archivos JS compartidos manualmente
const sharedJsDir = resolve(publicDir, "admin/src");
if (existsSync(resolve(sharedJsDir, "config.js"))) {
  jsEntries["admin-src-config"] = resolve(sharedJsDir, "config.js");
  console.log(
    `✓ Found JS: admin-src-config -> ${resolve(sharedJsDir, "config.js")}`
  );
}
if (existsSync(resolve(sharedJsDir, "utils.js"))) {
  jsEntries["admin-src-utils"] = resolve(sharedJsDir, "utils.js");
  console.log(
    `✓ Found JS: admin-src-utils -> ${resolve(sharedJsDir, "utils.js")}`
  );
}
if (existsSync(resolve(sharedJsDir, "auth.js"))) {
  jsEntries["admin-src-auth"] = resolve(sharedJsDir, "auth.js");
  console.log(
    `✓ Found JS: admin-src-auth -> ${resolve(sharedJsDir, "auth.js")}`
  );
}
if (existsSync(resolve(sharedJsDir, "api.js"))) {
  jsEntries["admin-src-api"] = resolve(sharedJsDir, "api.js");
  console.log(`✓ Found JS: admin-src-api -> ${resolve(sharedJsDir, "api.js")}`);
}

const allEntries = {
  ...htmlEntries,
  ...jsEntries,
};

console.log(`\n✅ Found ${Object.keys(htmlEntries).length} HTML files`);
console.log(`✅ Found ${Object.keys(jsEntries).length} JS files`);
console.log(`✅ Total entry points: ${Object.keys(allEntries).length}\n`);

export default defineConfig({
  root: publicDir,

  server: {
    port: 5000,
    open: "/client/screens/Home/index.html",
  },

  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,

    rollupOptions: {
      input: allEntries,
      output: {
        entryFileNames: (chunkInfo) => {
          // Si es un archivo JS de una pantalla específica, mantener estructura
          if (chunkInfo.name.includes("client-screens-")) {
            const parts = chunkInfo.name
              .replace("client-screens-", "")
              .split("-");
            // Reconstruir la ruta: client/screens/{folder}/{file}.js
            const fileName = parts.pop(); // último elemento es el nombre del archivo
            const folderPath = parts.join("/");
            return `client/screens/${folderPath}/${fileName}.js`;
          }
          if (chunkInfo.name.includes("admin-screens-")) {
            const parts = chunkInfo.name
              .replace("admin-screens-", "")
              .split("-");
            const fileName = parts.pop();
            const folderPath = parts.join("/");
            return `admin/screens/${folderPath}/${fileName}.js`;
          }
          if (chunkInfo.name.includes("admin-src-")) {
            const fileName = chunkInfo.name.replace("admin-src-", "");
            return `admin/src/${fileName}.js`;
          }
          // Por defecto, mantener nombre con hash
          return `assets/[name]-[hash].js`;
        },
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          // Mantener las imágenes en assets
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(assetInfo.name)) {
            return "assets/[name]-[hash][extname]";
          }
          // CSS por pantalla
          if (assetInfo.name.endsWith(".css")) {
            return "assets/[name]-[hash][extname]";
          }
          return "assets/[name]-[hash][extname]";
        },
      },
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
