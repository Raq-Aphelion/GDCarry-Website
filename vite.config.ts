import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // Absolute base — the site is served from the domain root, and prerendered
  // pages live in nested paths (e.g. /guides/why-grand-dice/) where a
  // relative './' base would break asset URLs.
  base: '/',
  // inspectAttr is dev-only: it stamps code-path="src\…" attributes on every
  // element, which would leak the internal source layout into dist/.
  plugins: [...(command === 'serve' ? [inspectAttr()] : []), react()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
