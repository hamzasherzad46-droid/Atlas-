import { useMemo } from 'react'
import { allModules } from '../content/loader'
import type { ModuleContent } from '../content/types'
import { evaluateAssignments, type AssignmentStatus, type DayActivity } from '../lib/assignments'
import { isMissed } from '../lib/srs'
import { sumDays } from '../lib/syncMerge'
import { currentStreak, weekStrip } from '../lib/streak'
import { levelFromXp, type LevelInfo } from '../lib/xp'
import { useProgress, type CardRecord } from './progress'
import { useSettings } from './settings'

const systemOf = (moduleId: string) => allModules.find((m) => m.id === moduleId)?.systemId

/** Daily activity on every device: this one's plus the account's other devices' (when signed in). */
export function useAllDays(): Record<string, DayActivity> {
  const days = useProgress((s) => s.days)
  const otherDays = useProgress((s) => s.otherDays)
  return useMemo(() => (Object.keys(otherDays).length ? sumDays([days, otherDays]) : days), [days, otherDays])
}

export function useActiveDays(): Set<string> {
  const days = useAllDays()
  return useMemo(() => new Set(Object.entries(days).filter(([, d]) => d.answered + d.cards > 0).map(([k]) => k)), [days])
}

export function useStreak() {
  const active = useActiveDays()
  return useMemo(() => ({ streak: currentStreak(active), week: weekStrip(active) }), [active])
}

export function useLevel(): LevelInfo & { xp: number } {
  const xp = useProgress((s) => s.xp)
  return useMemo(() => ({ ...levelFromXp(xp), xp }), [xp])
}

export function useAssignments(): AssignmentStatus[] {
  const days = useAllDays()
  const records = useProgress((s) => s.records)
  const assessments = useProgress((s) => s.assessments)
  const dailyGoal = useSettings((s) => s.dailyGoal)
  // Recomputed when activity changes; periods roll over on the next change or reload.
  return useMemo(() => evaluateAssignments({ days, records, assessments, dailyGoal, systemOf }), [days, records, assessments, dailyGoal])
}

/** Flashcards due now in a module (seen before and due); unseen cards aren't "due". */
export function dueCards(content: ModuleContent, cards: Record<string, CardRecord>, now = Date.now()): number {
  return content.structures.filter((s) => cards[s.id] && cards[s.id].dueAt <= now).length
}

export function missedCount(content: ModuleContent, records: ReturnType<typeof useProgress.getState>['records']): number {
  return content.structures.filter((s) => isMissed(records[s.id])).length
}
