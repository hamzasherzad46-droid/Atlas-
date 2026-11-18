import { Fragment, useEffect, useRef } from 'react'
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

/** Letters a word may have and still fit one line of a phone at the largest size (Hanken Grotesk, 0.04em tracking). */
const LONGEST_AT_FULL_SIZE = 16

/** The large answer word: ghost letters (learn), a few letters among dashes (medium) or dashes (hard), filled in as you type. */
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

  const shown = mode === 'medium' ? revealedLetters(answer) : null
  const state = done ? (outcome === 'failed' ? 'fail' : 'ok') : 'typing'
  // The word is the hero at the largest size; it wraps between words, never inside one. A single
  // word too long for one line at that size (sternocleidomastoid) steps down one size.
  const words: { start: number; text: string }[] = []
  let at = 0
  for (const text of answer.split(' ')) {
    words.push({ start: at, text })
    at += text.length + 1
  }
  const long = Math.max(...words.map((w) => w.text.length)) > LONGEST_AT_FULL_SIZE

  const letter = (ch: string, i: number) => {
    const isTyped = i < typed.length
    const caret = !done && i === typed.length
    return (
      <span key={i} className={`answer-ch ${isTyped || done ? 'typed' : mode === 'learn' || shown?.has(i) ? 'ghost' : 'dash'}${caret ? ' caret' : ''}`}>
        {ch}
      </span>
    )
  }

  return (
    <div
      ref={el}
      className={`answer answer-${state}${long ? ' answer-long' : ''}`}
      dir="ltr"
      aria-label={done ? answer : `${typed.length} of ${answer.length} letters typed`}
      aria-live="polite"
    >
      {words.map((w, n) => (
        <Fragment key={w.start}>
          {n > 0 && <span className={`answer-space${!done && typed.length === w.start - 1 ? ' caret' : ''}`} />}
          <span className="answer-word">
            {[...w.text].map((ch, k) => letter(ch, w.start + k))}
            {n === words.length - 1 && !done && typed.length >= answer.length && <span className="answer-ch caret caret-end" />}
          </span>
        </Fragment>
      ))}
    </div>
  )
}
