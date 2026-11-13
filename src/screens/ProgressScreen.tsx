import { useState } from 'react'
import { Heatmap, Meter } from '../components/bits'
import { Masthead } from '../components/Masthead'
import { useModule } from '../content/useModule'
import { useT } from '../i18n'
import { formatClock, pct, sentence } from '../lib/format'
import { isMastered } from '../lib/srs'
import { availableModules, defaultModuleId } from '../state/actions'
import { useProgress } from '../state/progress'
import { mostMissed, regionStats } from '../state/stats'

/** A record of study, set as tables. */
export function ProgressScreen() {
  const t = useT()
  const [moduleId, setModuleId] = useState(defaultModuleId)
  const { assets } = useModule(moduleId)
  const { records, days, assessments } = useProgress()

  const content = assets?.content
  const regions = content ? regionStats(content, records) : []
  const total = regions.reduce((n, r) => n + r.total, 0)
  const seen = regions.reduce((n, r) => n + r.seen, 0)
  const mastered = regions.reduce((n, r) => n + r.mastered, 0)
  const attempts = regions.reduce((n, r) => n + r.attempts, 0)
  const correct = regions.reduce((n, r) => n + r.correct, 0)
  const missed = content ? mostMissed(content, records) : []
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
          <p className="tiny heat-legend" aria-hidden>
            {t('progress.less')} <span className="heat-cell l1" />
            <span className="heat-cell l2" />
            <span className="heat-cell l3" />
            <span className="heat-cell l4" /> {t('progress.more')}
          </p>
        </div>
      </section>

      <section className="sect">
        <p className="label">{t('practice.module')}</p>
        <div className="sect-body options">
          {availableModules.map((m) => (
            <button key={m.id} aria-pressed={moduleId === m.id} onClick={() => setModuleId(m.id)}>
              {t.td(`module.${m.id}`, m.id)}
            </button>
          ))}
        </div>
      </section>

      <div className="figures progress-figures">
        <div>
          <span className="figure">
            {seen}
            <span className="of">/{total}</span>
          </span>
          <p className="label">{t('progress.seen')}</p>
        </div>
        <div>
          <span className="figure">{mastered}</span>
          <p className="label">{t('progress.mastered')}</p>
        </div>
        <div>
          <span className="figure">{attempts ? `${pct(correct, attempts)}%` : '—'}</span>
          <p className="label">{t('progress.accuracy')}</p>
        </div>
      </div>

      <section className="sect">
        <p className="label">{t('progress.byRegion')}</p>
        <div className="sect-body rows">
          {regions.map((r) => (
            <div key={r.id} className="r">
              <span className="r-main">
                <span className="r-title">{t.td(`region.${r.id}`, r.name)}</span>
                <Meter value={r.accuracy ?? 0} max={100} />
              </span>
              <span className="r-value">{r.accuracy === null ? t('progress.notStarted') : `${r.accuracy}%`}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="sect">
        <p className="label">{t('progress.mostMissed')}</p>
        <div className="sect-body">
          {missed.length === 0 ? (
            <p className="empty">{t('progress.noMisses')}</p>
          ) : (
            <div className="rows">
              {missed.map(({ structure, record, misses }) => (
                <div key={structure.id} className="r">
                  <span className="r-main r-title">{sentence(structure.name)}</span>
                  <span className="r-value">
                    <span className="bad">{t('progress.missed', { n: misses })}</span> · {pct(record.correct, record.attempts)}%
                  </span>
                </div>
              ))}
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
              {assessments.slice(0, 8).map((a) => (
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

      <section className="sect">
        <p className="label">{t('progress.every')}</p>
        <div className="sect-body rows index-table">
          {content?.structures.map((s) => {
            const r = records[s.id]
            return (
              <div key={s.id} className="r">
                <span className="r-main r-title">
                  {sentence(s.name)}
                  {isMastered(r) && <span className="mastered-mark" aria-label={t('progress.mastered')} />}
                </span>
                <span className="r-value">{r ? `${pct(r.correct, r.attempts)}% · ${r.attempts}×` : '—'}</span>
              </div>
            )
          })}
        </div>
      </section>
    </main>
  )
}
