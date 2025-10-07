import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  root: "../frontend/public", // apunta a la carpeta public
  server: {
    port: 5000, // puerto de desarrollo
    open: true,
  },
  build: {
    outDir: "../../dist", // build final fuera de frontend
    rollupOptions: {
      input: {
        client: path.resolve(__dirname, "public/client/index.html"),
        admin: path.resolve(__dirname, "public/admin/index.html"),
      },
    },
  },
});
