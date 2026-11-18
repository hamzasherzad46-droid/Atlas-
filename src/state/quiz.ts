import { create } from 'zustand'
import type { Structure } from '../content/types'
import { acceptedAnswers, applyKey, emptyTyping, type KeyInput, type TypingState } from '../lib/typing'
import { outcomeFor, prioritise, type Outcome, type StructureRecord } from '../lib/srs'
import { meshKeys, meshMatchesAny, meshMatchesKey, mostSpecific } from '../lib/meshMatch'
import { playSound } from '../lib/sound'
import { buzz } from '../lib/haptics'
import { xpForAnswer } from '../lib/xp'
import type { SessionConfig } from './nav'
import { useProgress } from './progress'

export type Phase = 'typing' | 'done' | 'finished'

export interface QuestionResult {
  id: string
  outcome: Outcome
  errors: number
  xp: number
  timedOut: boolean
}

export interface KeyFlash {
  key: string
  kind: 'ok' | 'wrong'
  /** Increments on every flash so repeated keys re-trigger animations. */
  n: number
}

interface QuizState {
  config: SessionConfig | null
  byId: Record<string, Structure>
  queue: string[]
  index: number
  answers: string[]
  typing: TypingState
  phase: Phase
  qErrors: number
  qStart: number
  /** Per-question deadline (ms epoch) when an answer timer is on. */
  qDeadline: number | null
  lastOutcome: Outcome | null
  lastXp: number
  timedOut: boolean
  keysCorrect: number
  keysWrong: number
  streak: number
  bestStreak: number
  sessionXp: number
  results: QuestionResult[]
  flash: KeyFlash | null
  wrongCount: number
  startedAt: number
  finishedAt: number
  endsAt: number | null
  /** Wider set of structures that answer choices may be drawn from (a focused region's whole content file). */
  pool: Structure[]
  /** Multiple choice: the structure ids on offer for this question. */
  choices: string[]
  /** The choice made, or the structure tapped when identifying (null if a tap hit nothing named). */
  picked: string | null
  init(config: SessionConfig, structures: Structure[], pool?: Structure[]): void
  /** Multiple choice. */
  choose(id: string): void
  /** Identify: a mesh was tapped. */
  tap(meshName: string): void
  press(input: KeyInput): void
  skip(): void
  timeout(): void
  next(): void
  finish(): void
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Two structures overlap if either names any of the other's meshes (the carpals and the scaphoid, the ribs and the first rib). */
export function overlaps(a: Structure, b: Structure): boolean {
  const ka = meshKeys(a.meshName)
  const kb = meshKeys(b.meshName)
  return ka.some((x) => kb.some((y) => meshMatchesKey(x, y) || meshMatchesKey(y, x)))
}

/**
 * Three wrong answers for a multiple-choice question. A distractor must be a different structure
 * that doesn't share any part with the answer (so "carpals" is never offered against "scaphoid",
 * where both would be right) and doesn't share its name. Neighbours from the same region come first.
 */
export function distractorsFor(target: Structure, pool: Structure[], count = 3): Structure[] {
  const seen = new Set([target.name.toLowerCase()])
  const ok = shuffle(pool).filter((s) => {
    if (s.id === target.id || overlaps(s, target)) return false
    const name = s.name.toLowerCase()
    if (seen.has(name)) return false
    seen.add(name)
    return true
  })
  const near = ok.filter((s) => s.region === target.region)
  const far = ok.filter((s) => s.region !== target.region)
  return [...near, ...far].slice(0, count)
}

/**
 * Mix a set of questions so that, where possible, no two in a row come from the same region of the body
 * (the skull, then a limb, then the trunk…). The largest remaining region goes next, which spreads them evenly.
 */
export function mixByRegion<T extends { region: string }>(items: T[]): T[] {
  const groups = new Map<string, T[]>()
  for (const s of shuffle(items)) {
    const g = groups.get(s.region)
    if (g) g.push(s)
    else groups.set(s.region, [s])
  }
  const out: T[] = []
  let last: string | null = null
  while (out.length < items.length) {
    const open = [...groups.entries()].filter(([, g]) => g.length > 0)
    const pick = open.filter(([r]) => r !== last).sort((a, b) => b[1].length - a[1].length)[0] ?? open[0]
    out.push(pick[1].shift()!)
    last = pick[0]
  }
  return out
}

export function buildQueue(config: SessionConfig, structures: Structure[], records: Record<string, StructureRecord>): string[] {
  const unique = [...new Set(config.ids ?? [])]
  if (unique.length) {
    const chosen = structures.filter((s) => unique.includes(s.id))
    const ids = chosen.length === unique.length ? mixByRegion(chosen).map((s) => s.id) : shuffle(unique)
    return ids.slice(0, config.length)
  }
  const inRegion = structures.filter((s) => !config.region || s.region === config.region)
  const tiered = inRegion.filter((s) => !config.tier || s.difficulty === config.tier)
  // If a region has nothing at the chosen level, fall back to every level rather than an empty session.
  const pool = tiered.length ? tiered : inRegion
  if (config.kind === 'assessment') return mixByRegion(shuffle(pool).slice(0, config.length)).map((s) => s.id)
  // Spaced repetition decides which structures are due; the order they are asked in is mixed.
  return mixByRegion(prioritise(pool, records, Date.now()).slice(0, config.length)).map((s) => s.id)
}

/** English name and synonyms, plus the Latin name: the international terms are accepted in every language. */
export function answersFor(s: Structure): string[] {
  return acceptedAnswers(s.name, s.synonyms, [s.latinName])
}

const fresh = {
  queue: [] as string[],
  index: 0,
  answers: [] as string[],
  typing: emptyTyping,
  phase: 'typing' as Phase,
  qErrors: 0,
  qStart: 0,
  qDeadline: null,
  lastOutcome: null,
  lastXp: 0,
  timedOut: false,
  keysCorrect: 0,
  keysWrong: 0,
  streak: 0,
  bestStreak: 0,
  sessionXp: 0,
  results: [] as QuestionResult[],
  flash: null,
  wrongCount: 0,
  startedAt: 0,
  finishedAt: 0,
  endsAt: null,
  choices: [] as string[],
  picked: null as string | null,
}

export const useQuiz = create<QuizState>()((set, get) => {
  const flashOf = (key: string, kind: KeyFlash['kind']): KeyFlash => ({ key, kind, n: (get().flash?.n ?? 0) + 1 })

  const loadQuestion = (index: number) => {
    const { queue, byId, config } = get()
    const s = byId[queue[index]]
    const now = Date.now()
    const pool = get().pool
    const choices = s && config?.format === 'choice' ? shuffle([s, ...distractorsFor(s, pool)]).map((c) => c.id) : []
    set({
      index,
      choices,
      picked: null,
      answers: s ? answersFor(s) : [],
      typing: emptyTyping,
      phase: 'typing',
      qErrors: 0,
      qStart: now,
      qDeadline: config?.answerTimer ? now + config.answerTimer * 1000 : null,
      lastOutcome: null,
      lastXp: 0,
      timedOut: false,
    })
  }

  const complete = (skipped: boolean, timedOut = false) => {
    const st = get()
    const id = st.queue[st.index]
    const s = st.byId[id]
    const config = st.config!
    const errors = st.qErrors
    const outcome = outcomeFor(errors, skipped)
    const streak = outcome === 'perfect' ? st.streak + 1 : 0
    const xp = xpForAnswer({ outcome, combo: streak, hard: config.mode === 'hard', timed: !!config.answerTimer, difficulty: s?.difficulty ?? 1 })
    useProgress.getState().record({ id, moduleId: config.moduleId, outcome, errors, ms: Date.now() - st.qStart, xp, combo: streak })
    // Each structure is asked once per session; anything missed is listed at the end ("Fix these now")
    // and comes back through spaced repetition, rather than looping within the session.
    set({
      phase: 'done',
      lastOutcome: outcome,
      lastXp: xp,
      timedOut,
      qDeadline: null,
      streak,
      bestStreak: Math.max(st.bestStreak, streak),
      sessionXp: st.sessionXp + xp,
      results: [...st.results, { id, outcome, errors, xp, timedOut }],
      // On skip or timeout, reveal the answer.
      typing: skipped ? { buffer: st.answers[0] ?? '', awaitingEnter: false } : st.typing,
    })
    playSound(outcome === 'failed' ? 'fail' : 'complete')
    buzz(outcome === 'failed' ? 'wrong' : 'right')
  }

  return {
    config: null,
    byId: {},
    pool: [],
    ...fresh,

    init(config, structures, pool) {
      const wider = pool?.length ? pool : structures
      // Answer choices may come from the wider pool, so their names and details must be known too.
      const byId = Object.fromEntries([...wider, ...structures].map((s) => [s.id, s]))
      set({ pool: wider })
      const queue = buildQueue(config, structures, useProgress.getState().records)
      const now = Date.now()
      set({ ...fresh, config, byId, queue, startedAt: now, endsAt: config.timeLimitMs ? now + config.timeLimitMs : null })
      loadQuestion(0)
      if (!queue.length) set({ phase: 'finished', finishedAt: now })
    },

    press(input) {
      const st = get()
      if (st.phase === 'done') {
        // Enter or Space skips the remaining pause.
        if (input.type === 'enter' || (input.type === 'char' && input.char === ' ')) get().next()
        return
      }
      if (st.phase !== 'typing') return
      const { state, result } = applyKey(st.typing, input, st.answers)
      const keyLabel = input.type === 'char' ? input.char.toLowerCase() : input.type
      switch (result) {
        case 'wrong':
          set({ qErrors: st.qErrors + 1, keysWrong: st.keysWrong + 1, flash: flashOf(keyLabel, 'wrong'), wrongCount: st.wrongCount + 1 })
          playSound('wrong')
          buzz('key')
          return
        case 'ignored':
          return
        case 'deleted':
          set({ typing: state, flash: flashOf('backspace', 'ok') })
          return
        case 'correct':
        case 'complete': {
          const isHint = input.type === 'hint'
          set({
            typing: state,
            qErrors: st.qErrors + (isHint ? 1 : 0),
            keysCorrect: st.keysCorrect + (isHint ? 0 : 1),
            keysWrong: st.keysWrong + (isHint ? 1 : 0),
            flash: flashOf(isHint ? 'hint' : keyLabel, 'ok'),
          })
          if (result === 'complete') complete(false)
          else playSound('key')
        }
      }
    },

    skip() {
      if (get().phase === 'typing') complete(true)
    },

    choose(id) {
      const st = get()
      if (st.phase !== 'typing' || st.config?.format !== 'choice') return
      const right = id === st.queue[st.index]
      set({ picked: id, qErrors: right ? 0 : 1 })
      complete(!right)
    },

    tap(meshName) {
      const st = get()
      if (st.phase !== 'typing' || st.config?.format !== 'identify') return
      const target = st.byId[st.queue[st.index]]
      if (!target) return
      const right = meshMatchesAny(meshName, meshKeys(target.meshName))
      const hit = right ? target : mostSpecific(meshName, st.pool)
      // '' marks a tap on something that isn't a named structure (still an answer, not a skip).
      set({ picked: hit?.id ?? '', qErrors: right ? 0 : 1 })
      complete(!right)
    },

    timeout() {
      if (get().phase === 'typing') complete(true, true)
    },

    next() {
      const st = get()
      if (st.phase === 'finished') return
      if (st.index + 1 >= st.queue.length) return get().finish()
      loadQuestion(st.index + 1)
    },

    finish() {
      const st = get()
      if (st.phase === 'finished') return
      set({ phase: 'finished', finishedAt: Date.now(), qDeadline: null })
      playSound('finish')
      if (st.config?.kind === 'assessment') {
        const unique = new Map(st.results.map((r) => [r.id, r]))
        useProgress.getState().addAssessment({
          at: Date.now(),
          moduleId: st.config.moduleId,
          total: st.queue.length,
          // In a typing test a rejected letter can be retried, so only error-free answers score.
          correct: [...unique.values()].filter((r) => r.outcome === 'perfect').length,
          durationMs: Date.now() - st.startedAt,
          missed: st.queue.filter((id) => unique.get(id)?.outcome !== 'perfect'),
        })
      }
    },
  }
})

export function accuracyOf(keysCorrect: number, keysWrong: number): number {
  const total = keysCorrect + keysWrong
  return total ? Math.round((keysCorrect / total) * 100) : 100
}
