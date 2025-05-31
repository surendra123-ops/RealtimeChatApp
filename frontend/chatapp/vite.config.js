import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', // ensures correct asset paths in production
  build: {
    outDir: 'dist', // default, but explicitly specifying is safer
  },
});
