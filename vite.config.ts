import fs from "fs"
import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig, type Plugin } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'
import { CATEGORY_FILES, GLOBAL_PRICING_FILE } from './src/data/pricingFiles'

/* Compiles the whole public/db/ tree into a single db/bundle.json the client
   loads with ONE request — the ~150 individual JSON fetches (one per
   service, plus the pricing category files) tripped Cloudflare rate
   limiting. The per-file JSONs remain the editing source of truth and still
   ship to dist (the orders worker fetches them for its authoritative
   recompute); only the client's read path changes. In dev the middleware
   rebuilds the bundle per request, so JSON edits apply without a server
   restart. */
function dbBundlePlugin(): Plugin {
  const readJson = (p: string) => JSON.parse(fs.readFileSync(p, 'utf8'));
  const buildBundle = () => {
    const services: Record<string, unknown> = {};
    const servicesRoot = path.resolve(__dirname, 'public/db/services');
    for (const gameId of fs.readdirSync(servicesRoot)) {
      const dir = path.join(servicesRoot, gameId);
      if (!fs.statSync(dir).isDirectory()) continue;
      const files: Record<string, unknown> = {};
      let index: unknown;
      let shared: unknown;
      for (const f of fs.readdirSync(dir)) {
        if (!f.endsWith('.json')) continue;
        const name = f.slice(0, -'.json'.length);
        if (name === 'index') index = readJson(path.join(dir, f));
        else if (name === 'shared-sections') shared = readJson(path.join(dir, f));
        else files[name] = readJson(path.join(dir, f));
      }
      services[gameId] = { index, shared, files };
    }
    const dbRoot = path.resolve(__dirname, 'public/db');
    const categories: Record<string, unknown> = {};
    for (const rel of CATEGORY_FILES) categories[rel] = readJson(path.join(dbRoot, `${rel}.json`));
    return JSON.stringify({
      pricing: { global: readJson(path.join(dbRoot, `${GLOBAL_PRICING_FILE}.json`)), categories },
      services,
    });
  };
  return {
    name: 'db-bundle',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.split('?')[0] !== '/db/bundle.json') return next();
        res.setHeader('content-type', 'application/json');
        res.setHeader('cache-control', 'no-store');
        res.end(buildBundle());
      });
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'db/bundle.json', source: buildBundle() });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // Absolute base — the site is served from the domain root, and prerendered
  // pages live in nested paths (e.g. /guides/why-grand-dice/) where a
  // relative './' base would break asset URLs.
  base: '/',
  // inspectAttr is dev-only: it stamps code-path="src\…" attributes on every
  // element, which would leak the internal source layout into dist/.
  plugins: [...(command === 'serve' ? [inspectAttr()] : []), react(), dbBundlePlugin()],
  server: {
    // The worker allows this dev origin via the ALLOWED_ORIGINS var in
    // worker/wrangler.toml — change the port there too.
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Split the framework into its own vendor chunk: the app chunk drops
        // under the 500 kB warning limit, and the vendor hash stays stable
        // across deploys (only app code changes), so repeat visitors re-use
        // the cached framework instead of re-downloading it with every build.
        manualChunks(id: string) {
          if (/node_modules[\\/](react|react-dom|react-router|scheduler)[\\/]/.test(id))
            return 'vendor';
        },
      },
    },
  },
}));
