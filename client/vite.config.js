import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite';

// Vite configuration for the React app
export default defineConfig({
  plugins: [
    // Enable React support
    react(),

    // Enable Tailwind CSS integration
    tailwindcss(),
  ],
  server: {
    // Run the development server on port 5173
    port: 5173,

    // Proxy API requests to the backend server
    proxy: {
      "/api": {
        target: "http://localhost:8800",
        changeOrigin:true,
      }
    }
  }
})