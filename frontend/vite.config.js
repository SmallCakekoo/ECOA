import { defineConfig } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  root: "./public", // apunta a la carpeta public
  server: {
    port: 5000,
    open: true,
  },

  build: {
    outDir: "../dist", // build final en frontend/dist
    rollupOptions: {
      input: {
        client: path.resolve(__dirname, "public/client/screens/Home/index.html"),
        admin: path.resolve(__dirname, "public/admin/screens/dashboard/index.html"),
      },
    },
  },
});