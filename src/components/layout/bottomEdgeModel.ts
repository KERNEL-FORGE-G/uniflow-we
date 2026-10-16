/**
 * Modèle pur du coin bas droit de l'écran — ce que `CornerStack.tsx` affiche.
 *
 * Deux questions y sont tranchées sans DOM, pour être testées par `node:test` :
 *  1. quand plusieurs pages ou composants déclarent leur « bord inférieur »,
 *     laquelle des déclarations l'emporte ;
 *  2. le lanceur d'Uni doit-il s'afficher, sachant ce que la page réclame.
 *
 * Symptôme à l'origine (2026-09-21, constaté d'abord sur le mobile) : le
 * lanceur d'Uni recouvrait le bouton « Envoyer » de la messagerie, et la seule
 * parade était une exception `pathname === '/app/emploi-du-temps'` codée en
 * dur dans le lanceur. Une page dit désormais ce qu'elle occupe, le coin
 * s'adapte.
 */

/**
 * - `free` : la page ne réclame rien, le coin est libre (défaut).
 * - `composer` : un champ de saisie collé en bas (messagerie) — le lanceur le
 *   recouvrirait.
 * - `fullscreen` : la page prend tout l'écran (grille de l'emploi du temps).
 */
export type BottomEdgeKind = 'free' | 'composer' | 'fullscreen'

export const BOTTOM_EDGE_KINDS: readonly BottomEdgeKind[] = ['free', 'composer', 'fullscreen']

// Plus le rang est élevé, plus la page réclame le bas de l'écran.
const EDGE_RANK: Record<BottomEdgeKind, number> = { free: 0, composer: 1, fullscreen: 2 }

/**
 * Plusieurs déclarations peuvent coexister un instant (page qui se démonte
 * pendant que la suivante se monte, composant imbriqué) : la plus
 * contraignante l'emporte, quel que soit l'ordre de déclaration.
 */
export function resolveBottomEdge(declared: Iterable<BottomEdgeKind>): BottomEdgeKind {
  let winner: BottomEdgeKind = 'free'
  for (const kind of declared) {
    if ((EDGE_RANK[kind] ?? 0) > EDGE_RANK[winner]) winner = kind
  }
  return winner
}

/** Une page qui réclame son bord inférieur fait disparaître le lanceur d'Uni. */
export function edgeHidesLauncher(edge: BottomEdgeKind): boolean {
  return edge !== 'free'
}

/**
 * Le lanceur d'Uni est visible si le coin est libre, ou si le panneau est
 * déjà ouvert : on ne ferme pas une conversation au nez de l'utilisateur
 * parce qu'il a changé de page. Panneau fermé sur une page à composeur :
 * rien ne s'affiche — Uni reste à un clic sur toute autre page.
 */
export function launcherVisible(edge: BottomEdgeKind, panelOpen: boolean): boolean {
  return !edgeHidesLauncher(edge) || panelOpen
}

/**
 * Zones de la pile : les bandeaux (inactivité, lecture audio…) au-dessus, le
 * lanceur d'Uni tout en bas, au ras du coin. L'ordre est porté par la
 * propriété CSS `order`, pas par l'ordre de montage des portails, qui dépend
 * de la page et n'est pas prévisible.
 */
export type CornerZone = 'notices' | 'launcher'

export const CORNER_ZONE_ORDER: Record<CornerZone, number> = { notices: 0, launcher: 1 }

export function cornerZoneOrder(zone: CornerZone): number {
  return CORNER_ZONE_ORDER[zone]
}
