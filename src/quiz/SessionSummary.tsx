import { moduleTitle } from '../content/names'
import { useT } from '../i18n'
import { formatClock, pct, sentence } from '../lib/format'
import { ChevronIcon } from '../components/Icons'
import { goBack, useNav } from '../state/nav'
import { accuracyOf, useQuiz } from '../state/quiz'
import { ScreenBar } from '../components/ScreenBar'
import { CountUp } from '../components/CountUp'

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
  // Typing scores keystrokes; choice and identify score answers.
  const accuracy = (config.format ?? 'type') === 'type' ? accuracyOf(q.keysCorrect, q.keysWrong) : pct(score, total)
  // Structures answered for the first time ever in this session.
  const answeredIds = new Set(q.results.map((r) => r.id))
  const fresh = q.unseen.filter((id) => answeredIds.has(id)).length

  return (
    <div className="quiz summary">
      <div className="summary-inner">
        <ScreenBar close title={moduleName} />

        <section className="summary-head">
          <p className="label">{isAssessment ? t('summary.exam') : t('summary.session')}</p>
          <p className="summary-score big-number" dir="ltr">
            <CountUp value={score} format={t.n} />
            <span className="of"> / {t.n(total)}</span>
          </p>
          <p className="lede">{t(isAssessment ? 'summary.resultExam' : 'summary.result', { a: score, b: total })}</p>
        </section>

        {/* The session's readouts, side by side between hairlines. */}
        <div className="summary-ro">
          <div className="ro">
            <span className="hud">{t('summary.accuracy')}</span>
            <span className="ro-v">
              <CountUp value={accuracy} format={t.n} />
              <small>%</small>
            </span>
          </div>
          <div className="ro">
            <span className="hud">{t('summary.time')}</span>
            <span className="ro-v">{formatClock(q.finishedAt - q.startedAt)}</span>
          </div>
          <div className="ro">
            <span className="hud">{t('summary.new')}</span>
            <span className="ro-v">
              <CountUp value={fresh} format={t.n} />
            </span>
          </div>
        </div>

        {missed.length > 0 && (
          <section className="sect">
            <p className="label">
              {t('summary.review')} · {t.n(missed.length)}
            </p>
            <div className="sect-body rows">
              {missed.map((id) => (
                <div className="r" key={id}>
                  <span className="r-main r-title">{sentence(q.byId[id]?.name ?? '')}</span>
                  {q.results.some((r) => r.id === id) ? (
                    <span className="r-value bad">{t('summary.tryAgain')}</span>
                  ) : (
                    <span className="r-value">{t('summary.unanswered')}</span>
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
