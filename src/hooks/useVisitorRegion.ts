/**
 * useVisitorRegion — détecte la région du visiteur via son fuseau horaire.
 * Zéro requête réseau, zéro dépendance externe, RGPD-friendly.
 *
 * Renvoie :
 *  - countryCode  : code ISO 2 lettres estimé (ex. "CM", "FR", "US")
 *  - isAfrica     : true si le timezone appartient à la zone africaine
 *  - isAfrophone  : true si pays francophone d'Afrique subsaharienne
 *  - currency     : devise probable ("XAF" | "XOF" | "EUR" | "USD" | "GBP" | ...)
 *  - timezone     : Intl.DateTimeFormat().resolvedOptions().timeZone brut
 */

export type VisitorRegion = {
  countryCode: string
  isAfrica: boolean
  isAfrophone: boolean
  currency: 'XAF' | 'XOF' | 'EUR' | 'USD' | 'GBP' | 'NGN' | 'KES' | 'ZAR' | 'EGP' | string
  timezone: string
}

/** Mapping timezone -> { countryCode, currency } pour l'Afrique */
const AFRICA_TZ: Record<string, { cc: string; currency: string; afrophone?: boolean }> = {
  // Afrique centrale (CEMAC — XAF)
  'Africa/Douala':       { cc: 'CM', currency: 'XAF', afrophone: true },
  'Africa/Bangui':       { cc: 'CF', currency: 'XAF', afrophone: true },
  'Africa/Brazzaville':  { cc: 'CG', currency: 'XAF', afrophone: true },
  'Africa/Kinshasa':     { cc: 'CD', currency: 'CDF', afrophone: true },
  'Africa/Libreville':   { cc: 'GA', currency: 'XAF', afrophone: true },
  'Africa/Malabo':       { cc: 'GQ', currency: 'XAF', afrophone: true },
  'Africa/Ndjamena':     { cc: 'TD', currency: 'XAF', afrophone: true },
  'Africa/Lubumbashi':   { cc: 'CD', currency: 'CDF', afrophone: true },
  // Afrique de l'Ouest (UEMOA — XOF)
  'Africa/Abidjan':      { cc: 'CI', currency: 'XOF', afrophone: true },
  'Africa/Dakar':        { cc: 'SN', currency: 'XOF', afrophone: true },
  'Africa/Bamako':       { cc: 'ML', currency: 'XOF', afrophone: true },
  'Africa/Ouagadougou':  { cc: 'BF', currency: 'XOF', afrophone: true },
  'Africa/Lome':         { cc: 'TG', currency: 'XOF', afrophone: true },
  'Africa/Porto-Novo':   { cc: 'BJ', currency: 'XOF', afrophone: true },
  'Africa/Conakry':      { cc: 'GN', currency: 'GNF', afrophone: true },
  'Africa/Bissau':       { cc: 'GW', currency: 'XOF', afrophone: true },
  'Africa/Niamey':       { cc: 'NE', currency: 'XOF', afrophone: true },
  // Afrique anglophone
  'Africa/Lagos':        { cc: 'NG', currency: 'NGN' },
  'Africa/Accra':        { cc: 'GH', currency: 'GHS' },
  'Africa/Nairobi':      { cc: 'KE', currency: 'KES' },
  'Africa/Dar_es_Salaam':{ cc: 'TZ', currency: 'TZS' },
  'Africa/Kampala':      { cc: 'UG', currency: 'UGX' },
  'Africa/Khartoum':     { cc: 'SD', currency: 'SDG' },
  'Africa/Addis_Ababa':  { cc: 'ET', currency: 'ETB' },
  'Africa/Johannesburg': { cc: 'ZA', currency: 'ZAR' },
  'Africa/Harare':       { cc: 'ZW', currency: 'ZWL' },
  'Africa/Lusaka':       { cc: 'ZM', currency: 'ZMW' },
  'Africa/Maputo':       { cc: 'MZ', currency: 'MZN' },
  'Africa/Luanda':       { cc: 'AO', currency: 'AOA' },
  // Afrique du Nord
  'Africa/Cairo':        { cc: 'EG', currency: 'EGP' },
  'Africa/Tunis':        { cc: 'TN', currency: 'TND', afrophone: true },
  'Africa/Algiers':      { cc: 'DZ', currency: 'DZD', afrophone: true },
  'Africa/Casablanca':   { cc: 'MA', currency: 'MAD', afrophone: true },
  'Africa/Tripoli':      { cc: 'LY', currency: 'LYD' },
  // Îles africaines
  'Indian/Antananarivo': { cc: 'MG', currency: 'MGA', afrophone: true },
  'Indian/Mauritius':    { cc: 'MU', currency: 'MUR' },
  'Africa/Mbabane':      { cc: 'SZ', currency: 'SZL' },
}

/** Devises par région pour les pays hors Afrique */
const REGION_CURRENCY: Record<string, string> = {
  'Europe/Paris':    'EUR', 'Europe/Brussels': 'EUR', 'Europe/Berlin': 'EUR',
  'Europe/Madrid':   'EUR', 'Europe/Rome':     'EUR', 'Europe/Amsterdam': 'EUR',
  'Europe/London':   'GBP',
  'America/New_York':'USD', 'America/Chicago': 'USD', 'America/Los_Angeles': 'USD',
  'America/Toronto': 'CAD', 'America/Montreal': 'CAD',
  'Asia/Dubai':      'AED', 'Asia/Riyadh':     'SAR',
  'Asia/Tokyo':      'JPY', 'Asia/Shanghai':   'CNY',
}

function detectRegion(): VisitorRegion {
  let tz = 'UTC'
  try {
    tz = Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    // navigateur très ancien
  }

  // Recherche exacte dans la map africaine
  const africaEntry = AFRICA_TZ[tz]
  if (africaEntry) {
    return {
      countryCode: africaEntry.cc,
      isAfrica: true,
      isAfrophone: africaEntry.afrophone ?? false,
      currency: africaEntry.currency,
      timezone: tz,
    }
  }

  // Préfixe Africa/ non listé -> toujours africain
  if (tz.startsWith('Africa/') || tz.startsWith('Indian/')) {
    return {
      countryCode: 'AF',
      isAfrica: true,
      isAfrophone: false,
      currency: 'USD',
      timezone: tz,
    }
  }

  // Europe -> EUR/GBP par défaut
  if (tz.startsWith('Europe/')) {
    return {
      countryCode: tz === 'Europe/London' ? 'GB' : 'FR',
      isAfrica: false,
      isAfrophone: false,
      currency: REGION_CURRENCY[tz] ?? (tz === 'Europe/London' ? 'GBP' : 'EUR'),
      timezone: tz,
    }
  }

  // Americas
  if (tz.startsWith('America/')) {
    const cc = tz.includes('Toronto') || tz.includes('Montreal') || tz.includes('Vancouver') ? 'CA' : 'US'
    return {
      countryCode: cc,
      isAfrica: false,
      isAfrophone: false,
      currency: REGION_CURRENCY[tz] ?? 'USD',
      timezone: tz,
    }
  }

  // Fallback : inconnu -> on traite comme international
  return {
    countryCode: 'INT',
    isAfrica: false,
    isAfrophone: false,
    currency: 'USD',
    timezone: tz,
  }
}

// Singleton en module pour éviter de recalculer à chaque render
let _cached: VisitorRegion | null = null

export function useVisitorRegion(): VisitorRegion {
  if (!_cached) {
    _cached = detectRegion()
  }
  return _cached
}

/** Utilitaire pur (sans hook) pour les composants server-side ou les tests */
export { detectRegion }
