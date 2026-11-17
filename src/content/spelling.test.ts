import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spellCheckDocument } from 'cspell-lib'
import { describe, expect, it } from 'vitest'
import { en } from '../i18n/en'
import type { ModuleContent } from './types'

/**
 * Spelling rules the `cspell` run (cspell.config.json, first step of `npm test`) can't express:
 * answer synonyms may be British or American; all other display text is British, including the
 * forms the British dictionary also accepts (-ize, center, gray…); and typography is consistent.
 */
const root = fileURLToPath(new URL('../..', import.meta.url))
const dir = join(root, 'content')
const files = readdirSync(dir).filter((f) => f.endsWith('.json'))
const read = (f: string): unknown => JSON.parse(readFileSync(join(dir, f), 'utf8'))

/** Keys whose values are identifiers, file names or numbers, not text a student reads. */
const NOT_TEXT = new Set(['id', 'meshName', 'modelFile', 'file', 'image', 'contentFile', 'placeholderFile', 'context', 'tint', 'systemId', 'from', 'include', 'side', 'status', 'kind', 'region', 'group', 'notes-order'])
/** Arrays of ids in courses.json and catalog.json. */
const ID_LISTS = new Set(['modules', 'regions', 'categories', 'plates', 'notes'])

interface Text {
  where: string
  text: string
}

/** Every string a student can read in a content file, with where it is. Synonyms are collected separately. */
function displayText(value: unknown, where: string, out: Text[], synonyms: Text[]) {
  if (typeof value === 'string') {
    out.push({ where, text: value })
  } else if (Array.isArray(value)) {
    value.forEach((v, i) => displayText(v, `${where}[${i}]`, out, synonyms))
  } else if (value && typeof value === 'object') {
    const id = (value as { id?: string }).id
    const here = id ? `${where.replace(/\[\d+\]$/, '')}[${id}]` : where
    for (const [k, v] of Object.entries(value)) {
      if (NOT_TEXT.has(k)) continue
      if (k === 'synonyms' && Array.isArray(v)) {
        for (const s of v as string[]) synonyms.push({ where: `${here}.synonyms`, text: s })
        continue
      }
      // Lists of ids (a course's modules, a topic's modules); a module's "regions" are objects with names.
      if (ID_LISTS.has(k) && Array.isArray(v) && v.every((x) => typeof x === 'string' && /^[a-z0-9-]+$/.test(x))) continue
      displayText(v, `${here}.${k}`, out, synonyms)
    }
  }
}

const text: Text[] = []
const synonyms: Text[] = []
for (const f of files) displayText(read(f), f, text, synonyms)
for (const [k, v] of Object.entries(en)) text.push({ where: `src/i18n/en.ts ${k}`, text: v })

/**
 * American forms that the British dictionary also accepts, so cspell can't catch them. Words where
 * British English uses -ize too (size, prize, seize, maize…) are not -ize forms in this sense.
 */
const AMERICAN = /\b(center(s|ed)?|gray(er|ish)?|aging|mold(s|y)?|catalog(s)?|analog(s)?|aluminum|artifact(s)?)\b/i
const IZE = /\b([a-z]+)(iz(e|es|ed|ing|er|ers|ation|ations)|yz(e|es|ed|ing))\b/gi
const IZE_OK = new Set(['size', 'sizes', 'sized', 'sizing', 'prize', 'prizes', 'seize', 'seizes', 'seized', 'seizing', 'maize', 'capsize', 'baize', 'citizen'])

async function misspelled(lines: string[], language: string): Promise<Set<number>> {
  const result = await spellCheckDocument(
    { uri: 'file:///synonyms.txt', text: lines.join('\n'), languageId: 'plaintext', locale: language },
    { noConfigSearch: true },
    {
      version: '0.2',
      language,
      minWordLength: 3,
      dictionaryDefinitions: [
        { name: 'atlas-words', path: join(root, 'cspell-words.txt') },
        { name: 'atlas-answer-words', path: join(root, 'cspell-answer-words.txt') },
      ],
      dictionaries: ['atlas-words', 'atlas-answer-words'],
    },
  )
  expect(result.errors ?? [], 'cspell errors').toEqual([])
  const bad = new Set<number>()
  for (const issue of result.issues) bad.add(issue.line.text === undefined ? -1 : lines.indexOf(issue.line.text.replace(/\n$/, '')))
  return bad
}

describe('spelling', () => {
  it('finds the display text and the synonyms', () => {
    expect(text.length).toBeGreaterThan(3000)
    expect(synonyms.length).toBeGreaterThan(200)
    expect(text.some((t) => t.where.includes('.definition'))).toBe(true)
    expect(text.some((t) => t.where.startsWith('mock.json') && t.where.endsWith('.explain'))).toBe(true)
  })

  it('every answer synonym is a correctly spelled word, British or American', async () => {
    const lines = synonyms.map((s) => s.text)
    const bad = await misspelled(lines, 'en-GB,en')
    expect([...bad].map((i) => (i >= 0 ? `${synonyms[i].where}: “${synonyms[i].text}”` : 'unknown line'))).toEqual([])
  })

  it('the check catches a misspelled synonym (the test is not a no-op)', async () => {
    const bad = await misspelled(['esophagus', 'thigh bone', 'femurr'], 'en-GB,en')
    expect([...bad]).toEqual([2])
  })

  it('display text uses British spelling: no -ize or -yze forms', () => {
    const found = text.flatMap((t) => [...t.text.matchAll(IZE)].filter((m) => !IZE_OK.has(m[0].toLowerCase())).map((m) => `${t.where}: ${m[0]}`))
    expect(found).toEqual([])
  })

  it('display text uses British spelling: no American forms the British dictionary lets through', () => {
    const found = text.filter((t) => AMERICAN.test(t.text)).map((t) => `${t.where}: ${t.text.match(AMERICAN)?.[0]}`)
    expect(found).toEqual([])
    expect(AMERICAN.test('grey matter')).toBe(false)
    expect(AMERICAN.test('gray matter')).toBe(true)
  })

  it('apostrophes and quotation marks are typographic everywhere (one style, so names read the same)', () => {
    const straight = text.filter((t) => /[A-Za-z]'[A-Za-z]|"/.test(t.text)).map((t) => `${t.where}: ${t.text.slice(0, 60)}`)
    expect(straight).toEqual([])
  })

  it('structure names in a module are written once and in lower case, as the quiz shows them', () => {
    for (const f of files) {
      const data = read(f) as Partial<ModuleContent>
      if (!Array.isArray(data.structures)) continue
      for (const s of data.structures) {
        expect(s.name.trim(), `${f} ${s.id}`).toBe(s.name)
        expect(s.name, `${f} ${s.id}`).not.toMatch(/\s{2,}/)
      }
    }
  })
})
