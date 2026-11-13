import { catalog, getModuleInfo } from '../content/loader'
import type { ModuleInfo } from '../content/types'
import { useModule } from '../content/useModule'
import { BackIcon, CardsIcon, ChevronIcon, ClockIcon, CubeIcon, KeyboardIcon } from '../components/Icons'
import { Bar } from '../components/bits'
import { useT } from '../i18n'
import { pct } from '../lib/format'
import { startAssessment, startCards, startPractice } from '../state/actions'
import { ASSESSMENT_ANSWER_TIMER, ASSESSMENT_LENGTH, ASSESSMENT_TIME_MS, useNav } from '../state/nav'
import { useProgress } from '../state/progress'
import { useSettings } from '../state/settings'
import { regionStats } from '../state/stats'

export function AtlasScreen() {
  const t = useT()
  const modulePage = useNav((s) => s.modulePage)
  if (modulePage) return <ModuleScreen id={modulePage} />

  return (
    <main className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">{t('atlas.sub')}</p>
          <h1 className="large-title">{t('atlas.title')}</h1>
        </div>
      </header>
      <div className="atlas-list">
        {catalog.systems.map((sys) => (
          <section key={sys.id} className="atlas-system">
            <div className="atlas-head">
              <h2 className="title-2">{t.td(`system.${sys.id}`, sys.id)}</h2>
              <p className="subhead">{t.td(`systemBlurb.${sys.id}`, '')}</p>
            </div>
            <div className="atlas-modules">
              {sys.modules.map((m) => (
                <ModuleRow key={m.id} info={m} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  )
}

function ModuleRow({ info }: { info: ModuleInfo }) {
  const t = useT()
  const openModule = useNav((s) => s.openModule)
  const available = info.status === 'available'
  const { assets } = useModule(available ? info.id : null)
  const records = useProgress((s) => s.records)
  const stats = assets ? regionStats(assets.content, records) : []
  const total = stats.reduce((n, r) => n + r.total, 0)
  const mastered = stats.reduce((n, r) => n + r.mastered, 0)

  return (
    <button className="cell" disabled={!available} onClick={() => openModule(info.id)}>
      <span className="cell-main">
        <span className="cell-title">{t.td(`module.${info.id}`, info.id)}</span>
        <span className="cell-sub num">
          {available ? `${t('atlas.structures', { n: total })} · ${t('atlas.mastered', { n: pct(mastered, total) })}` : t('common.soon')}
        </span>
        {available && <Bar value={mastered} max={Math.max(total, 1)} thin />}
      </span>
      {available && <ChevronIcon />}
    </button>
  )
}

function ModuleScreen({ id }: { id: string }) {
  const t = useT()
  const { openModule, openExplore } = useNav()
  const lastMode = useSettings((s) => s.lastSession?.mode ?? 'learn')
  const info = getModuleInfo(id)
  const { assets } = useModule(id)
  const records = useProgress((s) => s.records)
  if (!info) return null
  const stats = assets ? regionStats(assets.content, records) : []
  const total = stats.reduce((n, r) => n + r.total, 0)
  const seen = stats.reduce((n, r) => n + r.seen, 0)
  const mastered = stats.reduce((n, r) => n + r.mastered, 0)
  const attempts = stats.reduce((n, r) => n + r.attempts, 0)
  const correct = stats.reduce((n, r) => n + r.correct, 0)

  return (
    <main className="page module-page">
      <button className="nav-back" onClick={() => openModule(null)}>
        <BackIcon /> {t('atlas.title')}
      </button>
      <header className="page-head">
        <p className="eyebrow">{t.td(`system.${info.systemId}`, '')}</p>
        <h1 className="large-title">{t.td(`module.${id}`, id)}</h1>
      </header>

      <section className="card module-summary">
        <div className="stat-row">
          <div>
            <span className="stat-num num">
              {seen}
              <span className="muted"> / {total}</span>
            </span>
            <span className="footnote">{t('progress.seen')}</span>
          </div>
          <div>
            <span className="stat-num num">{mastered}</span>
            <span className="footnote">{t('progress.mastered')}</span>
          </div>
          <div>
            <span className="stat-num num">{attempts ? `${pct(correct, attempts)}%` : '—'}</span>
            <span className="footnote">{t('progress.accuracy')}</span>
          </div>
        </div>
        <Bar value={mastered} max={Math.max(total, 1)} />
        <span className="resume-pct num">{t('atlas.mastered', { n: pct(mastered, total) })}</span>
      </section>

      <button className="btn btn-primary btn-block module-cta" onClick={() => startPractice(id, null, lastMode)}>
        <KeyboardIcon /> {t('mod.practice')}
      </button>

      <div className="group with-icons module-actions">
        <button className="cell" onClick={() => startCards(id)}>
          <span className="icon-badge">
            <CardsIcon />
          </span>
          <span className="cell-main">
            <span className="cell-title">{t('mod.cards')}</span>
            <span className="cell-sub">{t('mod.cardsSub')}</span>
          </span>
          <ChevronIcon />
        </button>
        <button className="cell" onClick={() => openExplore(id)}>
          <span className="icon-badge">
            <CubeIcon />
          </span>
          <span className="cell-main">
            <span className="cell-title">{t('mod.explore')}</span>
            <span className="cell-sub">{t('mod.exploreSub')}</span>
          </span>
          <ChevronIcon />
        </button>
        <button className="cell" onClick={() => startAssessment(id)}>
          <span className="icon-badge">
            <ClockIcon />
          </span>
          <span className="cell-main">
            <span className="cell-title">{t('mod.exam')}</span>
            <span className="cell-sub">{t('mod.examSub', { n: ASSESSMENT_LENGTH, m: ASSESSMENT_TIME_MS / 60_000, s: ASSESSMENT_ANSWER_TIMER })}</span>
          </span>
          <ChevronIcon />
        </button>
      </div>

      <div className="section">
        <p className="group-label">{t('mod.regions')}</p>
        <div className="group">
          {stats.map((r) => (
            <button key={r.id} className="cell region-cell" onClick={() => startPractice(id, r.id, lastMode)}>
              <span className="cell-main">
                <span className="cell-title">{t.td(`region.${r.id}`, r.name)}</span>
                <span className="cell-sub">
                  {t('mod.seen', { a: r.seen, b: r.total })}
                  {r.accuracy !== null && ` · ${r.accuracy}%`}
                </span>
                <Bar value={r.mastered} max={r.total} thin />
              </span>
              <ChevronIcon />
            </button>
          ))}
        </div>
      </div>
    </main>
  )
}
