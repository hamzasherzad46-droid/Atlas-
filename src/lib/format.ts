export function formatClock(ms: number): string {
  const s = Math.ceil(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export function pct(n: number, d: number): number {
  return d ? Math.round((n / d) * 100) : 0
}

export function weekdayLabels(lang: string): string[] {
  const f = new Intl.DateTimeFormat(lang, { weekday: 'narrow' })
  return Array.from({ length: 7 }, (_, i) => f.format(new Date(2024, 0, 1 + i))) // 1 Jan 2024 was a Monday
}

/** "sphenoid bone" → "Sphenoid bone" (iOS sentence case; CSS capitalize would give "Sphenoid Bone"). */
export function sentence(s: string): string {
  return s ? s[0].toUpperCase() + s.slice(1) : s
}

/** 1 → "I", 4 → "IV": plate numbers in the atlas index. */
export function roman(n: number): string {
  const table: [number, string][] = [
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ]
  let out = ''
  for (const [v, r] of table) {
    while (n >= v) {
      out += r
      n -= v
    }
  }
  return out
}
