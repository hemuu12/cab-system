import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
    // Fail instead of silently walking to another port: the API's CORS allowlist
    // is pinned to 5174, so a shifted port breaks every credentialed request.
    strictPort: true,
    proxy: { '/api': 'http://localhost:5001' }
  }
});
