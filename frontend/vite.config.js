import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/api': 'http://127.0.0.1:5000'
        }
    },
    build: {
        chunkSizeWarningLimit: 600,
        rollupOptions: {
            output: {
                manualChunks: {
                    // React core
                    'vendor-react': ['react', 'react-dom'],
                    // Routing
                    'vendor-router': ['react-router-dom'],
                    // Animation
                    'vendor-motion': ['framer-motion'],
                    // Charts
                    'vendor-charts': ['recharts'],
                    // Icons
                    'vendor-icons': ['lucide-react'],
                    // HTTP
                    'vendor-axios': ['axios'],
                },
            },
        },
    },
})
