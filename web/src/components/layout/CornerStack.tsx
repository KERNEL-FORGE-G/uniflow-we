import { createContext, useCallback, useContext, useEffect, useId, useMemo, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cornerZoneOrder, resolveBottomEdge, type BottomEdgeKind, type CornerZone } from './bottomEdgeModel'

/**
 * L'unique propriétaire du coin bas droit de la fenêtre.
 *
 * Avant (2026-09-21) : le lanceur d'Uni, le bandeau d'inactivité (`IdleTimer`)
 * et la barre audio de la bibliothèque se posaient chacun en
 * `fixed bottom-… right-…` sans se connaître. Ils se recouvraient entre eux,
 * et le lanceur recouvrait le bouton « Envoyer » de la messagerie — la seule
 * parade était une exception `pathname === '/app/emploi-du-temps'` codée en
 * dur dans le lanceur.
 *
 * Désormais :
 *  - `<CornerStack />` est le seul élément `fixed bottom-* right-*` de
 *    l'application (un test garde-fou, `cornerStack.guard.test.mjs`, refuse
 *    ce motif ailleurs). Il est rendu une fois, dans `App.tsx`, là où Uni et
 *    `IdleTimer` sont déjà montés pour le site public comme pour l'espace
 *    connecté — plutôt qu'une fois par layout, ce qui aurait ouvert la porte
 *    à deux piles superposées.
 *  - tout élément flottant du coin se rend **dans** la pile via
 *    `<CornerSlot>` (portail React) ; la pile les empile verticalement.
 *  - une page qui occupe le bas de l'écran le déclare avec
 *    `<BottomEdge kind="composer" />` ou `useBottomEdge('fullscreen')` ; le
 *    lanceur d'Uni lit cette déclaration (`useCornerStack().bottomEdge`).
 */

interface CornerStackContextValue {
  /** Nœud DOM de la pile, cible des portails ; `null` avant le premier montage. */
  node: HTMLElement | null
  attach: (node: HTMLElement | null) => void
  /** Déclaration résolue : la plus contraignante des pages montées. */
  bottomEdge: BottomEdgeKind
  declare: (id: string, kind: BottomEdgeKind) => void
  release: (id: string) => void
}

const CornerStackContext = createContext<CornerStackContextValue | null>(null)

function useCornerStackContext(caller: string): CornerStackContextValue {
  const value = useContext(CornerStackContext)
  if (!value) throw new Error(`${caller} doit être rendu sous <CornerStackProvider> (voir App.tsx).`)
  return value
}

export function CornerStackProvider({ children }: { children: ReactNode }) {
  const [node, setNode] = useState<HTMLElement | null>(null)
  // Une déclaration par composant déclarant (clé `useId`) : une page qui se
  // démonte ne retire que la sienne, jamais celle d'un voisin encore monté.
  const [declarations, setDeclarations] = useState<ReadonlyMap<string, BottomEdgeKind>>(() => new Map())

  const declare = useCallback((id: string, kind: BottomEdgeKind) => {
    setDeclarations((current) => {
      if (current.get(id) === kind) return current
      const next = new Map(current)
      next.set(id, kind)
      return next
    })
  }, [])
  const release = useCallback((id: string) => {
    setDeclarations((current) => {
      if (!current.has(id)) return current
      const next = new Map(current)
      next.delete(id)
      return next
    })
  }, [])

  const bottomEdge = useMemo(() => resolveBottomEdge(declarations.values()), [declarations])
  const value = useMemo<CornerStackContextValue>(
    () => ({ node, attach: setNode, bottomEdge, declare, release }),
    [node, bottomEdge, declare, release],
  )
  return <CornerStackContext.Provider value={value}>{children}</CornerStackContext.Provider>
}

/**
 * La pile elle-même. `pointer-events-none` : la colonne est aussi large que
 * son élément le plus large (la barre audio fait 24 rem, le lanceur 4 rem) et
 * le vide à gauche du lanceur ne doit pas avaler les clics destinés à la page.
 * Chaque `<CornerSlot>` rétablit `pointer-events-auto` sur son contenu.
 */
export function CornerStack() {
  const { attach } = useCornerStackContext('<CornerStack>')
  return (
    <div
      ref={attach}
      data-corner-stack
      className="pointer-events-none fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6"
    />
  )
}

/**
 * Rend ses enfants dans la pile. Les enfants directs sont empilés (colonne,
 * alignés à droite) et redeviennent cliquables ; la zone fixe leur place :
 * `notices` au-dessus, `launcher` tout en bas. Ne rendre le slot que lorsqu'il
 * a un contenu, sinon la colonne vide compte un `gap` de plus.
 */
export function CornerSlot({ zone = 'notices', children }: { zone?: CornerZone; children: ReactNode }) {
  const { node } = useCornerStackContext('<CornerSlot>')
  if (!node) return null
  return createPortal(
    <div
      data-corner-zone={zone}
      style={{ order: cornerZoneOrder(zone) }}
      className="pointer-events-none flex flex-col items-end gap-3 [&>*]:pointer-events-auto"
    >
      {children}
    </div>,
    node,
  )
}

/**
 * Déclare, le temps que le composant appelant est monté, ce que la page fait
 * de son bord inférieur. `free` ne réclame rien (utile pour une déclaration
 * conditionnelle sans hook conditionnel).
 */
export function useBottomEdge(kind: BottomEdgeKind): void {
  const { declare, release } = useCornerStackContext('useBottomEdge')
  const id = useId()
  useEffect(() => {
    declare(id, kind)
    return () => release(id)
  }, [declare, release, id, kind])
}

/** Forme déclarative de `useBottomEdge`, à poser dans le JSX de la page. */
export function BottomEdge({ kind }: { kind: BottomEdgeKind }) {
  useBottomEdge(kind)
  return null
}

/** Ce que le coin sait : la déclaration résolue de la page courante. */
export function useCornerStack(): { bottomEdge: BottomEdgeKind } {
  const { bottomEdge } = useCornerStackContext('useCornerStack')
  return { bottomEdge }
}
