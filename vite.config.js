import { defineConfig } from 'vite';
import NodeGlobalsPolyfillPlugin from '@esbuild-plugins/node-globals-polyfill';
import NodeModulesPolyfillPlugin from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    NodeModulesPolyfillPlugin(),
  ],
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
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
      external: ['ethers'],
    },
  },
});
