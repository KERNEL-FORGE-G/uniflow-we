/**
 * Rendu statique de la structure académique (esbuild + react-dom/server, comme
 * TeamGrid.render.test.mjs). Symptôme du propriétaire en production : la page
 * résumait 296 UE en « Université de Yaoundé I · ICT4D · L1 ». On vérifie
 * qu'avec 12 filières la page affiche 12 lignes et qu'aucune filière ni niveau
 * n'apparaît dans l'en-tête d'une administration ou du compte PLATFORM.
 *
 *   node --test src/components/admin/StructureView.render.test.mjs
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
  const dir = await mkdtemp(path.join(cache, 'uniflow-structure-'))
  await build({
    entryPoints: [path.join(root, 'src/components/admin/StructureView.tsx'), path.join(root, 'src/lib/structureModel.ts')],
    outdir: dir,
    outbase: path.join(root, 'src'),
    bundle: true,
    format: 'esm',
    platform: 'node',
    jsx: 'automatic',
    external: ['react', 'react-dom', 'react-router-dom', 'lucide-react'],
    alias: { '@': path.join(root, 'src') },
    logLevel: 'silent',
  })
  return {
    dir,
    view: await import(pathToFileURL(path.join(dir, 'components/admin/StructureView.js')).href),
    model: await import(pathToFileURL(path.join(dir, 'lib/structureModel.js')).href),
  }
}

const UY1 = 'Université de Yaoundé I'
const CODES = ['MAT', 'PHY', 'CHM', 'INF', 'GEO', 'BIOS', 'MIB', 'BOA', 'BOV', 'BCH', 'ENR', 'ICT4D']
const programs = CODES.map((code, index) => ({ code, name: `Filière ${code}`, universityCode: 'UY1', facultyCode: 'FS', levels: index % 2 ? ['L1', 'L2', 'L3', 'M1'] : ['L1', 'L2', 'L3'] }))
const courses = CODES.flatMap((code) => ['L1', 'L2', 'L3'].map((level, i) => ({ $id: `${code}-${level}-${i}`, university: UY1, program: code, level })))
const schedules = CODES.flatMap((code) => ['L1', 'L2'].map((level) => ({ $id: `${code}-${level}-s`, university: UY1, program: code, level })))

test('12 filières → 12 lignes, aucun « ICT4D · L1 » dans l’en-tête', async (t) => {
  const { createElement } = await import('react')
  const { renderToStaticMarkup } = await import('react-dom/server')
  const { MemoryRouter } = await import('react-router-dom')
  const { dir, view, model } = await bundle()
  t.after(() => rm(dir, { recursive: true, force: true }))

  const input = {
    universities: [{ code: 'UY1', name: UY1 }],
    faculties: [{ code: 'FS', universityCode: 'UY1', name: 'Faculté des Sciences' }],
    programs,
    classrooms: Array.from({ length: 34 }, (_, i) => ({ code: `S${i}` })),
    courses,
    schedules,
  }

  for (const [label, props] of [
    ['administration', { isPlatform: false, universityCode: 'UY1', facultyCode: 'FS', scope: { university: UY1, faculty: 'Faculté des Sciences' } }],
    ['plateforme', { isPlatform: true, scope: {} }],
  ]) {
    const summary = model.summarizeStructure({ ...input, universityCode: props.universityCode, facultyCode: props.facultyCode, scope: props.scope })
    const html = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(view.StructureView, {
      scopeTitle: view.structureScopeTitle({ isPlatform: props.isPlatform, university: UY1, faculty: 'Faculté des Sciences' }),
      summary,
      students: 4,
      delegates: 1,
      teachers: 1,
      perLevel: {},
    })))

    const rows = [...html.matchAll(/data-program="([^"]+)"/g)].map((m) => m[1])
    assert.equal(rows.length, 12, `${label} : douze lignes de filières`)
    const scopeTitle = /data-testid="structure-scope"[^>]*>(.*?)<\/p>/.exec(html)?.[1] ?? ''
    assert.ok(!/ICT4D|L1/.test(scopeTitle), `${label} : ni filière ni niveau dans l’en-tête (${scopeTitle})`)
    assert.match(html, /1 université · 1 faculté · 12 filières · 36 UE · 24 séances/, `${label} : compteurs calculés depuis la base`)
    assert.ok(!html.includes('intentionnellement limitée'), 'plus de phrase sur un périmètre volontairement réduit')
    assert.match(html, /href="\/admin\/ue\?program=INF&amp;level=M1"/, 'lien vers les UE filtrées par filière et niveau')
    assert.match(html, /href="\/admin\/salles\?program=MAT"/, 'lien vers l’emploi du temps de la filière')
  }

  const platformTitle = view.structureScopeTitle({ isPlatform: true })
  assert.equal(platformTitle, 'Plateforme UniFlow · toutes les universités')
  assert.equal(view.structureScopeTitle({ isPlatform: false, university: UY1, faculty: 'Faculté des Sciences' }), 'Université de Yaoundé I · Faculté des Sciences')
})
