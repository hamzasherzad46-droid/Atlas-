import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { noteFor } from '../content/notes'
import type { CameraView } from '../content/types'
import { useModule } from '../content/useModule'
import { useT } from '../i18n'
import { formatClock, sentence } from '../lib/format'
import { meshKeys } from '../lib/meshMatch'
import { activeAnswer, type KeyInput } from '../lib/typing'
import { ArrowIcon, CheckIcon, CloseIcon } from '../components/Icons'
import { goBack, type SessionConfig } from '../state/nav'
import { useQuiz } from '../state/quiz'
import { useSettings } from '../state/settings'
import { AnswerWord } from './AnswerWord'
import { Keyboard } from './Keyboard'
import { SessionSummary } from './SessionSummary'
import './quiz.css'
import { ScreenBar } from '../components/ScreenBar'
import { LoadError } from '../components/LoadError'

const AnatomyViewer = lazy(() => import('../viewer/AnatomyViewer'))

export const AUTO_ADVANCE_MS = 1400

export function QuizScreen({ config }: { config: SessionConfig }) {
  const t = useT()
  const { assets, error, retry } = useModule(config.moduleId)
  const q = useQuiz()
  const track = useSettings((s) => s.track)
  // Index of the question whose auto-advance the student paused by tapping.
  const [pausedAt, setPausedAt] = useState<number | null>(null)
  const [now, setNow] = useState(() => Date.now())

  const format = config.format ?? 'type'
  // "Try again" shows for a moment after each wrong letter.
  const [tryAgain, setTryAgain] = useState(false)
  useEffect(() => {
    if (!q.wrongCount) return
    // Shown on the wrong key, hidden after a beat; a state flag rather than a CSS fade-out so it also
    // appears when the device asks for reduced motion.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTryAgain(true)
    const tm = setTimeout(() => setTryAgain(false), 1200)
    return () => clearTimeout(tm)
  }, [q.wrongCount])
  // In identify mode the camera holds the region's framing, so the answer isn't given away.
  const [regionView, setRegionView] = useState<CameraView | null>(null)

  useEffect(() => {
    if (assets) useQuiz.getState().init(config, assets.content.structures, assets.pool)
  }, [assets, config])

  const ready = q.config === config
  const current = ready ? q.byId[q.queue[q.index]] : undefined
  const prev = ready && q.index > 0 ? q.byId[q.queue[q.index - 1]] : undefined
  const next = ready ? q.byId[q.queue[q.index + 1]] : undefined
  const done = q.phase === 'done'
  const paused = pausedAt === q.index

  useEffect(() => {
    if (!done || paused) return
    const tm = setTimeout(() => useQuiz.getState().next(), q.lastOutcome === 'failed' ? AUTO_ADVANCE_MS + 900 : AUTO_ADVANCE_MS)
    return () => clearTimeout(tm)
  }, [done, paused, q.index, q.lastOutcome])

  // Clocks: whole-exam limit and per-question timer.
  const ticking = q.phase !== 'finished' && (q.endsAt !== null || q.qDeadline !== null)
  useEffect(() => {
    if (!ticking) return
    const tm = setInterval(() => {
      const st = useQuiz.getState()
      const n = Date.now()
      setNow(n)
      if (st.endsAt && n >= st.endsAt) st.finish()
      else if (st.qDeadline && n >= st.qDeadline) st.timeout()
    }, 100)
    return () => clearInterval(tm)
  }, [ticking])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const st = useQuiz.getState()
      if (e.key === 'Escape') return goBack()
      if (st.config?.format === 'choice' || st.config?.format === 'identify') {
        if (e.key === 'Enter' && st.phase === 'done') st.next()
        else if (st.config.format === 'choice' && /^[1-4]$/.test(e.key) && st.choices[+e.key - 1]) st.choose(st.choices[+e.key - 1])
        else return
        e.preventDefault()
        return
      }
      if (e.key === 'Backspace') st.press({ type: 'backspace' })
      else if (e.key === 'Enter') st.press({ type: 'enter' })
      else if (e.key === '?') st.press({ type: 'hint' })
      else if (e.key.length === 1) st.press({ type: 'char', char: e.key })
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Identify hides the answer until it's given.
  const highlight = useMemo(() => (current && (format !== 'identify' || done) ? meshKeys(current.meshName) : []), [current, format, done])
  const onKey = useCallback((input: KeyInput) => useQuiz.getState().press(input), [])
  const onSkip = useCallback(() => useQuiz.getState().skip(), [])

  if (error)
    return (
      <div className="quiz">
        <ScreenBar close label={t('quiz.end')} />
        <LoadError moduleId={config.moduleId} onRetry={retry} />
      </div>
    )
  if (!assets || !ready) return <div className="quiz quiz-center muted">{t('common.loading')}</div>
  if (q.phase === 'finished' || !current) return <SessionSummary />

  // When finished, show exactly what was typed (a shorter accepted form stays short); on a miss, the main answer.
  const answer = done ? (q.lastOutcome === 'failed' || !q.typing.buffer ? q.answers[0] : q.typing.buffer) : activeAnswer(q.typing.buffer, q.answers)
  const examLeft = q.endsAt ? Math.max(0, q.endsAt - now) : null
  const qLeft = q.qDeadline ? Math.max(0, q.qDeadline - now) : null
  const qFrac = qLeft !== null && config.answerTimer ? qLeft / (config.answerTimer * 1000) : null
  const note = noteFor(current, track)
  const showDefinition = config.mode !== 'hard' || done

  const kindLabel =
    config.kind === 'assessment'
      ? t('mod.exam')
      : config.kind === 'review'
        ? t('practice.review')
        : t(`format.${format}`)
  const tapped = format === 'identify' && q.picked ? q.byId[q.picked] : undefined
  const verdict =
    q.lastOutcome === 'perfect'
      ? { tone: 'good', text: t('quiz.correct') }
      : q.lastOutcome === 'ok'
        ? { tone: 'warn', text: t('quiz.triedAgain') }
        : {
            tone: 'bad',
            text: q.timedOut
              ? t('quiz.timeout')
              : q.picked === null
                ? t('quiz.skipped')
                : tapped
                  ? t('quiz.youTapped', { name: sentence(tapped.name) })
                  : t('quiz.wrong'),
          }
  // Identify starts from the region's framing (or a wider view of the structure's neighbourhood).
  const zoomedOut: CameraView = {
    target: current.camera.target,
    position: current.camera.position.map((p, i) => current.camera.target[i] + (p - current.camera.target[i]) * 1.8) as CameraView['position'],
  }
  const view = format === 'identify' && !done ? (regionView ?? zoomedOut) : current.camera

  const feedback = done ? (
    <div className="quiz-feedback" key={q.index}>
      <p className={`verdict ${verdict.tone}`}>
        {q.lastOutcome === 'failed' ? <CloseIcon size={14} /> : <CheckIcon size={14} />}
        <span>{verdict.text}</span>
      </p>
      {current.latinName.toLowerCase() !== current.name.toLowerCase() && (
        <p className="latin quiz-latin" dir="auto">
          {current.latinName}
        </p>
      )}
      <p className="quiz-def" dir="auto">
        {current.function}
      </p>
      {note && (
        <p className="note quiz-note">
          <span className="label">{t.td(`note.${note.kind}`, note.kind)}</span>
          <span className="note-text" dir="auto">
            {note.text}
          </span>
        </p>
      )}
      {paused && (
        <button className="textlink quiz-next" onClick={() => useQuiz.getState().next()}>
          {t('quiz.next')}
          <ArrowIcon size={14} />
        </button>
      )}
    </div>
  ) : null

  return (
    <div className="quiz">
      <ScreenBar
        close
        label={t('quiz.end')}
        title={
          <>
            {kindLabel} · <bdi dir="ltr">{Math.min(q.index + 1, q.queue.length)} / {q.queue.length}</bdi>
          </>
        }
        end={
          <span className={`quiz-clock num${examLeft !== null && examLeft < 30_000 ? ' warn' : ''}`}>{examLeft !== null ? formatClock(examLeft) : ''}</span>
        }
      />
      <div className="quiz-progress" aria-hidden>
        <span style={{ width: `${(q.index / Math.max(q.queue.length, 1)) * 100}%` }} />
      </div>
      <div className="timer-track" aria-hidden>
        {qFrac !== null && <span className={`timer-fill${qFrac < 0.3 ? ' low' : ''}`} style={{ transform: `scaleX(${qFrac})` }} />}
      </div>

      <div className="quiz-viewer viewer-fade">
        <Suspense fallback={null}>
          <AnatomyViewer
            assets={assets}
            highlight={highlight}
            view={view}
            ghosts={format === 'identify' ? undefined : { prev, next, index: q.index }}
            onPick={format === 'identify' && !done ? (mesh) => useQuiz.getState().tap(mesh) : undefined}
            onFraming={format === 'identify' ? setRegionView : undefined}
          />
        </Suspense>
      </div>

      {format === 'type' && (
        <>
          <section className="quiz-answer" onPointerDown={() => done && setPausedAt(q.index)}>
            {!done && <p className="label quiz-prompt">{t('mod.practiceSub')}</p>}
            {/* A wrong letter isn't an error to dwell on: say "Try again" and let it fade. */}
            {!done && tryAgain && (
              <p className="try-again" key={q.wrongCount} aria-live="assertive">
                {t('quiz.tryAgain')}
              </p>
            )}
            <AnswerWord answer={answer} typed={q.typing.buffer} mode={config.mode} done={done} outcome={q.lastOutcome} wrongCount={q.wrongCount} />
            {feedback ?? (
              <div className="quiz-feedback">
                <p className="quiz-def" dir="auto">
                  {showDefinition ? current.definition : '\u00a0'}
                </p>
                {q.typing.awaitingEnter && <p className="quiz-hint">{t('quiz.confirm')}</p>}
              </div>
            )}
          </section>
          <Keyboard
            flash={q.flash}
            onKey={onKey}
            onSkip={onSkip}
            awaitingEnter={q.typing.awaitingEnter}
            disabled={done}
            labels={{ hint: t('quiz.hint'), skip: t('quiz.skip'), space: t('quiz.space') }}
          />
        </>
      )}

      {format === 'choice' && (
        <section className="quiz-answer quiz-choice" onPointerDown={() => done && setPausedAt(q.index)}>
          {!done && <p className="label quiz-prompt">{t('quiz.choicePrompt')}</p>}
          <ol className="choices">
            {q.choices.map((id, i) => {
              const s = q.byId[id]
              const state = done ? (id === current.id ? 'right' : id === q.picked ? 'wrong' : 'dim') : ''
              return (
                <li key={id}>
                  <button className={`choice-btn ${state}`} disabled={done} onClick={() => useQuiz.getState().choose(id)}>
                    <span className="figs choice-n">{i + 1}</span>
                    <span className="choice-name">{s ? sentence(s.name) : id}</span>
                    {state === 'right' && <CheckIcon />}
                    {state === 'wrong' && <CloseIcon size={14} />}
                  </button>
                </li>
              )
            })}
          </ol>
          {feedback}
          {!done && (
            <button className="textlink quiz-skip" onClick={onSkip}>
              {t('quiz.skip')}
            </button>
          )}
        </section>
      )}

      {format === 'identify' && (
        <section className="quiz-answer quiz-identify" onPointerDown={() => done && setPausedAt(q.index)}>
          <p className="label quiz-prompt">{t('quiz.findPrompt')}</p>
          <p className="title identify-name">{sentence(current.name)}</p>
          {feedback ?? (
            <button className="textlink quiz-skip" onClick={onSkip}>
              {t('quiz.skip')}
            </button>
          )}
        </section>
      )}
    </div>
  )
}
