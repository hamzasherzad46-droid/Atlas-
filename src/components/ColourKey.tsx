import { useState } from 'react'
import { sortGroups } from '../content/colours'
import { useT } from '../i18n'

/**
 * The colour key of a 3D view: a button in its lower corner that opens a list of what is on show,
 * each with its colour swatch (colours from content/colours.json).
 */
export function ColourKey({ groups }: { groups: string[] }) {
  const t = useT()
  const [open, setOpen] = useState(false)
  const list = sortGroups(groups)
  if (!list.length) return null
  return (
    <div className="colour-key">
      {open && (
        <ul className="colour-key-list" aria-label={t('key.listLabel')} lang="en">
          {list.map((g) => (
            <li key={g.id}>
              <span className="colour-swatch" style={{ background: g.colour }} aria-hidden />
              {g.name}
            </li>
          ))}
        </ul>
      )}
      <button className="colour-key-toggle" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        {t('key.colours')}
      </button>
    </div>
  )
}
