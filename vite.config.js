import { defineConfig } from 'vite';

export default defineConfig({
  // Configuration shared by local development and the supervised preview.
  server: {
    host: '0.0.0.0',
    allowedHosts: ['terminal.local']
  }
});
