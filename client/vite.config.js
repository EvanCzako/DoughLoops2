// client/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
    plugins: [react()],
    base: mode === 'production' ? '/DoughLoops2/' : '/', // replace with your actual repo name
}));
