import { describe, expect, it } from 'vitest'
import { acceptedAnswers, activeAnswer, applyKey, type KeyInput, emptyTyping, normalizeAnswer, revealedLetters, type TypingState } from './typing'
import { meshMatchesKey, meshSide, mostSpecific } from './meshMatch'
import { INTERVALS, isMissed, prioritise, updateRecord } from './srs'
import { placeTags } from './plates'
import { MOCK_LENGTHS, buildMock, topicScores } from './mock'
import { BODY_LAYERS, CUT_RANGE, EXPLODE_MAX, EXPLODE_ORIGIN, HERO_MODELS, cutPlane, displayName, explodeOffset } from './bodyLayers'
import { bearingText } from './format'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const modelsDir = fileURLToPath(new URL('../../public/models', import.meta.url))

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

describe('placeTags', () => {
  it('puts each tag on the nearer side, at the height of its point', () => {
    const tags = placeTags([{ x: 20, y: 30 }, { x: 80, y: 60 }], 4)
    expect(tags).toEqual([
      { i: 0, side: 'l', y: 30 },
      { i: 1, side: 'r', y: 60 },
    ])
  })

  it('keeps tags on one side at least the minimum gap apart, in the order of their points', () => {
    const pts = [{ x: 10, y: 50 }, { x: 12, y: 51 }, { x: 14, y: 49 }, { x: 16, y: 50.5 }]
    const tags = placeTags(pts, 5).sort((a, b) => a.y - b.y)
    for (let k = 1; k < tags.length; k++) expect(tags[k].y - tags[k - 1].y).toBeGreaterThanOrEqual(5 - 1e-9)
    expect(tags.map((t) => t.i)).toEqual([2, 0, 3, 1])
  })

  it('pulls a crowded column back inside the plate', () => {
    const pts = Array.from({ length: 6 }, (_, i) => ({ x: 70, y: 95 + i * 0.1 }))
    const tags = placeTags(pts, 5)
    for (const t of tags) {
      expect(t.y).toBeLessThanOrEqual(98 + 1e-9)
      expect(t.y).toBeGreaterThanOrEqual(2)
    }
  })
})

describe('mock exams', () => {
  const bank = Array.from({ length: 50 }, (_, i) => ({ id: `q${i}`, topic: i % 2 ? 'Odd' : 'Even', q: `Question ${i}?`, options: [`right ${i}`, 'a', 'b', 'c'], explain: 'Because.' }))
  let seed = 7
  const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646

  it('asks the requested number of different questions', () => {
    for (const n of MOCK_LENGTHS) {
      const items = buildMock(bank, n, rand)
      expect(items).toHaveLength(n)
      expect(new Set(items.map((x) => x.id)).size).toBe(n)
    }
  })

  it('keeps track of the correct option after shuffling', () => {
    for (const it of buildMock(bank, 45, rand)) {
      expect(it.options[it.correct]).toBe(`right ${it.id.slice(1)}`)
      expect(new Set(it.options).size).toBe(4)
    }
  })

  it('scores each topic and lists the weakest first', () => {
    const items = buildMock(bank, 10, rand)
    const answers = items.map((it) => (it.topic === 'Odd' ? it.correct : (it.correct + 1) % 4))
    const scores = topicScores(items, answers)
    expect(scores[0].topic).toBe('Even')
    expect(scores[0].right).toBe(0)
    expect(scores.find((s) => s.topic === 'Odd')?.right).toBe(scores.find((s) => s.topic === 'Odd')?.total)
    expect(scores.reduce((n, s) => n + s.total, 0)).toBe(10)
  })
})

describe('whole-body model', () => {
  it('names BodyParts3D parts readably, in British spelling, with the side at the end', () => {
    expect(displayName('Long head of left biceps brachii')).toBe('Long head of biceps brachii (left)')
    expect(displayName('Set of anterior intercostal veins')).toBe('Anterior intercostal veins')
    expect(displayName('Esophagus')).toBe('Oesophagus')
    expect(displayName('celiac trunk')).toBe('Coeliac trunk')
    expect(displayName('Ileocecal junction')).toBe('Ileocaecal junction')
    expect(displayName('Right femoral vein')).toBe('Femoral vein (right)')
  })

  it('moves bones straight out from the middle of the skeleton, proportionally', () => {
    expect(explodeOffset(EXPLODE_ORIGIN, 1)).toEqual([0, 0, 0])
    const [x, y, z] = explodeOffset([0.2, 1.66, 0], 1)
    expect(x).toBeCloseTo(0.2 * EXPLODE_MAX)
    expect(y).toBeCloseTo(0.8 * EXPLODE_MAX)
    expect(z).toBe(0)
    expect(explodeOffset([0.2, 1.66, 0], 0)).toEqual([0, 0, 0])
  })

  it('cuts across the whole body in each plane', () => {
    expect(cutPlane('transverse', 0)).toEqual({ normal: [0, -1, 0], constant: CUT_RANGE.transverse[0] })
    expect(cutPlane('transverse', 1).constant).toBeCloseTo(CUT_RANGE.transverse[1])
    expect(cutPlane('sagittal', 0.5).constant).toBeCloseTo(0)
    expect(cutPlane('coronal', 2).constant).toBeCloseTo(CUT_RANGE.coronal[1])
  })

  it('every layer file exists, and organs reuse the module models', () => {
    for (const l of BODY_LAYERS) for (const p of l.parts) expect(existsSync(join(modelsDir, p.file)), p.file).toBe(true)
    expect(BODY_LAYERS.map((l) => l.id)).toEqual(['skin', 'muscles', 'skeleton', 'organs', 'arteries', 'veins', 'nervous'])
  })
})

describe('3D readouts', () => {
  it('writes the bearing as three-digit azimuth and signed two-digit elevation', () => {
    expect(bearingText(30, 4, 'Az', 'El')).toBe('Az 030 · El +04')
    expect(bearingText(0, 0, 'Az', 'El')).toBe('Az 000 · El +00')
    expect(bearingText(359, -12, 'Az', 'El')).toBe('Az 359 · El −12')
  })

  it("Today's body uses model files that exist", () => {
    const models = fileURLToPath(new URL('../../public/models/', import.meta.url))
    for (const file of Object.values(HERO_MODELS)) expect(existsSync(join(models, file)), file).toBe(true)
  })
})
