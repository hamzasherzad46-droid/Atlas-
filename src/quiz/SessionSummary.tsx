import { useEffect, useState } from 'react'
import { useT } from '../i18n'
import { formatClock, sentence } from '../lib/format'
import { Bar } from '../components/bits'
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
  const xp = useCountUp(q.sessionXp)
  const shownScore = useCountUp(score, 600)

  const review = () =>
    startSession({ kind: 'review', moduleId: config.moduleId, mode: 'learn', region: null, ids: missed, length: missed.length, answerTimer: 0 })

  const ratio = total ? score / total : 0
  return (
    <div className="quiz summary">
      <div className="summary-inner">
        <p className="eyebrow">{isAssessment ? t('summary.exam') : t('summary.session')}</p>
        <p className="summary-score num">
          {shownScore}
          <span className="muted"> / {total}</span>
        </p>
        <p className="subhead">{isAssessment ? t('summary.noErrors') : t('summary.firstTry')}</p>
        <Bar value={score} max={Math.max(total, 1)} color={ratio >= 0.8 ? 'var(--good)' : undefined} />

        <div className="grid-2 summary-stats">
          <div className="card stat">
            <span className="footnote">{t('summary.xp')}</span>
            <span className="stat-num num accent-text">+{xp}</span>
          </div>
          <div className="card stat">
            <span className="footnote">{t('summary.accuracy')}</span>
            <span className="stat-num num">{accuracyOf(q.keysCorrect, q.keysWrong)}%</span>
          </div>
          <div className="card stat">
            <span className="footnote">{t('summary.bestCombo')}</span>
            <span className="stat-num num">{q.bestStreak}</span>
          </div>
          <div className="card stat">
            <span className="footnote">{t('summary.time')}</span>
            <span className="stat-num num">{formatClock(q.finishedAt - q.startedAt)}</span>
          </div>
        </div>

        {missed.length > 0 && (
          <div className="section">
            <p className="group-label">
              {t('summary.review')} · {missed.length}
            </p>
            <div className="group">
              {missed.map((id) => (
                <div className="cell" key={id}>
                  <span className="cell-main cell-title">{sentence(q.byId[id]?.name ?? '')}</span>
                  {q.results.some((r) => r.id === id) ? (
                    <span className="pill bad num">{t('summary.errors', { n: errorsFor(id) })}</span>
                  ) : (
                    <span className="pill warn">{t('summary.unanswered')}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="summary-actions">
          {missed.length > 0 && (
            <button className="btn btn-primary btn-block" onClick={review}>
              {t('summary.fix')}
            </button>
          )}
          <button className={`btn btn-block ${missed.length ? 'btn-secondary' : 'btn-primary'}`} onClick={endSession}>
            {t('common.done')}
          </button>
        </div>
      </div>
    </div>
  )
}
