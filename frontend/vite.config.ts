import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // Слушать на всех интерфейсах
    port: 3000,
    allowedHosts: [
      'takta.space',
      'www.takta.space',    // опционально
      'localhost',
      '127.0.0.1'
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:3223',
        changeOrigin: true
      },
    }
  }
});
