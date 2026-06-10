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
                        if (id.includes('three') || id.includes('@react-three/fiber')) {
                            return 'three-vendor';
                        }
                        if (id.includes('jspdf') || id.includes('html2canvas')) {
                            return 'pdf-vendor';
                        }
                        if (id.includes('recharts')) {
                            return 'chart-vendor';
                        }
                        if (id.includes('@supabase/supabase-js')) {
                            return 'supabase-vendor';
                        }
                        if (id.includes('@radix-ui') || id.includes('framer-motion') || id.includes('lucide-react')) {
                            return 'ui-vendor';
                        }
                    }
                }
            }
        },
        chunkSizeWarningLimit: 1000,
    }
});
