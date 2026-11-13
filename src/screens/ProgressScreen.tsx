import { useState } from 'react'
import { Bar, Heatmap } from '../components/bits'
import { useModule } from '../content/useModule'
import { useT } from '../i18n'
import { formatClock, pct, sentence } from '../lib/format'
import { isMastered } from '../lib/srs'
import { availableModules, defaultModuleId } from '../state/actions'
import { useLevel } from '../state/dashboard'
import { useProgress } from '../state/progress'
import { mostMissed, regionStats } from '../state/stats'

export function ProgressScreen() {
  const t = useT()
  const [moduleId, setModuleId] = useState(defaultModuleId)
  const { assets } = useModule(moduleId)
  const { records, days, assessments } = useProgress()
  const level = useLevel()

  const content = assets?.content
  const regions = content ? regionStats(content, records) : []
  const seen = regions.reduce((n, r) => n + r.seen, 0)
  const mastered = regions.reduce((n, r) => n + r.mastered, 0)
  const attempts = regions.reduce((n, r) => n + r.attempts, 0)
  const correct = regions.reduce((n, r) => n + r.correct, 0)
  const missed = content ? mostMissed(content, records) : []

  return (
    <main className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">
            {t('level.label', { n: level.level })} · {t(`level.${level.title}`)}
          </p>
          <h1 className="large-title">{t('progress.title')}</h1>
        </div>
      </header>

      <div className="stat-grid">
        <div className="card stat">
          <span className="footnote">{t('progress.totalXp')}</span>
          <span className="stat-num num accent-text">{level.xp}</span>
        </div>
        <div className="card stat">
          <span className="footnote">{t('progress.mastered')}</span>
          <span className="stat-num num">{mastered}</span>
        </div>
        <div className="card stat">
          <span className="footnote">{t('progress.accuracy')}</span>
          <span className="stat-num num">{attempts ? `${pct(correct, attempts)}%` : '—'}</span>
        </div>
      </div>

      <section className="section card">
        <div className="row heat-head">
          <span className="headline">{t('progress.activity')}</span>
          <span className="caption heat-legend">
            {t('progress.less')} <span className="heat-cell l1" /> <span className="heat-cell l2" /> <span className="heat-cell l3" />{' '}
            <span className="heat-cell l4" /> {t('progress.more')}
          </span>
        </div>
        <Heatmap days={days} />
      </section>

      <div className="module-scroller section">
        {availableModules.map((m) => (
          <button
            key={m.id}
            className="chip"
            aria-pressed={moduleId === m.id}
            onClick={() => setModuleId(m.id)}
          >
            {t.td(`module.${m.id}`, m.id)}
          </button>
        ))}
      </div>

      <div className="section">
        <p className="group-label">
          {t('progress.byRegion')} · {t('progress.seen')} {seen}/{content?.structures.length ?? 0}
        </p>
        <div className="group">
          {regions.map((r) => (
            <div key={r.id} className="cell">
              <span className="cell-main">
                <span className="row">
                  <span className="cell-title">{t.td(`region.${r.id}`, r.name)}</span>
                  <span className="cell-value num">{r.accuracy === null ? t('progress.notStarted') : `${r.accuracy}%`}</span>
                </span>
                <Bar value={r.accuracy ?? 0} max={100} />
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <p className="group-label">{t('progress.mostMissed')}</p>
        {missed.length === 0 ? (
          <div className="group">
            <p className="cell empty-cell">{t('progress.noMisses')}</p>
          </div>
        ) : (
          <div className="group">
            {missed.map(({ structure, record, misses }) => (
              <div key={structure.id} className="cell">
                <span className="cell-main cell-title">{sentence(structure.name)}</span>
                <span className="cell-value num">
                  {t('progress.missed', { n: misses })} · {pct(record.correct, record.attempts)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="section">
        <p className="group-label">{t('progress.exams')}</p>
        <div className="group">
          {assessments.length === 0 ? (
            <p className="cell empty-cell">{t('progress.noExams')}</p>
          ) : (
            assessments.slice(0, 8).map((a) => (
              <div key={a.at} className="cell">
                <span className="cell-main">
                  <span className="cell-title num">
                    {a.correct}/{a.total} · {pct(a.correct, a.total)}%
                  </span>
                  <span className="cell-sub">{t.td(`module.${a.moduleId}`, a.moduleId)}</span>
                </span>
                <span className="cell-value num">
                  {new Intl.DateTimeFormat(t.lang, { day: 'numeric', month: 'short' }).format(a.at)} · {formatClock(a.durationMs)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="section">
        <p className="group-label">{t('progress.every')}</p>
        <div className="group">
          {content?.structures.map((s) => {
            const r = records[s.id]
            return (
              <div key={s.id} className="cell compact">
                <span className={`cell-main${isMastered(r) ? ' mastered' : ''}`}>{sentence(s.name)}</span>
                <span className="cell-value num small">{r ? `${pct(r.correct, r.attempts)}% · ${r.attempts}×` : '—'}</span>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
