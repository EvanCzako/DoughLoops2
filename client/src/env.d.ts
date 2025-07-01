// client/src/env.d.ts

interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string;
    readonly BASE_URL: string; // ← add this line
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
