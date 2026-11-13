import type React from 'react'
import { catalog } from '../content/loader'

/** Neutral stone for anything without a colour key. */
const FALLBACK = '#8a8378'

/** A body system's colour key from the catalogue (anatomical-plate conventions). */
export function systemTint(systemId: string | undefined): string {
  return catalog.systems.find((s) => s.id === systemId)?.tint ?? FALLBACK
}

/**
 * Inline style that sets `--sys` for a subtree. Pair it with the `sys` class,
 * which derives `--sys-ink`: the key itself on ivory, lightened on charcoal.
 */
export function tintVars(systemId: string | undefined): React.CSSProperties {
  return { ['--sys' as string]: systemTint(systemId) }
}
