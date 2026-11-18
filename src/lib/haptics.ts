import { useSettings } from '../state/settings'

/**
 * Very short vibrations for a right or wrong answer and a wrong key, on phones whose browser
 * supports them (Chrome on Android; Safari on iPhone has no vibration API). They follow the Sounds
 * switch, so one setting turns all feedback off.
 */
const PATTERNS = {
  right: [10],
  wrong: [14, 60, 14],
  key: [8],
} satisfies Record<string, number[]>

export type Buzz = keyof typeof PATTERNS

export function buzz(kind: Buzz) {
  if (!useSettings.getState().sound) return
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return
  try {
    navigator.vibrate(PATTERNS[kind])
  } catch {
    // Some browsers refuse vibration until the page has been touched; nothing to do.
  }
}
