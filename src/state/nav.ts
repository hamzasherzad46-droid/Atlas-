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

/** Everything that decides which screen is showing. Back restores the previous View. */
export interface View {
  tab: Tab
  session: SessionConfig | null
  cards: CardsConfig | null
  /** Module detail page (inside the Atlas tab). */
  modulePage: string | null
  /** Anatomical plate page (inside the Atlas tab). */
  plate: string | null
  /** A curriculum topic's study page (inside the Atlas tab). */
  topic: { cat: string; index: number } | null
  /** Full-screen 3D explore for a module, optionally opening on one structure. */
  explore: string | null
  exploreFocus: string | null
  credits: boolean
  /**
   * The mock exam (full screen), optionally limited to one question topic. `running` is the step from
   * the setup into the questions, so Back from the questions returns to the setup.
   */
  mock: { topic: string | null; running?: boolean } | null
  /** The whole body in 3D (full screen). */
  body: boolean
  /** The "Change course" sheet. */
  courses: boolean
  /** Search (full screen). */
  search: boolean
  /** Account: sign in (or create an account), or delete it. */
  account: 'signin' | 'delete' | null
}

export const HOME: View = {
  tab: 'today',
  session: null,
  cards: null,
  modulePage: null,
  plate: null,
  topic: null,
  explore: null,
  exploreFocus: null,
  credits: false,
  mock: null,
  body: false,
  courses: false,
  search: false,
  account: null,
}

/** Opening a page inside a tab closes any full-screen view on top, so the page is what you see. */
const NO_OVERLAYS: Partial<View> = { explore: null, exploreFocus: null, credits: false, mock: null, body: false, courses: false, search: false, account: null }
const NO_PAGES: Partial<View> = { modulePage: null, plate: null, topic: null }

interface NavState extends View {
  /** Previous views, most recent last. */
  history: View[]
  /** Show a new view; Back returns to the current one. `replace` swaps the current view instead. */
  go(patch: Partial<View>, replace?: boolean): void
  /** Return to the previous view (Today if there is none). */
  back(): void
  setTab(tab: Tab): void
  startSession(config: SessionConfig): void
  startCards(config: CardsConfig): void
  openModule(id: string): void
  openExplore(id: string, structureId?: string): void
  openPlate(id: string): void
  openTopic(topic: { cat: string; index: number }): void
  openCredits(): void
  openMock(topic?: string | null): void
  openBody(): void
  openCourses(): void
  openSearch(): void
  openAccount(mode: 'signin' | 'delete'): void
}

export function viewOf(s: View): View {
  const v = {} as Record<keyof View, unknown>
  for (const k of Object.keys(HOME) as (keyof View)[]) v[k] = s[k]
  return v as unknown as View
}

export const useNav = create<NavState>()((set, get) => ({
  ...HOME,
  history: [],
  go: (patch, replace = false) => {
    const current = viewOf(get())
    set({ ...patch, history: replace ? get().history : [...get().history, current] })
  },
  back: () => {
    const h = get().history
    if (!h.length) return set({ ...HOME })
    set({ ...h[h.length - 1], history: h.slice(0, -1) })
  },
  setTab: (tab) => {
    const s = get()
    if (s.tab === tab && !s.modulePage && !s.plate && !s.topic) return
    s.go({ tab, ...NO_PAGES, ...NO_OVERLAYS })
  },
  // A session started from inside another (the summary's "Fix mistakes") replaces it, so Back leaves the quiz.
  startSession: (session) => get().go({ session, cards: null }, !!get().session),
  startCards: (cards) => get().go({ cards, session: null }, !!get().cards),
  openModule: (modulePage) => get().go({ ...NO_PAGES, ...NO_OVERLAYS, modulePage, tab: 'atlas' }),
  openPlate: (plate) => get().go({ ...NO_PAGES, ...NO_OVERLAYS, plate, tab: 'atlas' }),
  openTopic: (topic) => get().go({ ...NO_PAGES, ...NO_OVERLAYS, topic, tab: 'atlas' }),
  openExplore: (explore, structureId) => get().go({ ...NO_OVERLAYS, explore, exploreFocus: structureId ?? null }),
  openCredits: () => get().go({ ...NO_OVERLAYS, credits: true }),
  openMock: (topic = null) => get().go({ ...NO_OVERLAYS, mock: { topic } }),
  openBody: () => get().go({ ...NO_OVERLAYS, body: true }),
  openCourses: () => get().go({ courses: true }),
  openSearch: () => get().go({ ...NO_OVERLAYS, search: true }),
  // Opens over whatever is showing (Settings, or onboarding on first run).
  openAccount: (account) => get().go({ account }),
}))

/**
 * Back, as every back and close button does it. When the app has added browser history entries,
 * it goes back through the browser so the phone's back gesture and the button stay in step;
 * the popstate listener (see `useBrowserBack`) then calls `back()`.
 */
export function goBack(steps = 1) {
  const depth = typeof window !== 'undefined' ? browserDepth(window.history.state) : 0
  if (depth >= steps && useNav.getState().history.length >= steps) window.history.go(-steps)
  else for (let i = 0; i < steps; i++) useNav.getState().back()
}

/** Identifies this page load, so browser entries left from before a reload are not mistaken for ours. */
export const NAV_SESSION = Math.random().toString(36).slice(2)

export interface BrowserEntry {
  atlasDepth: number
  atlasSession: string
}

/** How deep the app's history was when this browser entry was added (0 for entries that aren't this load's). */
export function browserDepth(state: unknown): number {
  const s = state as Partial<BrowserEntry> | null
  return s?.atlasSession === NAV_SESSION ? (s.atlasDepth ?? 0) : 0
}

export const PRACTICE_LENGTH = 12
export const CARDS_LENGTH = 15
export const ASSESSMENT_LENGTH = 20
export const ASSESSMENT_TIME_MS = 5 * 60_000
/** Exams also give each question its own clock. */
export const ASSESSMENT_ANSWER_TIMER = 20
