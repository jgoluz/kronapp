import { pt } from './pt'
import { es } from './es'
import { en } from './en'

export type Language = 'pt' | 'es' | 'en'
export type Translations = typeof pt

const translations: Record<Language, Translations> = { pt, es, en }

export function getTranslations(lang: Language): Translations {
  return translations[lang] ?? translations.pt
}

export { pt, es, en }
