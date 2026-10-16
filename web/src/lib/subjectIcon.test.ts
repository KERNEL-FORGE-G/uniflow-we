import test from 'node:test'
import assert from 'node:assert/strict'
import { UNIFLOW_PALETTE, darkenHex, hexWithAlpha, normalizeHexColor, subjectColor, subjectIconName } from './subjectIcon.ts'

test('table de la spécification : un mot-clé par famille', () => {
  const attendus: Array<[string, string]> = [
    ['Mathématiques', 'MathOperations'],
    ['Algèbre linéaire', 'MathOperations'],
    ['Physique quantique', 'Atom'],
    ['Chimie organique', 'Flask'],
    ['Biologie cellulaire', 'Dna'],
    ['Réseaux informatiques', 'Network'],
    ['SQL avancé', 'Database'],
    ['Applications mobiles Android', 'DeviceMobile'],
    ['Sécurité des systèmes', 'ShieldCheck'],
    ['Cloud et DevOps', 'Cloud'],
    ['Statistiques descriptives', 'ChartLine'],
    ['Anglais technique', 'Translate'],
    ['Entrepreneuriat', 'Rocket'],
    ['Projet tutoré', 'Kanban'],
    ['Algorithmique', 'Code'],
    ['Comptabilité générale', 'Coins'],
    ['Droit des affaires', 'Scales'],
    ['Histoire des institutions', 'Scroll'],
    ['Géographie humaine', 'GlobeHemisphereWest'],
    ['Électronique numérique', 'Lightning'],
    ['Musique', 'MusicNotes'],
    ['Arts plastiques', 'Palette'],
    ['Éducation physique', 'Barbell'],
    ['Anatomie', 'FirstAid'],
    ['Télécommunications', 'Broadcast'],
    ['Philosophie', 'Feather'],
  ]
  for (const [nom, icone] of attendus) {
    assert.equal(subjectIconName(nom), icone, nom)
  }
})

test('sans mot-clé reconnu, BookOpen par défaut (nom vide compris)', () => {
  assert.equal(subjectIconName('Méthodologie du travail universitaire'), 'BookOpen')
  assert.equal(subjectIconName(''), 'BookOpen')
  assert.equal(subjectIconName(undefined, undefined), 'BookOpen')
})

test('insensible à la casse et aux accents', () => {
  assert.equal(subjectIconName('GEOMETRIE DIFFERENTIELLE'), 'MathOperations')
  assert.equal(subjectIconName('géométrie différentielle'), 'MathOperations')
  assert.equal(subjectIconName('SECURITE'), 'ShieldCheck')
  assert.equal(subjectIconName('ECONOMIE'), 'Coins')
  assert.equal(subjectIconName('Systemes d’exploitation'), 'Terminal')
})

test('l’ordre des mots-clés tranche : les quatre exemples de la spécification', () => {
  // « web » précède « développement » : un cours de dev web est un globe, pas du code.
  assert.equal(subjectIconName('Développement web'), 'Globe')
  // Pluriel « Bases » toléré : le mot-clé est « base de donn ».
  assert.equal(subjectIconName('Bases de données avancées'), 'Database')
  assert.equal(subjectIconName('Systèmes d’exploitation (Linux)'), 'Terminal')
  assert.equal(subjectIconName('Intelligence artificielle et science des données'), 'Brain')
  // Une expression entière l'emporte sur une racine placée plus haut : « phys » ne vole pas « Éducation physique ».
  assert.equal(subjectIconName('Éducation physique et sportive'), 'Barbell')
  assert.equal(subjectIconName('Physique'), 'Atom')
})

test('les racines courtes ne se lisent qu’en début de mot ; le code participe à la recherche', () => {
  // « ia » ne doit pas surgir de « matériaux » ni « tic » de « robotique ».
  assert.equal(subjectIconName('Résistance des matériaux'), 'BookOpen')
  assert.equal(subjectIconName('Robotique'), 'BookOpen')
  assert.equal(subjectIconName('IA générative'), 'Brain')
  assert.equal(subjectIconName('TIC et société'), 'Broadcast')
  // Racines longues cherchées partout : « bio » dans « microbiologie ».
  assert.equal(subjectIconName('Microbiologie'), 'Dna')
  assert.equal(subjectIconName('Cours libre', 'IA-101'), 'Brain')
})

test('couleur : colorHex prioritaire, sinon palette par hachage stable du code', () => {
  assert.equal(subjectColor('INF201', '#ec4899'), '#EC4899')
  assert.equal(subjectColor('INF201', '#abc'), '#AABBCC')
  assert.equal(subjectColor('INF201', 'rouge'), subjectColor('INF201'), 'valeur illisible → palette')
  const couleur = subjectColor('INF201')
  assert.ok((UNIFLOW_PALETTE as readonly string[]).includes(couleur))
  assert.equal(subjectColor('INF201'), subjectColor('inf201'), 'même cours, même couleur quelle que soit la casse')
  // Sept codes voisins ne doivent pas tous tomber sur la même teinte.
  const teintes = new Set(['MAT101', 'PHY102', 'INF103', 'CHM104', 'BIO105', 'GEO106', 'ECO107'].map((code) => subjectColor(code)))
  assert.ok(teintes.size >= 3, `hachage trop peu dispersé : ${[...teintes].join(', ')}`)
})

test('utilitaires de couleur des tuiles', () => {
  assert.equal(normalizeHexColor(' #0d9488 '), '#0D9488')
  assert.equal(normalizeHexColor(''), null)
  assert.equal(darkenHex('#FFFFFF', 0.5), '#808080')
  assert.equal(darkenHex('#0D9488', 0), '#0D9488')
  assert.equal(hexWithAlpha('#1E3A8A', 0.25), 'rgba(30, 58, 138, 0.25)')
})
