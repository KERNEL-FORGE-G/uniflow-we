/**
 * Rendu statique des tuiles d'icônes (esbuild + react-dom/server, comme
 * TeamGrid.render.test.mjs). La spécification `docs/icones-uniflow.md` attend
 * que les deux variantes se construisent, respectent la taille demandée et que
 * les icônes décoratives soient masquées aux lecteurs d'écran.
 *
 *   node --test src/components/ui/UniIcon.render.test.mjs
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build } from 'esbuild'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '../../..')

async function bundle() {
  const cache = path.join(root, 'node_modules/.cache')
  await mkdir(cache, { recursive: true })
  const dir = await mkdtemp(path.join(cache, 'uniflow-icons-'))
  const outfile = path.join(dir, 'uni-icon.mjs')
  await build({
    entryPoints: [path.join(root, 'src/components/ui/UniIcon.tsx')],
    outfile,
    bundle: true,
    format: 'esm',
    platform: 'node',
    jsx: 'automatic',
    external: ['react', 'react-dom', 'framer-motion', '@phosphor-icons/react'],
    alias: { '@': path.join(root, 'src') },
    logLevel: 'silent',
  })
  return { dir, module: await import(pathToFileURL(outfile).href) }
}

test('tuiles filled/soft aux trois tailles, icônes décoratives masquées', async (t) => {
  const { createElement } = await import('react')
  const { renderToStaticMarkup } = await import('react-dom/server')
  const { dir, module } = await bundle()
  t.after(() => rm(dir, { recursive: true, force: true }))

  for (const size of [36, 44, 56]) {
    for (const variant of ['filled', 'soft']) {
      const html = renderToStaticMarkup(createElement(module.IconTile, { name: 'courses', color: '#0D9488', variant, size }))
      assert.match(html, new RegExp(`data-variant="${variant}"`), `${variant} ${size} : variante posée`)
      assert.match(html, new RegExp(`width:${size}px;height:${size}px`), `${variant} ${size} : taille respectée`)
      assert.match(html, /<svg[^>]*aria-hidden="true"/, `${variant} ${size} : icône décorative masquée`)
      assert.match(html, new RegExp(`<svg[^>]*width="${{ 36: 18, 44: 22, 56: 28 }[size]}"`), `${variant} ${size} : icône à la moitié de la tuile`)
    }
  }

  const filled = renderToStaticMarkup(createElement(module.IconTile, { name: 'grades', color: '#7C3AED', variant: 'filled', size: 56 }))
  assert.match(filled, /linear-gradient\(135deg, #7C3AED 0%, #59\w{4} 100%\)/, 'dégradé 135° vers la nuance sombre')
  assert.match(filled, /rgba\(124, 58, 237, 0\.25\)/, 'ombre colorée à 25 %')
  assert.match(filled, /border-radius:16px/, '56 px → rayon 16')
  assert.match(filled, /<path[^>]*opacity="0\.2"/, 'graisse duotone (calque secondaire présent, remonté à 45 % par index.css)')

  const soft = renderToStaticMarkup(createElement(module.IconTile, { name: 'grades', color: '#7C3AED', variant: 'soft' }))
  assert.match(soft, /background-color:rgba\(124, 58, 237, 0\.14\)/, 'fond teinté à 14 %')
  assert.match(soft, /box-shadow:none/, 'sans ombre')
  assert.match(soft, /color:#7C3AED/, 'icône de la couleur')
  assert.match(soft, /border-radius:14px/, '44 px par défaut → rayon 14')
})

test('SubjectIcon et la tuile de matière suivent subjectIconName ; UniIcon accepte une graisse', async (t) => {
  const { createElement } = await import('react')
  const { renderToStaticMarkup } = await import('react-dom/server')
  const { dir, module } = await bundle()
  t.after(() => rm(dir, { recursive: true, force: true }))

  assert.match(renderToStaticMarkup(createElement(module.SubjectIcon, { subject: 'Développement web' })), /data-icon="Globe"/)
  assert.match(renderToStaticMarkup(createElement(module.SubjectIcon, { subject: 'Bases de données avancées' })), /data-icon="Database"/)
  assert.match(renderToStaticMarkup(createElement(module.IconTile, { subject: 'Systèmes d’exploitation (Linux)', color: '#1E3A8A' })), /data-icon="Terminal"/)
  assert.match(renderToStaticMarkup(createElement(module.IconTile, { subject: 'Cours libre', subjectCode: 'IA-201', color: '#1E3A8A' })), /data-icon="Brain"/)
  assert.match(renderToStaticMarkup(createElement(module.IconTile, { subject: '', color: '#1E3A8A' })), /data-icon="BookOpen"/, 'défaut')

  const active = renderToStaticMarkup(createElement(module.UniIcon, { name: 'dashboard', weight: 'fill', size: 20 }))
  assert.match(active, /data-icon="dashboard"/)
  assert.doesNotMatch(active, /opacity="0\.2"/, 'graisse fill : pas de calque duotone')
  assert.match(active, /aria-hidden="true"/)

  const labelled = renderToStaticMarkup(createElement(module.UniIcon, { name: 'notifications', alt: 'Notifications' }))
  assert.match(labelled, /<title>Notifications<\/title>/)
  assert.doesNotMatch(labelled, /aria-hidden/, 'une icône porteuse de sens n’est pas masquée')
})
