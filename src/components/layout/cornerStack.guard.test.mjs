/**
 * Garde-fou : un seul propriétaire du coin bas droit de la fenêtre.
 *
 * Symptôme corrigé le 2026-09-21 : le lanceur d'Uni, le bandeau d'inactivité
 * (IdleTimer) et la barre audio de la bibliothèque se posaient chacun en
 * position fixe dans le même coin sans se connaître ; ils se recouvraient
 * entre eux et le lanceur recouvrait le bouton « Envoyer » de la messagerie.
 * Depuis, tout élément flottant du coin passe par <CornerSlot>, et seul
 * `CornerStack.tsx` a le droit de porter le motif ci-dessous.
 *
 * Motif détecté — dans un même littéral de chaîne ('…', "…" ou `…`, celui-ci
 * pouvant courir sur plusieurs lignes), des classes séparées par des espaces
 * qui contiennent À LA FOIS :
 *   - `fixed` (ou une variante : `sm:fixed`, `lg:fixed`…),
 *   - une classe `bottom-*` (variantes et négatif compris : `sm:bottom-6`,
 *     `-bottom-2`),
 *   - une classe `right-*` (idem : `md:right-8`, `-right-1`).
 * Ne sont donc pas concernés : `fixed inset-0` (modales), `fixed bottom-4
 * left-1/2` (bandeaux centrés d'OfflineBanner et UniScenes), `fixed top-20
 * right-6` (toasts), ni `absolute bottom-4 right-4` (filigrane de la
 * messagerie, positionné dans son parent).
 *
 * Les commentaires sont retirés avant l'analyse (blocs de commentaire et
 * lignes commençant par `//`) pour pouvoir citer le motif en toutes lettres
 * dans la documentation du code. Les fichiers de test sont ignorés.
 *
 * Limite connue : des classes réparties dans plusieurs littéraux
 * (`cn('fixed bottom-4', 'right-4')`) passent sous le radar. Le garde-fou
 * attrape le cas courant — une chaîne `className` — pas toutes les ruses.
 *
 *   node --test src/components/layout/cornerStack.guard.test.mjs
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const SRC_ROOT = path.resolve(here, '../..')
const ALLOWED_OWNER = 'components/layout/CornerStack.tsx'

const SOURCE_FILE = /\.(?:tsx?|jsx?|mjs)$/
const TEST_FILE = /\.test\.(?:tsx?|jsx?|mjs)$/

// Un littéral simple ou double ne franchit pas la ligne ; un gabarit peut.
const STRING_LITERAL = /'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`/g
const BLOCK_COMMENT = /\/\*[\s\S]*?\*\//g
const LINE_COMMENT = /^[ \t]*\/\/.*$/gm

const VARIANTS = '(?:[a-z0-9-]+:)*'
const FIXED = new RegExp(`^${VARIANTS}fixed$`)
const BOTTOM = new RegExp(`^${VARIANTS}-?bottom-`)
const RIGHT = new RegExp(`^${VARIANTS}-?right-`)

/** Vrai si une liste de classes réclame le coin bas droit en position fixe. */
export function claimsBottomRightCorner(classList) {
  const tokens = classList.split(/\s+/).filter(Boolean)
  return tokens.some((t) => FIXED.test(t)) && tokens.some((t) => BOTTOM.test(t)) && tokens.some((t) => RIGHT.test(t))
}

/** Retire les commentaires en gardant les sauts de ligne (les numéros de ligne restent justes). */
export function stripComments(source) {
  return source
    .replace(BLOCK_COMMENT, (comment) => comment.replace(/[^\n]/g, ' '))
    .replace(LINE_COMMENT, (comment) => comment.replace(/[^\n]/g, ' '))
}

/** Toutes les chaînes du fichier qui portent le motif, avec leur ligne. */
export function findCornerClaims(source) {
  const code = stripComments(source)
  const claims = []
  for (const match of code.matchAll(STRING_LITERAL)) {
    const literal = match[0].slice(1, -1)
    if (!claimsBottomRightCorner(literal)) continue
    const line = code.slice(0, match.index).split('\n').length
    claims.push({ line, literal: literal.replace(/\s+/g, ' ').trim() })
  }
  return claims
}

async function sourceFiles(root) {
  const entries = await readdir(root, { withFileTypes: true, recursive: true })
  return entries
    .filter((entry) => entry.isFile() && SOURCE_FILE.test(entry.name) && !TEST_FILE.test(entry.name))
    .map((entry) => path.join(entry.parentPath ?? entry.path, entry.name))
    .sort()
}

// Les chaînes d'exemple sont assemblées à l'exécution : ce fichier ne doit
// pas lui-même contenir le motif en un seul littéral.
const classes = (...tokens) => tokens.join(' ')

test('le détecteur reconnaît le motif fixed + bottom-* + right-*, variantes comprises', () => {
  assert.equal(claimsBottomRightCorner(classes('fixed', 'bottom-4', 'right-4', 'z-40')), true)
  assert.equal(claimsBottomRightCorner(classes('fixed', 'bottom-4', 'right-4', 'sm:bottom-6', 'sm:right-6')), true)
  assert.equal(claimsBottomRightCorner(classes('fixed', 'sm:bottom-6', 'sm:right-6')), true, 'variantes responsives seules')
  assert.equal(claimsBottomRightCorner(classes('lg:fixed', '-bottom-2', '-right-1')), true, 'variante sur fixed, valeurs négatives')
  assert.equal(claimsBottomRightCorner(classes('fixed', 'bottom-4', 'left-4', 'right-4', 'sm:left-auto', 'sm:right-6', 'sm:w-96')), true, 'ancienne barre audio de la bibliothèque')
  assert.equal(claimsBottomRightCorner(classes('fixed', 'bottom-6', 'right-6', 'z-50')), true, 'ancien bandeau IdleTimer')
})

test('le détecteur laisse passer les modales, les bandeaux centrés, les toasts et les positions absolues', () => {
  assert.equal(claimsBottomRightCorner(classes('fixed', 'inset-0', 'z-50')), false, 'modale')
  assert.equal(claimsBottomRightCorner(classes('fixed', 'bottom-4', 'left-1/2', 'z-[70]', '-translate-x-1/2')), false, 'OfflineBanner / UniScenes')
  assert.equal(claimsBottomRightCorner(classes('fixed', 'top-20', 'right-6', 'z-50')), false, 'toasts')
  assert.equal(claimsBottomRightCorner(classes('absolute', 'bottom-4', 'right-4')), false, 'filigrane positionné dans son parent')
  assert.equal(claimsBottomRightCorner(classes('fixed', 'bottom-0', 'inset-x-0')), false, 'barre pleine largeur')
  assert.equal(claimsBottomRightCorner(classes('fixed', 'right-4', 'bottom')), false, 'bottom sans valeur n’est pas une classe de position')
})

test('findCornerClaims lit les gabarits multi-lignes et ignore les commentaires', () => {
  const template = '`' + ['fixed', 'bottom-4', 'right-4'].join('\n    ') + '`'
  const source = ['const a = 1', `const b = ${template}`, 'const c = 2'].join('\n')
  assert.deepEqual(findCornerClaims(source), [{ line: 2, literal: classes('fixed', 'bottom-4', 'right-4') }])

  const commented = [
    '/* ' + classes('fixed', 'bottom-4', 'right-4') + ' */',
    '// ' + classes('fixed', 'bottom-4', 'right-4'),
    '  // `' + classes('fixed', 'bottom-6', 'right-6') + '` cité dans un commentaire',
    `const ok = '${classes('flex', 'items-end')}'`,
  ].join('\n')
  assert.deepEqual(findCornerClaims(commented), [])

  const inJsx = `<div className="${classes('fixed', 'bottom-4', 'right-4')}" />`
  assert.equal(findCornerClaims(inJsx).length, 1)
})

test('CornerStack.tsx est le seul fichier de src/ à réclamer le coin bas droit en position fixe', async () => {
  const files = await sourceFiles(SRC_ROOT)
  assert.ok(files.length > 50, `balayage trop court : ${files.length} fichiers`)

  const offenders = []
  let ownerClaims = 0
  for (const file of files) {
    const relative = path.relative(SRC_ROOT, file).split(path.sep).join('/')
    const claims = findCornerClaims(await readFile(file, 'utf8'))
    if (relative === ALLOWED_OWNER) {
      ownerClaims = claims.length
      continue
    }
    for (const claim of claims) offenders.push(`src/${relative}:${claim.line}  "${claim.literal}"`)
  }

  assert.equal(ownerClaims, 1, 'CornerStack.tsx doit porter exactement un conteneur fixed bottom right')
  assert.deepEqual(
    offenders,
    [],
    `Le coin bas droit appartient à CornerStack.tsx ; rends ces éléments dans un <CornerSlot> :\n  ${offenders.join('\n  ')}`,
  )
})
