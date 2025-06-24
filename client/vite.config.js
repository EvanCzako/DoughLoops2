import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    base: '/DoughLoops2/', // <-- replace with your repo name!
    plugins: [react()],
});
