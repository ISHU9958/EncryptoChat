import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000', // Use VITE_BACKEND_URL or fallback to localhost
        changeOrigin: true, // Ensures that the origin is modified to match the target backend server
        rewrite: (path) => path.replace(/^\/api/, '/api'), // Ensures that the '/api' prefix is maintained
      },
    },
  },
});
