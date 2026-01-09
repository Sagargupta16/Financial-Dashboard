import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable Fast Refresh
      fastRefresh: true,
      // Use automatic JSX runtime
      jsxRuntime: 'automatic',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@features': path.resolve(__dirname, './src/features'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@types': path.resolve(__dirname, './src/types'),
      '@config': path.resolve(__dirname, './src/config'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
      '@constants': path.resolve(__dirname, './src/constants'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Optimize chunks
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'chart-vendor': ['chart.js', 'react-chartjs-2'],
          'd3-vendor': ['d3-hierarchy', 'd3-scale', 'd3-selection'],
          'icons': ['lucide-react'],
        },
      },
    },
    // Increase chunk size warning limit for financial calculations
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 3000,
    open: true,
    // Enable HMR
    hmr: {
      overlay: true,
    },
  },
  // For GitHub Pages deployment
  base: '/Financial-Dashboard/',
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'chart.js',
      'react-chartjs-2',
      'd3-hierarchy',
      'd3-scale',
      'd3-selection',
      'lucide-react',
    ],
  },
});
