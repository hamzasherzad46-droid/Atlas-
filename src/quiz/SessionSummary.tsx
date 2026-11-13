import { useEffect, useState } from 'react'
import { useT } from '../i18n'
import { formatClock, sentence } from '../lib/format'
import { Meter } from '../components/bits'
import { ArrowIcon } from '../components/Icons'
import { useNav } from '../state/nav'
import { accuracyOf, useQuiz } from '../state/quiz'

/** Counts up to `to` for a satisfying tally. */
function useCountUp(to: number, ms = 900) {
  const [v, setV] = useState(0)
  useEffect(() => {
    const start = performance.now()
    let raf = 0
    const tick = (n: number) => {
      const k = Math.min(1, (n - start) / ms)
      setV(Math.round(to * (1 - Math.pow(1 - k, 3))))
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [to, ms])
  return v
}

export function SessionSummary() {
  const t = useT()
  const q = useQuiz()
  const { endSession, startSession } = useNav()
  const config = q.config!
  const isAssessment = config.kind === 'assessment'

  // Anything answered imperfectly at least once this session (or unanswered in a timed test) is listed for review.
  const unique = [...new Set(q.queue)]
  const errorsFor = (id: string) => q.results.filter((r) => r.id === id).reduce((n, r) => n + r.errors + (r.outcome === 'failed' ? 1 : 0), 0)
  const missed = unique.filter((id) => {
    const rs = q.results.filter((r) => r.id === id)
    return rs.length === 0 || rs.some((r) => r.outcome !== 'perfect')
  })
  const firstTry = new Map<string, boolean>()
  for (const r of q.results) if (!firstTry.has(r.id)) firstTry.set(r.id, r.outcome === 'perfect')
  const score = isAssessment ? unique.length - missed.length : [...firstTry.values()].filter(Boolean).length
  const total = isAssessment ? unique.length : firstTry.size
  const shownScore = useCountUp(score, 600)

  const review = () =>
    startSession({ kind: 'review', moduleId: config.moduleId, mode: 'learn', region: null, ids: missed, length: missed.length, answerTimer: 0 })

  const ratio = total ? score / total : 0
  const moduleName = t.td(`module.${config.moduleId}`, config.moduleId)
  return (
    <div className="quiz summary">
      <div className="summary-inner">
        <header className="masthead">
          <span className="wordmark">{t('app.name')}</span>
          <span className="label">{moduleName}</span>
        </header>

        <div className="titleblock">
          <p className="label">{isAssessment ? t('summary.exam') : t('summary.session')}</p>
          <p className="summary-score num">
            {shownScore}
            <span className="of">/{total}</span>
          </p>
          <p className="lede">{isAssessment ? t('summary.noErrors') : t('summary.firstTry')}</p>
        </div>
        <Meter value={score} max={Math.max(total, 1)} tone={ratio >= 0.8 ? 'good' : undefined} />

        <div className="figures summary-figures">
          <div>
            <span className="figure">{accuracyOf(q.keysCorrect, q.keysWrong)}%</span>
            <p className="label">{t('summary.accuracy')}</p>
          </div>
          <div>
            <span className="figure">{formatClock(q.finishedAt - q.startedAt)}</span>
            <p className="label">{t('summary.time')}</p>
          </div>
        </div>

        {missed.length > 0 && (
          <section className="sect">
            <p className="label">{t('summary.review')}</p>
            <div className="sect-body rows">
              {missed.map((id) => (
                <div className="r" key={id}>
                  <span className="r-main r-title">{sentence(q.byId[id]?.name ?? '')}</span>
                  {q.results.some((r) => r.id === id) ? (
                    <span className="r-value bad">{t('summary.errors', { n: errorsFor(id) })}</span>
                  ) : (
                    <span className="r-value warn">{t('summary.unanswered')}</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="summary-actions">
          {missed.length > 0 && (
            <button className="go" onClick={review}>
              {t('summary.fix')}
              <ArrowIcon />
            </button>
          )}
          <button className={`go${missed.length ? ' quiet' : ''}`} onClick={endSession}>
            {t('common.done')}
          </button>
        </div>
      </div>
    </div>
  )
}
