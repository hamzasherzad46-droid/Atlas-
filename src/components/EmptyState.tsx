import type { ReactNode } from 'react'
import { ReticleIcon } from './Icons'

/** An empty state: a small reticle and one helpful line, so a section is never silently blank. */
export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="empty-state">
      <ReticleIcon />
      <p className="empty">{children}</p>
    </div>
  )
}
