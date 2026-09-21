/**
 * Logique pure du dialogue Archlord / Uni, séparée du rendu pour être testée
 * avec `node:test` (aucun DOM) : enchaînement des répliques et pose prise par
 * chaque personnage selon qui parle.
 */
import type { ArchlordPose } from './archlord'
import type { UniPose } from './poses'

export type DialogueSpeaker = 'archlord' | 'uni'

export interface DialogueLineModel {
  who: DialogueSpeaker
  archlordPose?: ArchlordPose
  uniPose?: UniPose
}

export interface IdlePoses {
  archlord?: ArchlordPose
  uni?: UniPose
}

/** Pose d'Archlord quand il parle sans pose explicite. */
export const ARCHLORD_SPEAKING_POSE: ArchlordPose = 'explain'
/** Pose d'Uni quand il parle sans pose explicite. */
export const UNI_SPEAKING_POSE: UniPose = 'pointing'
/** Poses d'écoute par défaut. */
export const DEFAULT_IDLE: Required<IdlePoses> = { archlord: 'wave', uni: 'wave' }

/**
 * Index de la réplique suivante : boucle au début si `loop`, sinon reste sur
 * la dernière (le dialogue ne « saute » jamais hors de la liste).
 */
export function nextLineIndex(current: number, total: number, loop: boolean): number {
  if (total <= 0) return 0
  if (current + 1 < total) return current + 1
  return loop ? 0 : Math.min(current, total - 1)
}

/** Poses des deux personnages pour une réplique donnée. */
export function posesFor(line: DialogueLineModel, idle: IdlePoses = {}): { archlord: ArchlordPose; uni: UniPose } {
  const archlordIdle = idle.archlord ?? DEFAULT_IDLE.archlord
  const uniIdle = idle.uni ?? DEFAULT_IDLE.uni
  return {
    archlord: line.archlordPose ?? (line.who === 'archlord' ? ARCHLORD_SPEAKING_POSE : archlordIdle),
    uni: line.uniPose ?? (line.who === 'uni' ? UNI_SPEAKING_POSE : uniIdle),
  }
}

/** Le minuteur d'enchaînement ne tourne que s'il y a quelque chose à enchaîner. */
export function shouldAutoAdvance(options: { autoplay: boolean; reduced: boolean; paused: boolean; total: number; loop: boolean; index: number }): boolean {
  const { autoplay, reduced, paused, total, loop, index } = options
  if (!autoplay || reduced || paused || total < 2) return false
  if (!loop && index >= total - 1) return false
  return true
}
