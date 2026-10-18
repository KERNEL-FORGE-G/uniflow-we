import test from 'node:test'
import assert from 'node:assert/strict'
import {
  isProjectCreatorMember,
  getMatchedTeamMember,
  CREATOR_EMAILS,
} from './teamMemberAuth.ts'

test('reconnaissance des membres créateurs par e-mail', () => {
  assert.equal(isProjectCreatorMember(null), false)
  assert.equal(isProjectCreatorMember(undefined), false)
  assert.equal(isProjectCreatorMember({ email: 'inconnu@example.com' }), false)
  assert.equal(isProjectCreatorMember({ email: 'ravelnghomsi@gmail.com' }), true)
  assert.equal(isProjectCreatorMember({ email: 'RAVELNGHOMSI@GMAIL.COM ' }), true)
  assert.equal(isProjectCreatorMember({ email: 'h.hawadja1@gmail.com' }), true)
  assert.equal(isProjectCreatorMember({ email: 'sandraborelle0@gmail.com' }), true)
})

test('reconnaissance des membres créateurs par rôle superadmin ou labels', () => {
  assert.equal(isProjectCreatorMember({ isSuperAdmin: true, email: 'custom@domain.cm' }), true)
  assert.equal(isProjectCreatorMember({ labels: ['team'], email: 'member@domain.cm' }), true)
  assert.equal(isProjectCreatorMember({ labels: ['creator'], email: 'dev@domain.cm' }), true)
  assert.equal(isProjectCreatorMember({ labels: ['other'], email: 'student@domain.cm' }), false)
})

test('reconnaissance par nom complet de membre créateur', () => {
  assert.equal(isProjectCreatorMember({ name: 'NGHOMSI FEUKOUO RAVEL' }), true)
  assert.equal(isProjectCreatorMember({ name: 'Marcel Tes' }), true)
  assert.equal(isProjectCreatorMember({ name: 'Étudiant Inconnu' }), false)
})

test('getMatchedTeamMember retrouve le membre correspondant', () => {
  const matched = getMatchedTeamMember({ email: 'ravelnghomsi@gmail.com' })
  assert.ok(matched)
  assert.equal(matched?.$id, 'ravel')
  assert.equal(matched?.slug, 'ravel')

  const matchedByName = getMatchedTeamMember({ name: 'Marcel Tes' })
  assert.ok(matchedByName)
  assert.equal(matchedByName?.slug, 'tessoh-pekam-marcel')

  const unmatched = getMatchedTeamMember({ email: 'random@test.com', name: 'Random' })
  assert.equal(unmatched, null)
})
