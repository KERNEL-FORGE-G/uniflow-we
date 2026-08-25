import { APPWRITE_BUCKET_ID, APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID } from './appwrite'

/**
 * Asset de marque publié avec une permission de lecture limitée à ce fichier.
 * Les icônes PWA restent locales : le logo horizontal n’est pas adapté à ces formats carrés.
 */
export const UNIFLOW_PRIMARY_LOGO_FILE_ID = 'uniflow_primary_logo'
export const UNIFLOW_PRIMARY_LOGO_URL = `${APPWRITE_ENDPOINT}/storage/buckets/${APPWRITE_BUCKET_ID}/files/${UNIFLOW_PRIMARY_LOGO_FILE_ID}/view?project=${encodeURIComponent(APPWRITE_PROJECT_ID)}`
export const UNIFLOW_PRIMARY_LOGO_FALLBACK_URL = '/logos/uniflow-primary-original.png'
export const UNIFLOW_PRIMARY_LOGO_ALT = 'UniFlow — logo officiel'
