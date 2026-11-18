import { useEffect, useRef } from 'react'
import type { QuizMode } from '../state/settings'
import type { Outcome } from '../lib/srs'
import { reducedMotion } from '../lib/motion'
import { revealedLetters } from '../lib/typing'

interface Props {
  answer: string
  typed: string
  mode: QuizMode
  done: boolean
  outcome: Outcome | null
  /** Increments on every wrong key, to replay the shake. */
  wrongCount: number
}

/** The large serif answer word: ghost letters (learn), a few letters among dashes (medium) or dashes (hard), filled in as you type. */
export function AnswerWord({ answer, typed, mode, done, outcome, wrongCount }: Props) {
  const el = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!wrongCount || reducedMotion()) return
    // A small horizontal shake, settling quickly: no bounce.
    el.current?.animate(
      [{ transform: 'none' }, { transform: 'translateX(-4px)' }, { transform: 'translateX(3px)' }, { transform: 'translateX(-1px)' }, { transform: 'none' }],
      { duration: 220, easing: 'ease-out' },
    )
  }, [wrongCount])

  // Sized to fit the screen, between the two largest steps of the type scale (24 and 34 px).
  const size = Math.max(24, Math.min(34, 520 / Math.max(answer.length, 1)))
  const shown = mode === 'medium' ? revealedLetters(answer) : null
  const state = done ? (outcome === 'failed' ? 'fail' : 'ok') : 'typing'

  return (
    <div
      ref={el}
      className={`answer answer-${state}`}
      dir="ltr"
      style={{ fontSize: size }}
      aria-label={done ? answer : `${typed.length} of ${answer.length} letters typed`}
      aria-live="polite"
    >
      {[...answer].map((ch, i) => {
        const isTyped = i < typed.length
        const caret = !done && i === typed.length
        if (ch === ' ') return <span key={i} className={`answer-space${caret ? ' caret' : ''}`} />
        return (
          <span
            key={i}
            className={`answer-ch ${isTyped || done ? 'typed' : mode === 'learn' || shown?.has(i) ? 'ghost' : 'dash'}${caret ? ' caret' : ''}`}
          >
            {ch}
          </span>
        )
      })}
      {!done && typed.length >= answer.length && <span className="answer-ch caret caret-end" />}
    </div>
  )
}
