import { create } from 'zustand'
import type { QuizMode } from './settings'

export type Tab = 'today' | 'atlas' | 'progress' | 'you'

export type SessionKind = 'practice' | 'review' | 'assessment'

/** How each question is answered: type the name, pick it from four, or find it on the model. */
export type QuestionFormat = 'type' | 'choice' | 'identify'

export interface SessionConfig {
  kind: SessionKind
  moduleId: string
  mode: QuizMode
  region: string | null
  /** Explicit structure ids (review mistakes); otherwise chosen by spaced repetition. */
  ids?: string[]
  length: number
  /** Whole-test time limit (exam). */
  timeLimitMs?: number
  /** Per-question time limit in seconds; 0 = none. */
  answerTimer: number
  /** Only structures of this difficulty (1 foundation, 2 intermediate, 3 advanced); null = all. */
  tier?: number | null
  /** Defaults to typing the name. */
  format?: QuestionFormat
}

export interface CardsConfig {
  moduleId: string
  region: string | null
  ids?: string[]
}

interface NavState {
  tab: Tab
  session: SessionConfig | null
  cards: CardsConfig | null
  /** Module detail page (inside the Atlas tab). */
  modulePage: string | null
  /** Anatomical plate page (inside the Atlas tab). */
  plate: string | null
  /** A curriculum topic's study page (inside the Atlas tab). */
  topic: { cat: string; index: number } | null
  /** Full-screen 3D explore for a module. */
  explore: string | null
  credits: boolean
  /** The mock exam (full screen). */
  mock: boolean
  /** The whole body in 3D (full screen). */
  body: boolean
  setTab(tab: Tab): void
  startSession(config: SessionConfig): void
  endSession(): void
  startCards(config: CardsConfig): void
  endCards(): void
  openModule(id: string | null): void
  openExplore(id: string | null): void
  openPlate(id: string | null): void
  openTopic(topic: { cat: string; index: number } | null): void
  setCredits(open: boolean): void
  openMock(open: boolean): void
  openBody(open: boolean): void
}

export const useNav = create<NavState>()((set) => ({
  tab: 'today',
  session: null,
  cards: null,
  modulePage: null,
  plate: null,
  topic: null,
  explore: null,
  credits: false,
  mock: false,
  body: false,
  setTab: (tab) => set({ tab, modulePage: null, plate: null, topic: null }),
  startSession: (session) => set({ session, cards: null }),
  endSession: () => set({ session: null }),
  startCards: (cards) => set({ cards, session: null }),
  endCards: () => set({ cards: null }),
  openModule: (modulePage) => set({ modulePage, plate: null, topic: null, tab: 'atlas' }),
  openPlate: (plate) => set({ plate, modulePage: null, topic: null, tab: 'atlas' }),
  openTopic: (topic) => set({ topic, modulePage: null, plate: null, tab: 'atlas' }),
  openExplore: (explore) => set({ explore }),
  setCredits: (credits) => set({ credits }),
  openMock: (mock) => set({ mock }),
  openBody: (body) => set({ body }),
}))

export const PRACTICE_LENGTH = 12
export const CARDS_LENGTH = 15
export const ASSESSMENT_LENGTH = 20
export const ASSESSMENT_TIME_MS = 5 * 60_000
/** Exams also give each question its own clock. */
export const ASSESSMENT_ANSWER_TIMER = 20
