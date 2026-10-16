import test from 'node:test'
import assert from 'node:assert/strict'
import { levelLabel, levelsOf, parseLevels, programByCodeOrName, toProgram, universityByName } from './referenceModel.ts'

test('parseLevels : chaîne « L1,L2,L3 » du schéma, tolérante aux séparateurs', () => {
  assert.deepEqual(parseLevels('L1,L2,L3'), ['L1', 'L2', 'L3'])
  assert.deepEqual(parseLevels('l1 ; l2'), ['L1', 'L2'])
  assert.deepEqual(parseLevels(''), [])
  assert.deepEqual(parseLevels(undefined), [])
  assert.deepEqual(parseLevels(['M1', 'M2']), ['M1', 'M2'])
})

test('levelLabel : libellé lisible, inconnu rendu tel quel', () => {
  assert.equal(levelLabel('L1'), 'Licence 1')
  assert.equal(levelLabel('M2'), 'Master 2')
  assert.equal(levelLabel('D1'), 'Doctorat 1')
  assert.equal(levelLabel('Année préparatoire'), 'Année préparatoire')
})

test('universityByName : par nom ou par code, insensible à la casse', () => {
  const universities = [
    { id: '1', code: 'UY1', name: 'Université de Yaoundé I', shortName: 'UY1', city: 'Yaoundé', country: 'Cameroun', website: '', active: true },
  ]
  assert.equal(universityByName(universities, 'université de yaoundé i')?.code, 'UY1')
  assert.equal(universityByName(universities, 'uy1')?.code, 'UY1')
  assert.equal(universityByName(universities, 'Université de Dschang'), undefined)
  assert.equal(universityByName(undefined, 'UY1'), undefined)
})

test('toProgram + levelsOf : niveaux distincts triés L < M < D', () => {
  const ict = toProgram({ $id: 'a', code: 'ICT4D', name: 'ICT4D', universityCode: 'UY1', facultyCode: 'FS', levels: 'L1,L2,L3' })
  const info = toProgram({ $id: 'b', code: 'INFO', name: 'Informatique', universityCode: 'UY1', facultyCode: 'FS', levels: 'M1,L3,L1', active: true })
  const inactive = toProgram({ $id: 'c', code: 'OLD', name: 'Ancienne', universityCode: 'UY1', facultyCode: 'FS', levels: 'D1', active: false })
  assert.equal(ict.active, true, 'active absent = actif (le seed historique ne le renseigne pas)')
  assert.equal(inactive.active, false)
  assert.deepEqual(levelsOf([ict, info]), ['L1', 'L2', 'L3', 'M1'])
  assert.deepEqual(levelsOf(undefined), [])
  assert.equal(programByCodeOrName([ict, info], 'informatique')?.code, 'INFO')
  assert.equal(programByCodeOrName([ict, info], 'ict4d')?.code, 'ICT4D')
})
