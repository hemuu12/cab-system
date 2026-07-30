import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('react-dom') || id.includes('react-router') || /node_modules[\\/]react[\\/]/.test(id)) return 'react-vendor';
          if (id.includes('@reduxjs') || id.includes('react-redux') || id.includes('axios')) return 'data-vendor';
          if (id.includes('motion')) return 'motion-vendor';
          if (id.includes('lucide-react')) return 'icons-vendor';
          return undefined;
        }
      }
    }
  },
  server: {
    port: 5174,
    // Fail instead of silently walking to another port: the API's CORS allowlist
    // is pinned to 5174, so a shifted port breaks every credentialed request.
    strictPort: true,
    proxy: { '/api': 'http://localhost:5001' }
  }
});
