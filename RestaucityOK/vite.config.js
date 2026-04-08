import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import { resolve } from "path"

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  build: {
    // Generate sourcemaps for debugging
    sourcemap: false,
    // Optimize chunks
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["vue", "vue-router"],
          supabase: ["@supabase/supabase-js"],
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true,
  },
})
