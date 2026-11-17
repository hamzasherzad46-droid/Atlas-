import type { SearchEntry } from '../lib/search'
import type { Curriculum, MockBank, ModuleContent, ModuleInfo, Plates } from './types'

/** Where a search result leads. */
export type SearchTarget =
  | { kind: 'structure'; moduleId: string; structureId: string }
  | { kind: 'module'; moduleId: string }
  | { kind: 'topic'; cat: string; index: number }
  | { kind: 'plate'; plateId: string }
  | { kind: 'mock'; topic: string }

export interface SearchData {
  /** Each available system module with its content: every structure is found once, in its own system. */
  systems: { info: ModuleInfo; content: ModuleContent }[]
  /** Every module that can be opened (focus, regional and system). */
  modules: ModuleInfo[]
  curriculum: Curriculum
  plates: Plates
  mock: MockBank
}

/** Display text the index needs from the interface language. */
export interface SearchNames {
  /** A module's title in the interface language. */
  module(id: string): string
  /** A module's English title, so English names always find it. */
  english(id: string): string
  /** The line under a mock-exam topic, e.g. "Mock exam · 9 questions". */
  mock(n: number): string
}

export function buildSearchEntries(data: SearchData, names: SearchNames): SearchEntry<SearchTarget>[] {
  const entries: SearchEntry<SearchTarget>[] = []

  for (const { info, content } of data.systems) {
    for (const s of content.structures) {
      entries.push({
        kind: 'structure',
        key: `structure:${info.id}:${s.id}`,
        title: s.name,
        aliases: [...s.synonyms, s.latinName],
        sub: names.module(info.id),
        target: { kind: 'structure', moduleId: info.id, structureId: s.id },
      })
    }
  }

  for (const m of data.modules) {
    if (m.status !== 'available') continue
    entries.push({
      kind: 'module',
      key: `module:${m.id}`,
      title: names.module(m.id),
      aliases: [names.english(m.id)],
      sub: m.description ?? '',
      target: { kind: 'module', moduleId: m.id },
    })
  }

  for (const c of data.curriculum.categories) {
    c.topics.forEach((topic, index) => {
      entries.push({
        kind: 'topic',
        key: `topic:${c.id}:${index}`,
        title: topic.title,
        aliases: [],
        sub: c.title,
        target: { kind: 'topic', cat: c.id, index },
      })
    })
  }

  for (const p of data.plates.plates) {
    entries.push({
      kind: 'plate',
      key: `plate:${p.id}`,
      title: p.title,
      aliases: [],
      sub: p.view,
      target: { kind: 'plate', plateId: p.id },
    })
  }

  const counts = new Map<string, number>()
  for (const set of data.mock.sets) for (const q of set.questions) counts.set(q.topic, (counts.get(q.topic) ?? 0) + 1)
  for (const [topic, n] of counts) {
    entries.push({
      kind: 'mock',
      key: `mock:${topic}`,
      title: topic,
      aliases: [],
      sub: names.mock(n),
      target: { kind: 'mock', topic },
    })
  }

  return entries
}
