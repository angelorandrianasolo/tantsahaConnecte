import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Le backend (port 3000) reçoit les appels AJAX en dev ;
// en production, le dossier build/ (dist) est servi par Express.
const BACKEND = 'http://localhost:3000';
const ROUTES = ['/session', '/utilisateurs', '/parcelles', '/observations', '/alertes',
  '/meteo', '/conseils', '/cultures', '/sync', '/dashboard', '/audio', '/health'];

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: Object.fromEntries(ROUTES.map((r) => [r, { target: BACKEND, changeOrigin: true }])),
  },
});
