import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
    plugins: [
        react(),
        viteCompression({
            algorithm: 'gzip',
            ext: '.gz',
        }),
        viteCompression({
            algorithm: 'brotliCompress',
            ext: '.br',
        }),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        port: 5173
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        // Keep React initialized independently of vendor chunks that import it.
                        if (/\/node_modules\/(react|react-dom|scheduler)\//.test(id)) {
                            return 'react-vendor';
                        }
                        // Let Rollup split other libraries by actual route usage. Forcing shared
                        // helpers into PDF/chart/UI vendor chunks made them eager login dependencies.
                    }
                }
            }
        },
        chunkSizeWarningLimit: 1000,
    }
});
