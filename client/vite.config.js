// client/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/*
 * base is '/' in both modes now that the app is served from the root of
 * doughloops.evanczako.com rather than the /DoughLoops2/ project page. It has
 * to change in the same deploy as client/public/CNAME: publishing one without
 * the other serves a white page whose bundles 404.
 */
export default defineConfig(() => ({
    plugins: [react()],
    base: '/',
}));
