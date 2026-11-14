import { describe, expect, it } from 'vitest'
import { acceptedAnswers, activeAnswer, applyKey, type KeyInput, emptyTyping, normalizeAnswer, revealedLetters, type TypingState } from './typing'
import { meshMatchesKey, meshSide, mostSpecific } from './meshMatch'
import { INTERVALS, isMissed, prioritise, updateRecord } from './srs'

function typeAll(text: string, answers: string[]) {
  let state: TypingState = emptyTyping
  const results: string[] = []
  for (const char of text) {
    const r = applyKey(state, { type: 'char', char }, answers)
    state = r.state
    results.push(r.result)
  }
  return { state, results }
}

describe('typing engine', () => {
  const clavicle = acceptedAnswers('clavicle', ['collarbone', 'collar bone'])

  it('normalises case, accents and punctuation', () => {
    expect(normalizeAnswer('  Médial–Epicondyle ')).toBe('medial epicondyle')
  })

  it('completes on the last correct letter, case-insensitively', () => {
    const { results } = typeAll('CLAVICLE', clavicle)
    expect(results.at(-1)).toBe('complete')
    expect(results.slice(0, -1).every((r) => r === 'correct')).toBe(true)
  })

  it('rejects wrong letters without inserting them', () => {
    const r = applyKey({ buffer: 'cla', awaitingEnter: false }, { type: 'char', char: 'x' }, clavicle)
    expect(r.result).toBe('wrong')
    expect(r.state.buffer).toBe('cla')
  })

  it('accepts synonyms and switches the active answer', () => {
    const { state, results } = typeAll('collar bone', clavicle)
    expect(results.at(-1)).toBe('complete')
    expect(activeAnswer('coll', clavicle)).toBe('collarbone')
    expect(state.buffer).toBe('collar bone')
  })

  it('supports multi-word answers with spaces', () => {
    const answers = acceptedAnswers('medial epicondyle', [])
    expect(typeAll('medial epicondyle', answers).results.at(-1)).toBe('complete')
    expect(applyKey(emptyTyping, { type: 'char', char: ' ' }, answers).result).toBe('ignored')
  })

  it('waits for Enter when a full answer is a prefix of a longer one', () => {
    const answers = acceptedAnswers('frontal bone', ['frontal'])
    const { state, results } = typeAll('frontal', answers)
    expect(results.at(-1)).toBe('correct')
    expect(state.awaitingEnter).toBe(true)
    expect(applyKey(state, { type: 'enter' }, answers).result).toBe('complete')
    expect(typeAll('frontal bone', answers).results.at(-1)).toBe('complete')
  })

  it('does not wait for Enter when a longer answer only adds letters (plurals)', () => {
    const answers = acceptedAnswers('temporal bone', ['temporal', 'temporal bones'])
    expect(typeAll('temporal bone', answers).results.at(-1)).toBe('complete')
    expect(typeAll('maxilla', acceptedAnswers('maxilla', ['maxillae'])).results.at(-1)).toBe('complete')
    // …but still waits when another word may follow.
    expect(typeAll('temporal', answers).state.awaitingEnter).toBe(true)
  })

  it('never finishes the word on screen for you', () => {
    // A shorter accepted form inside the displayed name must not end the question.
    const metacarpals = acceptedAnswers('metacarpals', ['metacarpal', 'metacarpal bones'])
    const typed = typeAll('metacarpal', metacarpals)
    expect(typed.results.at(-1)).toBe('correct')
    expect(typed.state.awaitingEnter).toBe(true)
    expect(applyKey(typed.state, { type: 'char', char: 's' }, metacarpals).result).toBe('complete')
    expect(applyKey(typed.state, { type: 'enter' }, metacarpals).result).toBe('complete')

    const deltoid = acceptedAnswers('deltoid', ['delt', 'delts'])
    expect(typeAll('delt', deltoid).results.at(-1)).toBe('correct')
    expect(typeAll('deltoid', deltoid).results.at(-1)).toBe('complete')
  })

  it('medium shows the first letter and a few more, never the whole word', () => {
    for (const word of ['ulna', 'scapula', 'inferior nasal concha', 'atlas', 'os']) {
      const shown = revealedLetters(word)
      const letters = [...word].filter((c) => c !== ' ').length
      expect(shown.has(0), word).toBe(true)
      expect(shown.size, word).toBeGreaterThanOrEqual(1)
      expect(shown.size, word).toBeLessThanOrEqual(Math.max(1, letters - 2))
      for (const i of shown) expect(word[i], word).not.toBe(' ')
      expect(revealedLetters(word)).toEqual(shown) // stable while typing
    }
  })

  it('backspace and hint', () => {
    const answers = acceptedAnswers('ulna', [])
    let s: TypingState = { buffer: 'ul', awaitingEnter: false }
    s = applyKey(s, { type: 'backspace' }, answers).state
    expect(s.buffer).toBe('u')
    const hint: KeyInput = { type: 'hint' }
    s = applyKey(s, hint, answers).state
    s = applyKey(s, hint, answers).state
    expect(s.buffer).toBe('uln')
    expect(applyKey(s, hint, answers).result).toBe('complete')
  })
})

describe('mesh matching', () => {
  it.each([
    ['Humerus.l', 'humerus', true],
    ['Humerusl', 'humerus', true],
    ['humerus_R', 'humerus', true],
    ['Rib 3.r', 'rib', true],
    ['medial_epicondyle.l', 'medial_epicondyle', true],
    ['Temporalis.l', 'temporal', false],
    ['nasal_concha', 'nasal', false],
  ])('%s vs %s → %s', (mesh, key, expected) => {
    expect(meshMatchesKey(mesh, key)).toBe(expected)
  })
})

describe('most specific structure for a tapped mesh', () => {
  const structures = [
    { id: 'ribs', meshName: 'rib' },
    { id: 'first-rib', meshName: ['rib_1.l', 'rib_1.r'] },
    { id: 'carpals', meshName: ['scaphoid', 'lunate'] },
    { id: 'scaphoid', meshName: 'scaphoid' },
    { id: 'humerus', meshName: ['humerus', 'medial_epicondyle'] },
    { id: 'medial-epicondyle', meshName: 'medial_epicondyle' },
  ]
  it('prefers the named bone over its group', () => {
    expect(mostSpecific('scaphoidl', structures)?.id).toBe('scaphoid')
    expect(mostSpecific('rib_1l', structures)?.id).toBe('first-rib')
    expect(mostSpecific('rib_6r', structures)?.id).toBe('ribs')
    expect(mostSpecific('medial_epicondylel', structures)?.id).toBe('medial-epicondyle')
    expect(mostSpecific('humerusl', structures)?.id).toBe('humerus')
    expect(mostSpecific('femurl', structures)).toBeUndefined()
  })
})

describe('mesh side', () => {
  it('reads the side from what follows the key', () => {
    expect(meshSide('radiusl', ['radius'])).toBe('l')
    expect(meshSide('Radius.r', ['radius'])).toBe('r')
    expect(meshSide('rib_1r_2', ['rib_1'])).toBe('r')
    expect(meshSide('sacrum', ['sacrum'])).toBeNull()
    expect(meshSide('occipital', ['occipital'])).toBeNull()
  })
})

describe('spaced repetition', () => {
  const now = 1_000_000
  it('moves up on perfect, resets on skip', () => {
    const a = updateRecord(undefined, 'perfect', 0, now)
    expect(a.box).toBe(1)
    expect(a.dueAt).toBe(now + INTERVALS[1])
    const b = updateRecord(a, 'failed', 0, now)
    expect(b.box).toBe(0)
    expect(b.attempts).toBe(2)
    expect(b.correct).toBe(1)
    expect(b.errors).toBe(1)
  })

  it('puts overdue items first, mastered not-due items last', () => {
    const items = [
      { id: 'mastered', difficulty: 1 },
      { id: 'new', difficulty: 1 },
      { id: 'overdue', difficulty: 1 },
    ]
    const records = {
      mastered: { ...updateRecord(undefined, 'perfect', 0, now), box: 5, dueAt: now + 1e9 },
      overdue: { ...updateRecord(undefined, 'ok', 2, now - 1e7) },
    }
    expect(prioritise(items, records, now, () => 0.5).map((i) => i.id)).toEqual(['overdue', 'new', 'mastered'])
  })

  it('keeps a miss in review until two perfect answers in a row', () => {
    let r = updateRecord(undefined, 'failed', 0, now)
    expect(isMissed(r)).toBe(true)
    r = updateRecord(r, 'perfect', 0, now)
    expect(isMissed(r)).toBe(true)
    r = updateRecord(r, 'perfect', 0, now)
    expect(isMissed(r)).toBe(false)
    expect(isMissed(updateRecord(undefined, 'perfect', 0, now))).toBe(false)
  })

})
