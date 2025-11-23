export default defineConfig({
  // ... другие настройки
  server: {
    host: '0.0.0.0',        // чтобы слушать все интерфейсы
    port: 5173,             // или ваш порт
    strictPort: false,
    allowedHosts: [
      'takta.space',
      'www.takta.space',    // опционально
      'localhost',
      '127.0.0.1'
    ],
  },
});
