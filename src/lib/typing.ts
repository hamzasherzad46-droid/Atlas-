/**
 * Typing engine for the answer word. Pure functions, no React.
 *
 * Every keystroke is checked against all accepted answers (name + synonyms).
 * A letter is correct if the typed text is still a prefix of at least one
 * accepted answer; otherwise it is rejected (not inserted) and counts as an error.
 */

/** Lower-case, strip accents, keep letters and single spaces. */
export function normalizeAnswer(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Accepted answers in priority order, de-duplicated. The first one is the display answer. */
export function acceptedAnswers(name: string, synonyms: string[], extra: string[] = []): string[] {
  const out: string[] = []
  for (const s of [name, ...synonyms, ...extra]) {
    const n = normalizeAnswer(s)
    if (n && !out.includes(n)) out.push(n)
  }
  return out
}

export type KeyInput = { type: 'char'; char: string } | { type: 'backspace' } | { type: 'enter' } | { type: 'hint' }

export type KeyResult =
  | 'correct' // letter accepted
  | 'wrong' // letter rejected
  | 'deleted'
  | 'complete' // buffer now equals an accepted answer
  | 'ignored'

export interface TypingState {
  buffer: string
  /** True when the buffer is a full answer and a longer answer continues with another word; Enter confirms. */
  awaitingEnter: boolean
}

export const emptyTyping: TypingState = { buffer: '', awaitingEnter: false }

/**
 * Medium difficulty: which letters of the answer are shown as clues. Always the first letter, then about a
 * quarter of the rest, picked by a hash of the word so the clue stays put while typing. Short words get one
 * letter; at least two letters always stay hidden.
 */
export function revealedLetters(answer: string): Set<number> {
  const letters = [...answer].map((ch, i) => (ch === ' ' ? -1 : i)).filter((i) => i >= 0)
  if (!letters.length) return new Set()
  const count = Math.max(1, Math.min(letters.length - 2, Math.round(letters.length * 0.25)))
  let h = 2166136261
  for (const ch of answer) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0
  const rest = letters.slice(1)
  // Deterministic shuffle of the remaining letters.
  for (let i = rest.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0
    const j = h % (i + 1)
    ;[rest[i], rest[j]] = [rest[j], rest[i]]
  }
  return new Set([letters[0], ...rest.slice(0, count - 1)])
}

/** The answer the student is currently heading towards (used for ghost letters / dashes). */
export function activeAnswer(buffer: string, answers: string[]): string {
  return answers.find((a) => a.startsWith(buffer)) ?? answers[0] ?? ''
}

function settle(buffer: string, answers: string[]): { state: TypingState; result: KeyResult } {
  const exact = answers.includes(buffer)
  if (!exact) return { state: { buffer, awaitingEnter: false }, result: 'correct' }
  // Never finish a word for the student. The word on screen is the highest-priority answer that starts with what's
  // typed; if it is longer ("metacarpal" typed, "metacarpals" shown; "delt" typed, "deltoid" shown), they are still
  // spelling it, so wait for more letters — or Enter, to settle for the shorter accepted form.
  // A lower-priority longer form ("temporal bone" shown, "temporal bones" also accepted) doesn't hold things up.
  const shown = activeAnswer(buffer, answers)
  const anotherWord = answers.some((a) => a.startsWith(buffer + ' '))
  if (shown !== buffer || anotherWord) return { state: { buffer, awaitingEnter: true }, result: 'correct' }
  return { state: { buffer, awaitingEnter: false }, result: 'complete' }
}

export function applyKey(state: TypingState, input: KeyInput, answers: string[]): { state: TypingState; result: KeyResult } {
  const { buffer } = state
  switch (input.type) {
    case 'backspace': {
      if (!buffer) return { state, result: 'ignored' }
      const next = buffer.slice(0, -1)
      return { state: { buffer: next, awaitingEnter: answers.includes(next) && next.length > 0 }, result: 'deleted' }
    }
    case 'enter':
      return answers.includes(buffer) ? { state: { buffer, awaitingEnter: false }, result: 'complete' } : { state, result: 'ignored' }
    case 'hint': {
      const target = activeAnswer(buffer, answers)
      if (!target.startsWith(buffer) || buffer.length >= target.length) return { state, result: 'ignored' }
      return settle(buffer + target[buffer.length], answers)
    }
    case 'char': {
      const ch = input.char.toLowerCase()
      if (ch === ' ') {
        // Ignore leading/double spaces silently rather than punishing them.
        if (!buffer || buffer.endsWith(' ')) return { state, result: 'ignored' }
      } else if (!/^[a-z]$/.test(ch)) {
        return { state, result: 'ignored' }
      }
      const next = buffer + ch
      if (!answers.some((a) => a.startsWith(next))) return { state, result: 'wrong' }
      return settle(next, answers)
    }
  }
}
