import type { AssistantTurn } from './appwrite'

/**
 * État de la conversation avec Flo, côté client.
 *
 * Le serveur est sans état (il reçoit l'historique à chaque tour) : c'est le
 * client qui conserve la conversation, par compte, dans `localStorage`. Les
 * fonctions sont pures pour être testées avec `node --test`, comme
 * `academicScope.ts`.
 */

export const ASSISTANT_NAME = 'Uni'
export const ASSISTANT_AVATAR = '/assistant/uni-avatar.webp'
export const ASSISTANT_AVATAR_FALLBACK = '/assistant/uni-avatar.png'

/** Au-delà, les plus anciens tours sont oubliés : le serveur n'en lit que 20. */
export const MAX_STORED_TURNS = 40

export type AssistantMessage = AssistantTurn & {
  id: string
  at: string
  /** Tour d'accueil généré localement / par `hello` : exclu de l'historique envoyé. */
  local?: boolean
  /** Le tour a échoué (réseau, serveur) : l'interface propose de réessayer. */
  failed?: boolean
}

export function storageKeyFor(userId: string) {
  return `uniflow:assistant:v1:${userId || 'anonyme'}`
}

export function newMessageId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function makeMessage(role: AssistantTurn['role'], content: string, extra: Partial<AssistantMessage> = {}): AssistantMessage {
  return { id: newMessageId(), at: new Date().toISOString(), role, content, ...extra }
}

/** Historique à envoyer au serveur : sans les tours locaux ni les échecs. */
export function historyForServer(messages: AssistantMessage[]): AssistantTurn[] {
  return messages
    .filter((m) => !m.local && !m.failed && m.content.trim())
    .map(({ role, content }) => ({ role, content }))
}

/** Ne garde que les [MAX_STORED_TURNS] derniers tours ; le tour d'accueil reste en tête. */
export function trimMessages(messages: AssistantMessage[]): AssistantMessage[] {
  const greeting = messages.find((m) => m.local)
  const rest = messages.filter((m) => !m.local).slice(-MAX_STORED_TURNS)
  return greeting ? [greeting, ...rest] : rest
}

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export function loadMessages(storage: StorageLike | undefined, userId: string): AssistantMessage[] {
  if (!storage) return []
  try {
    const raw = storage.getItem(storageKeyFor(userId))
    const parsed = raw ? (JSON.parse(raw) as unknown) : null
    if (!Array.isArray(parsed)) return []
    return parsed.filter((m): m is AssistantMessage => {
      const item = m as Partial<AssistantMessage>
      return typeof item?.id === 'string' && (item.role === 'user' || item.role === 'assistant') && typeof item.content === 'string'
    })
  } catch {
    return []
  }
}

export function saveMessages(storage: StorageLike | undefined, userId: string, messages: AssistantMessage[]) {
  if (!storage) return
  try { storage.setItem(storageKeyFor(userId), JSON.stringify(trimMessages(messages))) } catch { /* quota ou stockage indisponible : la conversation reste en mémoire */ }
}

export function clearMessages(storage: StorageLike | undefined, userId: string) {
  try { storage?.removeItem(storageKeyFor(userId)) } catch { /* rien à effacer */ }
}

/**
 * Rendu minimal du Markdown que le modèle emploie spontanément : paragraphes,
 * listes à puces (`* ` ou `- `), gras `**x**`. Rien d'autre — pas de HTML brut,
 * le texte reste échappé par React.
 */
export type RenderedBlock = { kind: 'paragraph'; parts: RenderedInline[] } | { kind: 'list'; items: RenderedInline[][] }
export type RenderedInline = { text: string; bold: boolean }

export function inlineParts(line: string): RenderedInline[] {
  const parts: RenderedInline[] = []
  const pattern = /\*\*(.+?)\*\*/g
  let last = 0
  for (const match of line.matchAll(pattern)) {
    const start = match.index ?? 0
    if (start > last) parts.push({ text: line.slice(last, start), bold: false })
    parts.push({ text: match[1], bold: true })
    last = start + match[0].length
  }
  if (last < line.length) parts.push({ text: line.slice(last), bold: false })
  return parts.length ? parts : [{ text: line, bold: false }]
}

export function renderMarkdownLite(text: string): RenderedBlock[] {
  const blocks: RenderedBlock[] = []
  let paragraph: string[] = []
  let list: RenderedInline[][] = []
  const flushParagraph = () => {
    if (paragraph.length) blocks.push({ kind: 'paragraph', parts: inlineParts(paragraph.join(' ')) })
    paragraph = []
  }
  const flushList = () => {
    if (list.length) blocks.push({ kind: 'list', items: list })
    list = []
  }
  for (const rawLine of text.replace(/\r/g, '').split('\n')) {
    const line = rawLine.trim()
    const bullet = /^([*\-•]|\d+[.)])\s+(.*)$/.exec(line)
    if (bullet) {
      flushParagraph()
      list.push(inlineParts(bullet[2]))
      continue
    }
    if (!line) {
      flushParagraph()
      flushList()
      continue
    }
    flushList()
    paragraph.push(line.replace(/^#{1,6}\s+/, ''))
  }
  flushParagraph()
  flushList()
  return blocks
}
