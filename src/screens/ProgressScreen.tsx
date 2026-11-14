import { useState } from 'react'
import { CheckIcon } from '../components/Icons'
import { Heatmap } from '../components/bits'
import { Masthead } from '../components/Masthead'
import { useModule } from '../content/useModule'
import { useT } from '../i18n'
import type { Period } from '../lib/dates'
import { formatClock, pct, sentence } from '../lib/format'
import { defaultModuleId, startReview } from '../state/actions'
import { useAssignments, useStreak } from '../state/dashboard'
import { useProgress } from '../state/progress'
import { useSettings } from '../state/settings'
import { mostMissed } from '../state/stats'

/** Your record: activity, the study plan, weak spots and exam results. */
export function ProgressScreen() {
  const t = useT()
  const moduleId = useSettings((s) => s.lastSession?.moduleId ?? defaultModuleId)
  const { assets } = useModule(moduleId)
  const { records, days, assessments } = useProgress()
  const { streak } = useStreak()
  const weak = assets ? mostMissed(assets.content, records, 5) : []
  const date = new Intl.DateTimeFormat(t.lang, { day: 'numeric', month: 'short' })

  return (
    <main className="page">
      <Masthead />
      <div className="titleblock">
        <h1 className="display">{t('progress.title')}</h1>
      </div>

      <section className="sect">
        <p className="label">{t('progress.activity')}</p>
        <div className="sect-body">
          <Heatmap days={days} />
          <p className="small streak-line num">{streak > 0 ? t('today.streakTitle', { n: streak }) : t('today.streakStart')}</p>
        </div>
      </section>

      <StudyPlan />

      <section className="sect">
        <p className="label">{t('today.weak')}</p>
        <div className="sect-body">
          <p className="tiny weak-module">{t.td(`module.${moduleId}`, moduleId)}</p>
          {weak.length === 0 ? (
            <p className="empty">{t('today.noWeak')}</p>
          ) : (
            <div className="rows">
              {weak.map((w) => {
                const p = pct(w.record.correct, w.record.attempts)
                return (
                  <button key={w.structure.id} className="r" onClick={() => void startReview(moduleId)}>
                    <span className="r-main r-title">{sentence(w.structure.name)}</span>
                    <span className={`r-value ${p < 50 ? 'bad' : 'warn'}`}>{p}%</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <section className="sect">
        <p className="label">{t('progress.exams')}</p>
        <div className="sect-body">
          {assessments.length === 0 ? (
            <p className="empty">{t('progress.noExams')}</p>
          ) : (
            <div className="rows">
              {assessments.slice(0, 5).map((a) => (
                <div key={a.at} className="r">
                  <span className="r-main">
                    <span className="r-title num">
                      {a.correct}/{a.total} · {pct(a.correct, a.total)}%
                    </span>
                    <span className="r-sub">{t.td(`module.${a.moduleId}`, a.moduleId)}</span>
                  </span>
                  <span className="r-value">
                    {date.format(a.at)} · {formatClock(a.durationMs)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

/** Day, week and month goals, ticked off as you study. */
function StudyPlan() {
  const t = useT()
  const all = useAssignments()
  const [period, setPeriod] = useState<Period>('day')
  const list = all.filter((a) => a.period === period)
  const left = list[0]?.remainingMs ?? 0
  const leftLabel = left > 48 * 3600_000 ? t('time.daysLeft', { n: Math.ceil(left / 86_400_000) }) : t('time.hoursLeft', { n: Math.max(1, Math.ceil(left / 3_600_000)) })

  return (
    <section className="sect">
      <p className="label">{t('today.assignments')}</p>
      <div className="sect-body">
        <div className="options plan-periods">
          {(['day', 'week', 'month'] as const).map((p) => (
            <button key={p} aria-pressed={period === p} onClick={() => setPeriod(p)}>
              {t(`period.${p}`)}
            </button>
          ))}
        </div>
        <div className="rows plan">
          {list.map((a) => (
            <div key={a.key} className={`r plan-item${a.done ? ' done' : ''}`}>
              <span className="tick" aria-hidden>
                {a.done && <CheckIcon size={11} />}
              </span>
              <span className="r-main r-title">{t(`assignment.${a.id}` as Parameters<typeof t>[0], { n: a.target })}</span>
              <span className={`r-value${a.done ? ' good' : ''}`}>
                {Math.min(a.value, a.target)} / {a.target}
              </span>
            </div>
          ))}
        </div>
        <p className="tiny num plan-left">{leftLabel}</p>
      </div>
    </section>
  )
}
