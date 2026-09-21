/**
 * Poses de la mascotte Uni, **embarquées dans le code** (consigne du
 * propriétaire du 2026-09-21 : les images doivent s'afficher même quand tout
 * le reste échoue — page d'erreur, hors ligne).
 *
 * - Les poses des écrans d'erreur / hors ligne / chargement sont inlinées en
 *   `data:` (`?inline`) : elles vivent dans le bundle JavaScript, aucune
 *   requête réseau n'est nécessaire pour les montrer.
 * - Les autres sont des assets Vite hachés, servis avec le bundle et mis en
 *   cache par le service worker au premier affichage.
 */
import wave from '@/assets/mascot/uni-wave.webp'
import celebrate from '@/assets/mascot/uni-celebrate.webp'
import graduate from '@/assets/mascot/uni-graduate.webp'
import headset from '@/assets/mascot/uni-headset.webp'
import peekBottom from '@/assets/mascot/uni-peek-bottom.webp'
import peekRight from '@/assets/mascot/uni-peek-right.webp'
import pointing from '@/assets/mascot/uni-pointing.webp'
import shield from '@/assets/mascot/uni-shield.webp'
import sorryInline from '@/assets/mascot/uni-sorry-sm.webp?inline'
import sleepingInline from '@/assets/mascot/uni-sleeping-sm.webp?inline'
import thinkingInline from '@/assets/mascot/uni-thinking-sm.webp?inline'
import searchInline from '@/assets/mascot/uni-search-sm.webp?inline'
import sorry from '@/assets/mascot/uni-sorry.webp'
import sleeping from '@/assets/mascot/uni-sleeping.webp'
import thinking from '@/assets/mascot/uni-thinking.webp'
import search from '@/assets/mascot/uni-search.webp'

export type UniPose =
  | 'wave'
  | 'thinking'
  | 'celebrate'
  | 'sorry'
  | 'search'
  | 'sleeping'
  | 'graduate'
  | 'pointing'
  | 'peekRight'
  | 'peekBottom'
  | 'headset'
  | 'shield'

export type PoseAsset = {
  /** Version haute définition (768 px), asset haché. */
  src: string
  /** Version toujours disponible (inlinée) pour les écrans critiques ; identique à `src` sinon. */
  safe: string
  /** Largeur / hauteur pour réserver la place avant chargement. */
  ratio: number
  alt: string
}

export const POSES: Record<UniPose, PoseAsset> = {
  wave: { src: wave, safe: wave, ratio: 682 / 768, alt: 'Uni salue de la main' },
  thinking: { src: thinking, safe: thinkingInline, ratio: 413 / 768, alt: 'Uni réfléchit' },
  celebrate: { src: celebrate, safe: celebrate, ratio: 710 / 768, alt: 'Uni saute de joie sous des confettis' },
  sorry: { src: sorry, safe: sorryInline, ratio: 639 / 768, alt: 'Uni, désolé, hausse les épaules' },
  search: { src: search, safe: searchInline, ratio: 498 / 768, alt: 'Uni cherche avec une loupe' },
  sleeping: { src: sleeping, safe: sleepingInline, ratio: 667 / 768, alt: 'Uni dort, débranché' },
  graduate: { src: graduate, safe: graduate, ratio: 633 / 768, alt: 'Uni diplômé, pouce levé' },
  pointing: { src: pointing, safe: pointing, ratio: 651 / 768, alt: 'Uni montre la direction' },
  peekRight: { src: peekRight, safe: peekRight, ratio: 690 / 768, alt: 'Uni passe la tête depuis le bord' },
  peekBottom: { src: peekBottom, safe: peekBottom, ratio: 574 / 768, alt: 'Uni surgit du bas de l’écran' },
  headset: { src: headset, safe: headset, ratio: 768 / 755, alt: 'Uni avec son casque, prêt à répondre' },
  shield: { src: shield, safe: shield, ratio: 628 / 768, alt: 'Uni tient un bouclier avec un cadenas' },
}

/** Préchargement discret des poses (après le premier rendu). */
export function preloadPoses(poses: UniPose[] = Object.keys(POSES) as UniPose[]) {
  if (typeof window === 'undefined') return
  for (const pose of poses) {
    const img = new Image()
    img.decoding = 'async'
    img.src = POSES[pose].src
  }
}
