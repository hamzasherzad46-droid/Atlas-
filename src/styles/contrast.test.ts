import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/**
 * WCAG 2.1 AA contrast for the colour tokens, read straight from the stylesheets so a token change
 * cannot slip through: 4.5:1 for text, 3:1 for icons, focus rings and selection marks.
 */
const css = (f: string) => readFileSync(fileURLToPath(new URL(f, import.meta.url)), 'utf8')
const global = css('./global.css')
const quiz = css('../quiz/quiz.css')

/** The hex custom properties declared in the first block whose selector starts with `selector`. */
function tokens(source: string, selector: string): Record<string, string> {
  const start = source.indexOf(selector)
  if (start < 0) throw new Error(`No block for ${selector}`)
  const body = source.slice(source.indexOf('{', start) + 1, source.indexOf('}', start))
  const out: Record<string, string> = {}
  for (const m of body.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})\b/g)) out[m[1]] = m[2].toLowerCase()
  return out
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

const themes = {
  dark: tokens(global, ":root,\n:root[data-theme='dark']"),
  light: tokens(global, ":root[data-theme='light']"),
}
const card = tokens(quiz, '.face {')

/** Text colours and the backgrounds they are set on. */
const TEXT: [fg: string, bg: string][] = [
  ['ink', 'paper'],
  ['ink-2', 'paper'],
  ['ink-3', 'paper'],
  ['accent', 'paper'],
  ['copper', 'paper'],
  ['good', 'paper'],
  ['bad', 'paper'],
  ['warn', 'paper'],
  // A chosen course and the pinned label in 3D sit on the second paper.
  ['ink', 'paper-2'],
  ['ink-2', 'paper-2'],
  // Primary buttons and the typing keyboard.
  ['on-accent', 'accent-fill'],
  ['ink', 'key'],
  ['ink', 'key-alt'],
]

/** Flashcards are parchment in both themes with their own ink. */
const CARD_TEXT = ['ink', 'ink-2', 'copper', 'good', 'bad']

/** Icons, focus rings and the brass underline of a selected option. */
const NON_TEXT: [fg: string, bg: string][] = [
  ['accent', 'paper'],
  ['ink-3', 'paper'],
]

describe('colour contrast (WCAG AA)', () => {
  for (const [name, t] of Object.entries(themes)) {
    it(`${name} theme: text is at least 4.5:1`, () => {
      for (const [fg, bg] of TEXT) {
        expect(t[fg], `${name} --${fg}`).toBeDefined()
        expect(t[bg], `${name} --${bg}`).toBeDefined()
        expect(contrast(t[fg], t[bg]), `${name}: --${fg} on --${bg}`).toBeGreaterThanOrEqual(4.5)
      }
    })

    it(`${name} theme: flashcard text is at least 4.5:1 on parchment`, () => {
      for (const fg of CARD_TEXT) {
        const colour = card[fg] ?? (fg === 'ink' ? t['parchment-ink'] : undefined)
        expect(colour, `card --${fg}`).toBeDefined()
        expect(contrast(colour!, t.parchment), `${name}: card --${fg} on --parchment`).toBeGreaterThanOrEqual(4.5)
      }
    })

    it(`${name} theme: icons, focus rings and selection marks are at least 3:1`, () => {
      for (const [fg, bg] of NON_TEXT) expect(contrast(t[fg], t[bg]), `${name}: --${fg} on --${bg}`).toBeGreaterThanOrEqual(3)
    })
  }

  it('reads the real tokens', () => {
    expect(themes.dark.paper).toBe('#171614')
    expect(themes.light.paper).toBe('#e8ddc5')
    expect(contrast('#000000', '#ffffff')).toBeCloseTo(21, 5)
  })
})
