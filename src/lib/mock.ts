import type { MockQuestion } from '../content/types'

export const MOCK_LENGTHS = [15, 30, 45] as const

/** A question as asked: options in a random order, with the index of the correct one. */
export interface MockItem {
  id: string
  topic: string
  q: string
  options: string[]
  correct: number
  explain: string
}

function shuffle<T>(list: T[], rand: () => number): T[] {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Picks `length` different questions at random and shuffles each one's options. */
export function buildMock(bank: MockQuestion[], length: number, rand: () => number = Math.random): MockItem[] {
  return shuffle(bank, rand)
    .slice(0, Math.min(length, bank.length))
    .map((q) => {
      const order = shuffle(
        q.options.map((_, i) => i),
        rand,
      )
      return { id: q.id, topic: q.topic, q: q.q, options: order.map((i) => q.options[i]), correct: order.indexOf(0), explain: q.explain }
    })
}

export interface TopicScore {
  topic: string
  right: number
  total: number
}

/** Score per topic, weakest first (then by how many were asked). */
export function topicScores(items: MockItem[], answers: (number | null)[]): TopicScore[] {
  const map = new Map<string, TopicScore>()
  items.forEach((it, i) => {
    const s = map.get(it.topic) ?? { topic: it.topic, right: 0, total: 0 }
    s.total++
    if (answers[i] === it.correct) s.right++
    map.set(it.topic, s)
  })
  return [...map.values()].sort((a, b) => a.right / a.total - b.right / b.total || b.total - a.total || a.topic.localeCompare(b.topic))
}
