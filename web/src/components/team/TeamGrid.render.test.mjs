/**
 * Test de rendu de la grille Équipe sans Vitest ni jsdom : le composant TSX est
 * compilé par esbuild (déjà présent via Vite) vers un fichier temporaire, puis
 * rendu en HTML statique par react-dom/server. On vérifie ce qui compte pour
 * le propriétaire : 8 cartes, ordre `displayOrder`, silhouette sans photo,
 * image du bucket quand `avatarFileId` est renseigné.
 *
 *   node --test src/components/team/TeamGrid.render.test.mjs
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build } from 'esbuild'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '../../..')

async function bundleGrid() {
  // Le bundle est écrit sous node_modules/.cache : depuis /tmp, Node ne
  // résoudrait pas `react` (externe, pour partager l'instance avec react-dom/server).
  const cache = path.join(root, 'node_modules/.cache')
  await mkdir(cache, { recursive: true })
  const dir = await mkdtemp(path.join(cache, 'uniflow-team-'))
  const stub = path.join(dir, 'appwrite-stub.js')
  // Le composant ne dépend d'Appwrite que pour l'URL de la photo : on la
  // simule pour ne pas instancier le SDK ni lire import.meta.env.
  await writeFile(stub, `export function avatarViewUrl(id) { return id ? 'https://appwrite.test/storage/buckets/uniflow_assets/files/' + id + '/view?project=uniflow' : '' }\n`)
  const outfile = path.join(dir, 'team-grid.mjs')
  await build({
    entryPoints: [path.join(root, 'src/components/team/TeamMemberCard.tsx')],
    outfile,
    bundle: true,
    format: 'esm',
    platform: 'node',
    jsx: 'automatic',
    external: ['react', 'react-dom', 'framer-motion', 'lucide-react'],
    alias: { '@': path.join(root, 'src') },
    plugins: [{
      name: 'stub-appwrite',
      setup(pluginBuild) {
        pluginBuild.onResolve({ filter: /(^|\/)lib\/appwrite$/ }, () => ({ path: stub }))
      },
    }],
    logLevel: 'silent',
  })
  return { dir, module: await import(pathToFileURL(outfile).href) }
}

const NAMES = ['Ravel', 'Aliyatou', 'Judith', 'William', 'Sandra', 'Hassane', 'Ange', 'Juvénal']
const members = NAMES.map((name, index) => ({
  $id: `m${index}`,
  slug: name.toLowerCase(),
  name,
  role: 'Développeur',
  team: 'Frontend',
  subTeam: 'Web',
  github: index % 2 === 0 ? `gh-${index}` : '',
  email: `${name.toLowerCase()}@example.com`,
  accent: 'blue',
  avatarFileId: index === 0 ? 'photo-ravel' : '',
  displayOrder: NAMES.length - index,
  bio: index === 1 ? 'Concevoir des interfaces qui restent utiles sans réseau.' : '',
}))

test('la grille rend les huit membres, dans l’ordre displayOrder, silhouette sans photo', async (t) => {
  const { createElement } = await import('react')
  const { renderToStaticMarkup } = await import('react-dom/server')
  const { dir, module } = await bundleGrid()
  t.after(() => rm(dir, { recursive: true, force: true }))

  const html = renderToStaticMarkup(createElement(module.TeamGrid, { members }))

  const cards = [...html.matchAll(/data-slug="([^"]+)"/g)].map((match) => match[1])
  assert.equal(cards.length, 8, 'huit cartes rendues')
  assert.deepEqual(cards, [...NAMES].reverse().map((name) => name.toLowerCase()), 'ordre displayOrder croissant, indépendant de l’ordre reçu')
  assert.ok(!html.includes('aristide'), 'aucun membre parti réintroduit')

  const images = [...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map((match) => match[1])
  assert.equal(images.length, 1, 'une seule photo : le membre avec avatarFileId')
  assert.match(images[0], /uniflow_assets\/files\/photo-ravel\/view/)
  assert.equal((html.match(/pas de photo/g) || []).length, 7, 'silhouette neutre pour les sept autres')

  assert.match(html, /clip-path:polygon\(0 0, 100% 0, 100% 88%, 50% 100%, 0 88%\)/, 'carte pentagonale')
  assert.match(html, /Concevoir des interfaces/, 'la bio est affichée quand elle existe')
  assert.match(html, /Développeur · Web/, 'poste · sous-équipe quand la bio manque')
  assert.match(html, /bg-\[#14b8a8\]/, 'bouton rond teal (palette UniFlow)')
  assert.ok(!/#e5ff3a|#ff4fa3|#2f6fb0/.test(html), 'aucune couleur de la maquette d’origine')
  assert.match(html, /bg-\[#0b0f19\]/, 'carte marine sombre')
  assert.equal((html.match(/lg:translate-y-12/g) || []).length, 3, 'colonne centrale décalée (indices 1, 4, 7)')
})
