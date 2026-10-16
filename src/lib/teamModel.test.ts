import test from 'node:test'
import assert from 'node:assert/strict'
import { hasPhoto, sortTeamMembers, staggerOffsetClass, teamMemberBlurb, teamMemberLinks } from './teamModel.ts'

const base = { $id: 'x', slug: 'x', role: 'Dev', team: 'Frontend', displayOrder: 0 }

test('tri par displayOrder puis par nom', () => {
  const sorted = sortTeamMembers([
    { ...base, $id: 'c', name: 'Zoé', displayOrder: 2 },
    { ...base, $id: 'a', name: 'Bob', displayOrder: 0 },
    { ...base, $id: 'b', name: 'Ali', displayOrder: 0 },
  ])
  assert.deepEqual(sorted.map((m) => m.$id), ['b', 'a', 'c'])
})

test('photo présente seulement avec un avatarFileId non vide', () => {
  assert.equal(hasPhoto({ avatarFileId: '' }), false)
  assert.equal(hasPhoto({ avatarFileId: '  ' }), false)
  assert.equal(hasPhoto({}), false)
  assert.equal(hasPhoto({ avatarFileId: 'abc123' }), true)
})

test('liens : github sans @, e-mail en mailto, ordre stable', () => {
  const links = teamMemberLinks({ ...base, name: 'A', github: '@ravel', email: 'a@b.cm', linkedin: 'https://www.linkedin.com/in/ravel' })
  assert.deepEqual(links.map((l) => l.kind), ['github', 'linkedin', 'email'])
  assert.equal(links[0].href, 'https://github.com/ravel')
  assert.equal(links[2].href, 'mailto:a@b.cm')
  assert.deepEqual(teamMemberLinks({ ...base, name: 'B' }), [])
})

test('texte de carte : bio, sinon poste · sous-équipe', () => {
  assert.equal(teamMemberBlurb({ ...base, name: 'A', bio: ' Passionné. ' }), 'Passionné.')
  assert.equal(teamMemberBlurb({ ...base, name: 'A', subTeam: 'Web' }), 'Dev · Web')
  assert.equal(teamMemberBlurb({ ...base, name: 'A' }), 'Dev')
})

test('grille en escalier : colonne centrale décalée sur trois colonnes', () => {
  assert.match(staggerOffsetClass(1), /lg:translate-y-12/)
  assert.match(staggerOffsetClass(0), /lg:translate-y-0/)
  assert.match(staggerOffsetClass(4), /lg:translate-y-12/)
  assert.match(staggerOffsetClass(1), /md:translate-y-8/)
})
