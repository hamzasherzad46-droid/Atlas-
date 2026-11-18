import type { ReactNode } from 'react'
import { publicUrl } from '../lib/paths'

/**
 * A cover engraving: a 2:1 crop of one of the 19th-century plates, printed on the room's paper
 * (greyscale multiplied over --engraving-paper), so one small file serves both themes. Decorative:
 * the module's name is always beside it in type.
 */
export function Engraving({ name, className }: { name: string; className?: string }) {
  return (
    <div className={`engraving${className ? ` ${className}` : ''}`} aria-hidden>
      <img
        src={publicUrl(`plates/covers/${name}.webp`)}
        alt=""
        width={780}
        height={390}
        loading="lazy"
        decoding="async"
        onLoad={(e) => e.currentTarget.classList.add('in')}
      />
    </div>
  )
}

/** An empty state: a small crop of an engraving and one helpful line. */
export function EmptyState({ art, children }: { art: string; children: ReactNode }) {
  return (
    <div className="empty-state">
      <Engraving name={art} className="empty-art" />
      <p className="empty">{children}</p>
    </div>
  )
}
