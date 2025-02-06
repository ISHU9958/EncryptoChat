import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // Backend server
        changeOrigin: true, // Adjusts the origin of the request to match the target
        rewrite: (path) => path.replace(/^\/api/, '/api'), // Ensures the path remains intact
      },
    },
  },
});
