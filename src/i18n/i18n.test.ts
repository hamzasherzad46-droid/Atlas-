import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import coursesJson from '../../content/courses.json'
import changedJson from './changed-english.json'
import { en, type MessageKey } from './en'
import { translate } from './index'
import { translations } from './translations'
import { LANGS, OFFERED_LANGS, shownLang } from '../state/settings'

/** Keys that are intentionally the same in every language (brand, units, dev-only tools). */
const UNTRANSLATED: MessageKey[] = ['app.name', 'explore.copy', 'explore.copied']
const LANG_NAMES: Record<string, string> = { fr: 'French', de: 'German', ar: 'Arabic', ru: 'Russian', zh: 'Chinese', ko: 'Korean' }
const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort()
const reportPath = fileURLToPath(new URL('../../TRANSLATION-REVIEW.md', import.meta.url))
const changed = changedJson.changed as Record<string, string>
const cell = (s: string) => s.replace(/\|/g, '\\|')

/**
 * The review list for native speakers: per language, the keys with no translation (shown in English),
 * keys whose English changed after translation, and translations identical to English. Course focus
 * module titles come from content/courses.json and have no translation yet.
 */
function buildReport(): string {
  const keys = Object.keys(en) as MessageKey[]
  const focus = (coursesJson as { focus: { id: string; title: string }[] }).focus
  const out: string[] = [
    '# Translation review',
    '',
    'For native speakers of the six other UI languages. English (`src/i18n/en.ts`) is the source. These languages are hidden in the app until reviewed (`OFFERED_LANGS` in `src/state/settings.ts`); once offered, any string still missing is shown in English.',
    '',
    'This file is generated: run `npm run i18n:report` after changing UI strings. `npm test` fails if it is out of date, so nothing missing can go unnoticed. The anatomy content (structure names, notes, topics, plates and mock exams) is English by design and is not listed here.',
    '',
  ]
  for (const [lang, dict] of Object.entries(translations)) {
    const d = (dict ?? {}) as Record<string, string>
    const missing = keys.filter((k) => !UNTRANSLATED.includes(k) && !d[k])
    const stale = keys.filter((k) => d[k] && changed[k])
    const same = keys.filter((k) => !UNTRANSLATED.includes(k) && d[k] && d[k] === en[k])
    out.push(`## ${LANG_NAMES[lang] ?? lang} (\`${lang}\`)`, '')
    out.push(`### Missing: shown in English (${missing.length + focus.length})`, '')
    if (missing.length + focus.length) {
      out.push('| Key | English |', '| --- | --- |')
      for (const k of missing) out.push(`| \`${k}\` | ${cell(en[k])} |`)
      for (const f of focus) out.push(`| \`module.${f.id}\` | ${cell(f.title)} |`)
    } else out.push('None.')
    out.push('', `### English changed since it was translated (${stale.length})`, '')
    if (stale.length) {
      out.push('| Key | Current English | Change | Current translation |', '| --- | --- | --- | --- |')
      for (const k of stale) out.push(`| \`${k}\` | ${cell(en[k])} | ${cell(changed[k])} | ${cell(d[k])} |`)
    } else out.push('None.')
    out.push('', `### Identical to English (${same.length}): check whether this is intended`, '')
    if (same.length) {
      out.push('| Key | Text |', '| --- | --- |')
      for (const k of same) out.push(`| \`${k}\` | ${cell(d[k])} |`)
    } else out.push('None.')
    out.push('')
  }
  return out.join('\n')
}

describe('translations', () => {
  it('every key that exists in another language has the same placeholders as English', () => {
    for (const [lang, dict] of Object.entries(translations)) {
      for (const [k, v] of Object.entries(dict ?? {})) {
        expect(k in en, `${lang} has a key English does not: ${k}`).toBe(true)
        expect(placeholders(v), `${lang} ${k}`).toEqual(placeholders(en[k as MessageKey]))
      }
    }
  })

  it('TRANSLATION-REVIEW.md lists everything missing or out of date (run npm run i18n:report)', () => {
    const report = buildReport()
    if (process.env.UPDATE_TRANSLATION_REVIEW) writeFileSync(reportPath, report)
    expect(existsSync(reportPath)).toBe(true)
    expect(readFileSync(reportPath, 'utf8')).toBe(report)
  })

  it('fills placeholders with localised numbers and falls back to English', () => {
    expect(translate('de', 'mod.seen', { a: 3, b: 5 })).toBe('3 von 5 gesehen')
    expect(translate('ar', 'mod.seen', { a: 3, b: 5 })).toMatch(/^شوهد [3٣] من [5٥]$/)
    expect(translate('fr', 'app.name')).toBe('Atlas')
    expect(translate('fr', 'course.change')).toBe(en['course.change'])
  })
})

describe('offered languages', () => {
  it('offers only English until the other translations are reviewed', () => {
    expect(OFFERED_LANGS).toEqual(['en'])
  })

  it('shows English to a student who chose a language that is now hidden, and keeps their choice', () => {
    expect(shownLang('fr')).toBe('en')
    expect(shownLang('ar')).toBe('en')
    expect(shownLang('en')).toBe('en')
    expect(translate(shownLang('de'), 'tab.today')).toBe(en['tab.today'])
  })

  it('every offered language has its translations', () => {
    for (const l of OFFERED_LANGS) expect(LANGS).toContain(l)
  })
})
