/**
 * Poses d'Archlord, la mascotte du fondateur (demande du propriétaire du
 * 2026-09-21) : même style Duolingo qu'Uni, générées d'après sa photo, puis
 * détourées. Comme pour Uni, les images sont **embarquées dans le bundle**
 * (assets Vite hachés) : aucune dépendance à un service distant pour les
 * afficher.
 *
 * Archlord n'apparaît jamais sur les écrans d'erreur — il n'a donc pas de
 * variante inlinée `?inline` : il commente, il présente, il échange avec Uni.
 */
import wave from '@/assets/mascot/archlord-wave.webp'
import explain from '@/assets/mascot/archlord-explain.webp'
import laptop from '@/assets/mascot/archlord-laptop.webp'
import thumbs from '@/assets/mascot/archlord-thumbs.webp'
import thinking from '@/assets/mascot/archlord-thinking.webp'
import pointing from '@/assets/mascot/archlord-pointing.webp'
import fistbump from '@/assets/mascot/archlord-uni-fistbump.webp'
import type { PoseAsset } from './poses'

export type ArchlordPose = 'wave' | 'explain' | 'laptop' | 'thumbs' | 'thinking' | 'pointing'

export const ARCHLORD_POSES: Record<ArchlordPose, PoseAsset> = {
  wave: { src: wave, safe: wave, ratio: 373 / 768, alt: 'Archlord, le fondateur, salue de la main' },
  explain: { src: explain, safe: explain, ratio: 403 / 768, alt: 'Archlord explique, main ouverte' },
  laptop: { src: laptop, safe: laptop, ratio: 405 / 768, alt: 'Archlord code sur son ordinateur portable' },
  thumbs: { src: thumbs, safe: thumbs, ratio: 325 / 768, alt: 'Archlord lève le pouce' },
  thinking: { src: thinking, safe: thinking, ratio: 272 / 768, alt: 'Archlord réfléchit, main au menton' },
  pointing: { src: pointing, safe: pointing, ratio: 417 / 768, alt: 'Archlord montre quelque chose du doigt' },
}

/** Scène à deux : Archlord et Uni se saluent poing contre poing. */
export const ARCHLORD_UNI_FISTBUMP: PoseAsset = {
  src: fistbump,
  safe: fistbump,
  ratio: 768 / 714,
  alt: 'Archlord et Uni se saluent poing contre poing',
}

export const ARCHLORD_NAME = 'Archlord'
export const ARCHLORD_ROLE = 'Fondateur de KERNEL FORGE'
