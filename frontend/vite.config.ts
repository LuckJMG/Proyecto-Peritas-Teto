import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // CONFIGURACIÓN PARA HOT RELOAD EN DOCKER
  server: {
    host: '0.0.0.0', // Permite conexiones externas
    port: 3000,
    strictPort: true,
    
    // Configuración de HMR (Hot Module Replacement)
    hmr: {
      clientPort: 3000,
      host: 'localhost'
    },
    
    // CLAVE: Usa polling para detectar cambios en Docker
    watch: {
      usePolling: true,
      interval: 100 // Revisa cambios cada 100ms
    }
  }
})