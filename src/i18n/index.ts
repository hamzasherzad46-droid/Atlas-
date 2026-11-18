import { useCallback } from 'react'
import { shownLang, useSettings, type Lang } from '../state/settings'
import { en, type MessageKey } from './en'
import { translations } from './translations'

export type { MessageKey }
export type Vars = Record<string, string | number>

export const RTL_LANGS = new Set<Lang>(['ar'])

/** Native names for the language picker. */
export const LANG_NAMES: Record<Lang, string> = {
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
  ar: 'العربية',
  ru: 'Русский',
  zh: '中文',
  ko: '한국어',
}

/** The locale for dates and numbers: Atlas's English is British ("Wednesday 18 November", "1,240"). */
export function locale(lang: Lang): string {
  return lang === 'en' ? 'en-GB' : lang
}

export function translate(lang: Lang, key: MessageKey, vars?: Vars): string {
  const text: string = translations[lang]?.[key] ?? en[key] ?? key
  if (!vars) return text
  return text.replace(/\{(\w+)\}/g, (_, k: string) => {
    const v = vars[k]
    return v === undefined ? `{${k}}` : typeof v === 'number' ? new Intl.NumberFormat(locale(lang)).format(v) : v
  })
}

/** Keys built at runtime (e.g. `system.${id}`) fall back to `fallback` if there is no translation. */
export function translateDynamic(lang: Lang, key: string, fallback: string): string {
  return (translations[lang] as Record<string, string> | undefined)?.[key] ?? (en as Record<string, string>)[key] ?? fallback
}

export function useT() {
  const lang = useSettings((s) => shownLang(s.lang))
  const t = useCallback((key: MessageKey, vars?: Vars) => translate(lang, key, vars), [lang])
  const td = useCallback((key: string, fallback: string) => translateDynamic(lang, key, fallback), [lang])
  // Numbers shown on their own (counts, scores) in the language's digits and grouping: 1,240.
  const n = useCallback((v: number) => new Intl.NumberFormat(locale(lang)).format(v), [lang])
  /** A whole percentage (0–100) as the language writes it: "45%", "45 %". */
  const percent = useCallback((v: number) => new Intl.NumberFormat(locale(lang), { style: 'percent' }).format(v / 100), [lang])
  return Object.assign(t, { lang, locale: locale(lang), td, n, percent })
}

/** Apply lang and text direction to <html> (for the language shown, which may not be the one saved). */
export function applyLang(saved: Lang) {
  const lang = shownLang(saved)
  document.documentElement.lang = lang
  document.documentElement.dir = RTL_LANGS.has(lang) ? 'rtl' : 'ltr'
}
