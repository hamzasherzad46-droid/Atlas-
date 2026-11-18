import type { ReactNode } from 'react'
import { useT } from '../i18n'
import { goBack } from '../state/nav'
import { BackIcon, CloseIcon } from './Icons'

/**
 * The top bar of every full-screen view, so the way out is always in the same place: Back (or
 * Close, for a quiz, cards or a mock exam) at the top left, 44 × 44, then the screen's name,
 * then an optional control on the right.
 */
export function ScreenBar({
  title,
  close = false,
  onBack = goBack,
  label,
  end,
}: {
  title?: ReactNode
  /** Show Close (×) instead of Back (←): the button ends an activity rather than returning a page. */
  close?: boolean
  onBack?: () => void
  /** Screen-reader label; defaults to "Back" or "Close". */
  label?: string
  end?: ReactNode
}) {
  const t = useT()
  return (
    <header className="screen-bar">
      <button className="icon-btn screen-bar-back" onClick={() => onBack()} aria-label={label ?? t(close ? 'common.close' : 'common.back')}>
        {close ? <CloseIcon size={18} /> : <BackIcon size={18} />}
      </button>
      <div className="screen-bar-title num">{title}</div>
      <div className="screen-bar-end">{end}</div>
    </header>
  )
}
