// client/src/env.d.ts

interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string;
    // add other VITE_ variables here if you have them
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
