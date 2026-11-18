import { moduleTitle } from '../content/names'
import { useT } from '../i18n'
import { formatClock, pct, sentence } from '../lib/format'
import { ChevronIcon } from '../components/Icons'
import { goBack, useNav } from '../state/nav'
import { accuracyOf, useQuiz } from '../state/quiz'
import { ScreenBar } from '../components/ScreenBar'

export function SessionSummary() {
  const t = useT()
  const q = useQuiz()
  const startSession = useNav((s) => s.startSession)
  const config = q.config!
  const isAssessment = config.kind === 'assessment'

  // Anything answered imperfectly at least once this session (or unanswered in a timed test) is listed for review.
  const unique = [...new Set(q.queue)]
  const missed = unique.filter((id) => {
    const rs = q.results.filter((r) => r.id === id)
    return rs.length === 0 || rs.some((r) => r.outcome !== 'perfect')
  })
  const firstTry = new Map<string, boolean>()
  for (const r of q.results) if (!firstTry.has(r.id)) firstTry.set(r.id, r.outcome === 'perfect')
  const score = isAssessment ? unique.length - missed.length : [...firstTry.values()].filter(Boolean).length
  const total = isAssessment ? unique.length : firstTry.size

  const review = () =>
    startSession({ kind: 'review', moduleId: config.moduleId, mode: 'learn', region: null, ids: missed, length: missed.length, answerTimer: 0 })

  const moduleName = moduleTitle(t, config.moduleId)
  return (
    <div className="quiz summary">
      <div className="summary-inner">
        <ScreenBar close title={moduleName} />

        <div className="titleblock summary-head">
          <p className="label">{isAssessment ? t('summary.exam') : t('summary.session')}</p>
          <p className="summary-score num" aria-hidden>
            {score}
            <span className="of">/{total}</span>
          </p>
          <p className="lede">{t(isAssessment ? 'summary.resultExam' : 'summary.result', { a: score, b: total })}</p>
          <p className="small summary-line num">
            {/* Typing scores keystrokes; choice and identify score answers. */}
            {t('summary.accuracy')} {(config.format ?? 'type') === 'type' ? accuracyOf(q.keysCorrect, q.keysWrong) : pct(score, total)}%
            <span aria-hidden> · </span>
            {t('summary.time')} {formatClock(q.finishedAt - q.startedAt)}
          </p>
        </div>

        {missed.length > 0 && (
          <section className="sect">
            <p className="label">{t('summary.review')}</p>
            <div className="sect-body rows">
              {missed.map((id) => (
                <div className="r" key={id}>
                  <span className="r-main r-title">{sentence(q.byId[id]?.name ?? '')}</span>
                  {q.results.some((r) => r.id === id) ? (
                    <span className="r-value bad">{t('summary.tryAgain')}</span>
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
              <ChevronIcon />
            </button>
          )}
          <button className={`go${missed.length ? ' quiet' : ''}`} onClick={() => goBack()}>
            {t('common.done')}
          </button>
        </div>
      </div>
    </div>
  )
}
