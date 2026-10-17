import type { VercelRequest, VercelResponse } from '@vercel/node'

export interface ApiLanguage {
  code: string
  name: string
  nativeName: string
  zlibKey: string
  flag: string
}

export const ZLIB_LANGUAGES: ApiLanguage[] = [
  { code: 'fr', name: 'Français', nativeName: 'Français', zlibKey: 'french', flag: '🇫🇷' },
  { code: 'en', name: 'Anglais', nativeName: 'English', zlibKey: 'english', flag: '🇬🇧' },
  { code: 'es', name: 'Espagnol', nativeName: 'Español', zlibKey: 'spanish', flag: '🇪🇸' },
  { code: 'de', name: 'Allemand', nativeName: 'Deutsch', zlibKey: 'german', flag: '🇩🇪' },
  { code: 'it', name: 'Italien', nativeName: 'Italiano', zlibKey: 'italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portugais', nativeName: 'Português', zlibKey: 'portuguese', flag: '🇵🇹' },
  { code: 'ru', name: 'Russe', nativeName: 'Русский', zlibKey: 'russian', flag: '🇷🇺' },
  { code: 'ar', name: 'Arabe', nativeName: 'العربية', zlibKey: 'arabic', flag: '🇸🇦' },
  { code: 'zh', name: 'Chinois', nativeName: '中文', zlibKey: 'chinese', flag: '🇨🇳' },
  { code: 'ja', name: 'Japonais', nativeName: '日本語', zlibKey: 'japanese', flag: '🇯🇵' },
  { code: 'nl', name: 'Néerlandais', nativeName: 'Nederlands', zlibKey: 'dutch', flag: '🇳🇱' },
  { code: 'pl', name: 'Polonais', nativeName: 'Polski', zlibKey: 'polish', flag: '🇵🇱' },
  { code: 'tr', name: 'Turc', nativeName: 'Türkçe', zlibKey: 'turkish', flag: '🇹🇷' },
  { code: 'la', name: 'Latin', nativeName: 'Lingua Latina', zlibKey: 'latin', flag: '🏛️' },
  { code: 'el', name: 'Grec', nativeName: 'Ελληνικά', zlibKey: 'greek', flag: '🇬🇷' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', zlibKey: 'hindi', flag: '🇮🇳' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', zlibKey: 'swahili', flag: '🇰🇪' },
  { code: 'ko', name: 'Coréen', nativeName: '한국어', zlibKey: 'korean', flag: '🇰🇷' },
]

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const query = ((req.query.q as string) || '').trim().toLowerCase()

  let list = ZLIB_LANGUAGES
  if (query) {
    list = list.filter(
      (l) =>
        l.code.toLowerCase().includes(query) ||
        l.name.toLowerCase().includes(query) ||
        l.nativeName.toLowerCase().includes(query) ||
        l.zlibKey.toLowerCase().includes(query)
    )
  }

  return res.status(200).json({
    ok: true,
    total: list.length,
    languages: list,
  })
}
