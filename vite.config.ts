import path from 'path'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Plugin } from 'vite'

/**
 * Écrit `precache-manifest.json` (liste des chunks JS/CSS/images émis) et
 * injecte un identifiant de build dans `public/sw.js`. Sans manifeste, le
 * service worker ne connaissait que les fichiers déjà visités : un écran
 * jamais ouvert en ligne restait blanc hors ligne (« Failed to fetch
 * dynamically imported module »). Sans identifiant de build, `sw.js` ne
 * changeait pas d'un déploiement à l'autre et ne se réinstallait donc jamais.
 */
function serviceWorkerPrecachePlugin(): Plugin {
  let outDir = 'dist'
  const assets = new Set<string>()
  return {
    name: 'uniflow-sw-precache',
    apply: 'build',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir)
    },
    generateBundle(_, bundle) {
      for (const [fileName, output] of Object.entries(bundle)) {
        if (!/\.(js|css|webp|png|svg|woff2?)$/.test(fileName)) continue
        const isEntry = output.type === 'chunk' && output.isEntry
        assets.add(JSON.stringify({ url: `/${fileName}`, critical: isEntry || fileName.endsWith('.css') }))
      }
    },
    closeBundle() {
      const entries = [...assets].map((raw) => JSON.parse(raw) as { url: string; critical: boolean }).sort((a, b) => a.url.localeCompare(b.url))
      const buildId = createHash('sha1').update(entries.map((entry) => entry.url).join('\n')).digest('hex').slice(0, 12)
      writeFileSync(path.join(outDir, 'precache-manifest.json'), JSON.stringify({ buildId, assets: entries }))
      const swPath = path.join(outDir, 'sw.js')
      if (existsSync(swPath)) {
        writeFileSync(swPath, readFileSync(swPath, 'utf8').replace(/__BUILD_ID__/g, buildId))
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), serviceWorkerPrecachePlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    dedupe: ['react', 'react-dom'],
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: true,
  },
})
