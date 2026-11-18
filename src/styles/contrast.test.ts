import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/**
 * WCAG 2.1 AA contrast for the colour tokens, read straight from the stylesheets so a token change
 * cannot slip through: 4.5:1 for text, 3:1 for icons, focus rings and selection marks.
 */
const css = (f: string) => readFileSync(fileURLToPath(new URL(f, import.meta.url)), 'utf8')
const global = css('./global.css')

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

/** Text colours and the backgrounds they are set on (panels are the page colour; fields a hair off it). */
const TEXT: [fg: string, bg: string][] = [
  ['fg', 'bg'],
  ['fg-2', 'bg'],
  ['accent', 'bg'],
  ['bad', 'bg'],
  ['fg', 'bg-2'],
  ['fg-2', 'bg-2'],
]

/** Icons, focus rings, selection marks and the accent progress line. */
const NON_TEXT: [fg: string, bg: string][] = [
  ['accent', 'bg'],
  ['fg', 'bg'],
]

/** Decoration only (ticks, chevrons, dashes): never used for text, so not held to 4.5:1. */
const DECORATION = ['fg-3']

describe('colour contrast (WCAG AA)', () => {
  for (const [name, t] of Object.entries(themes)) {
    it(`${name} theme: text is at least 4.5:1`, () => {
      for (const [fg, bg] of TEXT) {
        expect(t[fg], `${name} --${fg}`).toBeDefined()
        expect(t[bg], `${name} --${bg}`).toBeDefined()
        expect(contrast(t[fg], t[bg]), `${name}: --${fg} on --${bg}`).toBeGreaterThanOrEqual(4.5)
      }
    })

    it(`${name} theme: icons, focus rings and selection marks are at least 3:1`, () => {
      for (const [fg, bg] of NON_TEXT) expect(contrast(t[fg], t[bg]), `${name}: --${fg} on --${bg}`).toBeGreaterThanOrEqual(3)
    })

    it(`${name} theme: the decoration grey is visible but quieter than text`, () => {
      for (const d of DECORATION) {
        expect(contrast(t[d], t.bg), `${name}: --${d}`).toBeGreaterThanOrEqual(2)
        expect(contrast(t[d], t.bg), `${name}: --${d}`).toBeLessThan(contrast(t['fg-2'], t.bg))
      }
    })
  }

  it('reads the real tokens', () => {
    expect(themes.dark.bg).toBe('#000000')
    expect(themes.light.bg).toBe('#ffffff')
    expect(contrast('#000000', '#ffffff')).toBeCloseTo(21, 5)
  })
})
