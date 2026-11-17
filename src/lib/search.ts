/**
 * Search that forgives the two things students most often get "wrong": British against American
 * spelling (oesophagus / esophagus, haemorrhage / hemorrhage, catheterisation / catheterization,
 * tumour / tumor, centre / center) and a slip of the finger (femr, oesophagis).
 */

export type SearchKind = 'structure' | 'module' | 'topic' | 'plate' | 'mock'

export interface SearchEntry<T> {
  kind: SearchKind
  /** Unique across the index. */
  key: string
  title: string
  /** Other names that should find it: synonyms, Latin names, the English title. */
  aliases: string[]
  /** One line of context shown under the title. */
  sub: string
  target: T
}

export interface SearchHit<T> {
  entry: SearchEntry<T>
  score: number
  /** The other name that matched, when it was not the title. */
  via: string | null
}

interface Indexed<T> {
  entry: SearchEntry<T>
  terms: { text: string; folded: string; words: string[] }[]
}

export type SearchIndex<T> = Indexed<T>[]

/**
 * Lower case, accents and punctuation removed, and British spellings folded to one form so that
 * either spelling finds the other. Both the query and every name are folded the same way.
 */
export function fold(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/æ/g, 'ae')
    .replace(/œ/g, 'oe')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/ae/g, 'e')
    .replace(/oe/g, 'e')
    .replace(/is(e|ed|es|ing|ation|ations)\b/g, 'iz$1')
    .replace(/ys(e|ed|es|ing)\b/g, 'yz$1')
    .replace(/our\b/g, 'or')
    .replace(/([tbv])re\b/g, '$1er')
    .trim()
}

/** Edit distance counting a swap of two neighbouring letters as one edit; stops early past `max`. */
export function editDistance(a: string, b: string, max = Infinity): number {
  if (Math.abs(a.length - b.length) > max) return max + 1
  let prev2: number[] = []
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    const row = [i]
    let best = i
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      let d = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + cost)
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d = Math.min(d, prev2[j - 2] + 1)
      row.push(d)
      if (d < best) best = d
    }
    if (best > max) return max + 1
    prev2 = prev
    prev = row
  }
  return prev[b.length]
}

/** Typos allowed for a query of this length: none below four letters, one up to seven, then two. */
const allowance = (q: string) => (q.length < 4 ? 0 : q.length < 8 ? 1 : 2)

/** How well a folded query matches one folded name (0 = not at all). */
function scoreTerm(q: string, qWords: string[], term: { folded: string; words: string[] }): number {
  const t = term.folded
  if (!t) return 0
  if (t === q) return 100
  if (t.startsWith(q)) return 90
  if (term.words.some((w) => w.startsWith(q)) || t.includes(' ' + q)) return 80
  if (q.length >= 3 && t.includes(q)) return 70
  const allow = allowance(q)
  if (!allow) return 0
  const whole = editDistance(q, t, allow)
  if (whole <= allow) return 60 - 10 * whole
  // A run of as many words as the query has, anywhere in the name ("head of femr").
  const n = qWords.length
  for (let i = 0; i + n <= term.words.length; i++) {
    const d = editDistance(q, term.words.slice(i, i + n).join(' '), allow)
    if (d <= allow) return 55 - 10 * d
  }
  // Still typing: the start of the name, give or take a letter.
  if (q.length >= 5) {
    for (const len of [q.length - 1, q.length, q.length + 1]) {
      const d = editDistance(q, t.slice(0, len), allow)
      if (d <= allow) return 50 - 10 * d
    }
  }
  // Every word of the query found somewhere in the name, in any order ("femur head").
  if (n > 1 && qWords.every((qw) => term.words.some((w) => w.startsWith(qw) || (qw.length >= 4 && editDistance(qw, w, allowance(qw)) <= allowance(qw))))) return 40
  return 0
}

export function buildIndex<T>(entries: SearchEntry<T>[]): SearchIndex<T> {
  return entries.map((entry) => ({
    entry,
    terms: [entry.title, ...entry.aliases]
      .filter((text, i, all) => text && all.findIndex((x) => fold(x) === fold(text)) === i)
      .map((text) => {
        const folded = fold(text)
        return { text, folded, words: folded.split(' ') }
      }),
  }))
}

const KIND_ORDER: SearchKind[] = ['structure', 'module', 'topic', 'plate', 'mock']

/** The best matches for a query, best first. */
export function search<T>(index: SearchIndex<T>, query: string, limit = 40): SearchHit<T>[] {
  const q = fold(query)
  if (!q) return []
  const qWords = q.split(' ')
  const hits: SearchHit<T>[] = []
  for (const { entry, terms } of index) {
    let score = 0
    let via: string | null = null
    for (let i = 0; i < terms.length; i++) {
      const s = scoreTerm(q, qWords, terms[i])
      // The title wins a tie with an alias.
      if (s > score) {
        score = s
        via = i === 0 ? null : terms[i].text
      }
    }
    if (score) hits.push({ entry, score, via })
  }
  return hits
    .sort(
      (a, b) =>
        b.score - a.score ||
        KIND_ORDER.indexOf(a.entry.kind) - KIND_ORDER.indexOf(b.entry.kind) ||
        a.entry.title.length - b.entry.title.length ||
        a.entry.title.localeCompare(b.entry.title),
    )
    .slice(0, limit)
}
