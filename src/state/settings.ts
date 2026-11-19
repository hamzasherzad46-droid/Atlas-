import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { Body, Track } from '../content/types'
import { appStorage, STORAGE_KEYS } from '../lib/storage'

export type { Body, Track }
export type ThemePref = 'light' | 'dark' | 'system'
/** learn: every letter shown faintly, with a definition; medium: a few letters and the definition; hard: dashes only. */
export type QuizMode = 'learn' | 'medium' | 'hard'
export type Lang = 'en' | 'fr' | 'de' | 'ar' | 'ru' | 'zh' | 'ko'
export const LANGS: Lang[] = ['en', 'fr', 'de', 'ar', 'ru', 'zh', 'ko']

/**
 * The languages offered in the app. The other translations stay in the code but are hidden until a
 * native speaker has reviewed them (TRANSLATION-REVIEW.md); add a language here to offer it again.
 */
export const OFFERED_LANGS: Lang[] = ['en']

/** The language the app shows: the student's choice if it is offered, otherwise English. Their choice is kept. */
export function shownLang(lang: Lang): Lang {
  return OFFERED_LANGS.includes(lang) ? lang : 'en'
}
/** Seconds per question; 0 = off. */
export const ANSWER_TIMERS = [0, 30, 20, 10] as const
export const DAILY_GOALS = [10, 20, 40, 60] as const

export interface LastSession {
  moduleId: string
  region: string | null
  mode: QuizMode
}

interface SettingsState {
  theme: ThemePref
  track: Track
  lang: Lang
  name: string
  sound: boolean
  dailyGoal: number
  answerTimer: number
  onboarded: boolean
  lastSession: LastSession | null
  /** Which body the 3D models show where both exist (the whole body, the reproductive system). */
  body: Body
  /** When course, daily goal, name or body last changed on this device (0: never); the newest change wins across devices. */
  profileChangedAt: number
  set(patch: Partial<Omit<SettingsState, 'set'>>): void
}

/** The settings that follow a signed-in student to their other devices. */
export const PROFILE_KEYS = ['track', 'dailyGoal', 'name', 'body'] as const

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'dark',
      track: 'nursing',
      lang: 'en',
      name: '',
      sound: true,
      dailyGoal: 20,
      answerTimer: 0,
      onboarded: false,
      lastSession: null,
      body: 'male',
      profileChangedAt: 0,
      set: (patch) =>
        set((s) => (PROFILE_KEYS.some((k) => k in patch && patch[k] !== s[k]) ? { ...patch, profileChangedAt: Date.now() } : patch)),
    }),
    {
      name: STORAGE_KEYS.settings,
      storage: createJSONStorage(() => appStorage),
      version: 4,
      migrate: (old, version) => {
        const s = (old ?? {}) as Record<string, unknown>
        // v1 had no onboarding; v1 users already chose a track, so skip it.
        if (version < 2) return { ...s, lang: 'en', name: '', dailyGoal: 20, answerTimer: 0, onboarded: true, theme: 'dark' }
        // v3 redesign is dark-first; reset the old “paper” default once.
        if (version < 3) return { ...s, theme: 'dark', body: 'male' }
        // v4 adds the body: everything before it showed the male models.
        if (version < 4) return { ...s, body: 'male' }
        return s
      },
    },
  ),
)

/** Resolve "system", write data-theme, lang and dir on <html>. Returns an unsubscribe function. */
export function applyTheme(pref: ThemePref): () => void {
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  const apply = () => {
    const theme = pref === 'system' ? (mq.matches ? 'dark' : 'light') : pref
    document.documentElement.dataset.theme = theme
    // index.html carries one tag per colour scheme; an explicit choice in the app overrides both.
    for (const meta of document.querySelectorAll('meta[name="theme-color"]')) meta.setAttribute('content', theme === 'light' ? '#ffffff' : '#000000')
  }
  apply()
  if (pref !== 'system') return () => {}
  mq.addEventListener('change', apply)
  return () => mq.removeEventListener('change', apply)
}
