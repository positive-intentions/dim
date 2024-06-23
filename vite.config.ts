import { defineConfig } from "vite";
import federation from "@originjs/vite-plugin-federation";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [
    react(),
    federation({
      name: 'dim',
      filename: 'vite-remoteEntry.js',
      // Modules to expose
      exposes: {
        './Dim': './src/stories/components/dim.ts',
      },
      shared: ['react', 'react-dom']
  })
  ],

  build: {
    rollupOptions: {
      input: 'src/index.ts',
    },
    target: 'es2022'
  },

  // // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  // //
  // // 1. prevent vite from obscuring rust errors
  // clearScreen: false,
  // // 2. tauri expects a fixed port, fail if that port is not available
  // server: {
  //   // port: 1420,
  //   // strictPort: true,
  //   // watch: {
  //   //   // 3. tell vite to ignore watching `src-tauri`
  //   //   ignored: ["**/src-tauri/**"],
  //   // },
  //   proxy: {
  //     '/assets': {
  //       target: 'http://localhost:3000',
  //       changeOrigin: true,
  //       headers: {
  //         'Access-Control-Allow-Origin': '*'
  //       }
  //     }
  //   }
  // },
}));
