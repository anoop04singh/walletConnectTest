import { defineConfig } from 'vite';
import NodeGlobalsPolyfillPlugin from '@esbuild-plugins/node-globals-polyfill';
import NodeModulesPolyfillPlugin from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    NodeModulesPolyfillPlugin(), // Polyfills Node.js modules like 'crypto' and 'stream'
  ],
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis', // Polyfill for 'global'
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true,
        }),
      ],
    },
  },
  build: {
    rollupOptions: {
      external: ['ethers'], // Ensures ethers is treated as external
    },
  },
});
