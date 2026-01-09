import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable Fast Refresh
      fastRefresh: true,
      // Use automatic JSX runtime
      jsxRuntime: 'automatic',
    }),
    // Bundle analyzer (only in analyze mode)
    ...(process.env.ANALYZE === 'true'
      ? [
          visualizer({
            open: true,
            filename: 'dist/stats.html',
            gzipSize: true,
            brotliSize: true,
          }),
        ]
      : []),
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
    // Minification is enabled by default in production builds (Vite default)
    terserOptions: {
      compress: {
        // Remove non-critical console logs in production but keep error/warn for observability
        pure_funcs: ['console.log', 'console.debug', 'console.info', 'console.trace'],
        drop_console: true, // Remove console logs in production
        drop_debugger: true,
      },
    },
    // Optimize chunks
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react-vendor';
          }
          // Chart.js and related
          if (id.includes('node_modules/chart.js') || id.includes('node_modules/react-chartjs-2')) {
            return 'chart-vendor';
          }
          // D3 libraries
          if (id.includes('node_modules/d3-')) {
            return 'd3-vendor';
          }
          // Radix UI primitives (from shadcn/ui)
          if (id.includes('node_modules/@radix-ui/')) {
            return 'radix-vendor';
          }
          // Lucide icons
          if (id.includes('node_modules/lucide-react')) {
            return 'icons';
          }
          // Zustand state management
          if (id.includes('node_modules/zustand')) {
            return 'state-vendor';
          }
          // Feature-based splitting for large features
          if (id.includes('src/features/analytics')) {
            return 'analytics-feature';
          }
          if (id.includes('src/features/budget') || id.includes('src/lib/calculations')) {
            // Combine budget and calculations to avoid circular dependency
            return 'budget-feature';
          }
          if (id.includes('src/features/charts')) {
            return 'charts-feature';
          }
        },
      },
    },
    // Reduce chunk size warning limit after optimization
    chunkSizeWarningLimit: 500,
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
      'react-router-dom',
      'chart.js',
      'react-chartjs-2',
      'd3-hierarchy',
      'd3-scale',
      'd3-selection',
      'lucide-react',
    ],
  },
});
