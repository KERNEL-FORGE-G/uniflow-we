import { APPWRITE_BUCKET_ID, APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID } from './appwrite'

/**
 * Asset de marque publié avec une permission de lecture limitée à ce fichier.
 * Les icônes PWA restent locales : le logo horizontal n’est pas adapté à ces formats carrés.
 */
export const UNIFLOW_PRIMARY_LOGO_FILE_ID = 'uniflow_primary_logo'
export const UNIFLOW_PRIMARY_LOGO_URL = `${APPWRITE_ENDPOINT}/storage/buckets/${APPWRITE_BUCKET_ID}/files/${UNIFLOW_PRIMARY_LOGO_FILE_ID}/view?project=${encodeURIComponent(APPWRITE_PROJECT_ID)}`
export const UNIFLOW_PRIMARY_LOGO_FALLBACK_URL = '/logos/uniflow-primary-original.png'
export const UNIFLOW_PRIMARY_LOGO_ALT = 'UniFlow — logo officiel'

/**
 * Logo vectorisé (2026-09-21). Les PNG d'origine sont des rendus bitmap aux
 * bords adoucis : réduits à 32–48 px de haut, ou posés sur les fonds bleus,
 * ils paraissaient flous. Les SVG sont tracés depuis ces PNG (toque, « U »
 * en dégradé, traces blanches, texte) et restent nets à toute taille.
 * La version blanche sert sur les fonds bleus/sombres ; ses traces de circuit
 * sont des creux, pour laisser passer le fond.
 */
export const UNIFLOW_WORDMARK_SVG = '/logos/uniflow-wordmark.svg'
export const UNIFLOW_WORDMARK_WHITE_SVG = '/logos/uniflow-wordmark-white.svg'
export const UNIFLOW_EMBLEM_SVG = '/logos/uniflow-emblem.svg'
export const UNIFLOW_EMBLEM_WHITE_SVG = '/logos/uniflow-emblem-white.svg'

/** Illustration d'accueil originale, optimisée côté site pour un chargement fiable. */
export const UNIFLOW_LANDING_ILLUSTRATION_FALLBACK_URL = '/logos/uniflow-landing-original.webp'

/** Logo du groupe KERNEL FORGE (fourni le 2026-09-21), fond retiré ; servi avec le site. */
export const KERNEL_FORGE_LOGO_URL = '/logos/kernel-forge.webp'
export const KERNEL_FORGE_LOGO_FALLBACK_URL = '/logos/kernel-forge.png'
export const KERNEL_FORGE_LOGO_ALT = 'KERNEL FORGE — startup technologique, Yaoundé'
