import { catalog, getModuleInfo } from '../content/loader'
import type { ModuleInfo } from '../content/types'
import { useModule } from '../content/useModule'
import { ArrowIcon, BackIcon } from '../components/Icons'
import { Masthead } from '../components/Masthead'
import { Meter } from '../components/bits'
import { useT } from '../i18n'
import { pct, roman } from '../lib/format'
import { tintVars } from '../lib/tint'
import { startAssessment, startCards, startPractice } from '../state/actions'
import { ASSESSMENT_ANSWER_TIMER, ASSESSMENT_LENGTH, ASSESSMENT_TIME_MS, useNav } from '../state/nav'
import { useProgress } from '../state/progress'
import { useSettings } from '../state/settings'
import { regionStats } from '../state/stats'

/** The atlas as a table of contents: one numbered part per body system. */
export function AtlasScreen() {
  const t = useT()
  const modulePage = useNav((s) => s.modulePage)
  if (modulePage) return <ModuleScreen id={modulePage} />

  return (
    <main className="page">
      <Masthead />
      <div className="titleblock">
        <h1 className="display">{t('atlas.title')}</h1>
        <p className="lede">{t('atlas.sub')}</p>
      </div>
      {catalog.systems.map((sys, i) => (
        <section key={sys.id} className="sect sys atlas-part" style={tintVars(sys.id)}>
          <p className="part-number num" aria-hidden>
            {roman(i + 1)}
          </p>
          <div className="sect-body">
            <h2 className="head">{t.td(`system.${sys.id}`, sys.id)}</h2>
            <p className="small part-blurb">{t.td(`systemBlurb.${sys.id}`, '')}</p>
            <div className="rows">
              {sys.modules.map((m) => (
                <ModuleRow key={m.id} info={m} />
              ))}
            </div>
          </div>
        </section>
      ))}
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
    <button className="r" disabled={!available} onClick={() => openModule(info.id)}>
      <span className="r-main">
        <span className="r-title">{t.td(`module.${info.id}`, info.id)}</span>
        <span className="r-sub num">{available ? t('atlas.structures', { n: total }) : t('common.soon')}</span>
        {available && <Meter value={mastered} max={Math.max(total, 1)} tone="tint" />}
      </span>
      {available && <span className="r-value">{pct(mastered, total)}%</span>}
      {available && <ArrowIcon />}
    </button>
  )
}

/** A module: its standing, the ways to study it, and its regions. */
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
  const part = catalog.systems.findIndex((s) => s.id === info.systemId) + 1

  return (
    <main className="page module-page sys" style={tintVars(info.systemId)}>
      <button className="backlink" onClick={() => openModule(null)}>
        <BackIcon /> {t('atlas.title')}
      </button>

      <div className="titleblock module-titleblock">
        <p className="label">
          <span className="swatch" aria-hidden />
          {part > 0 ? `${roman(part)} · ` : ''}
          {t.td(`system.${info.systemId}`, '')}
        </p>
        <h1 className="display">{t.td(`module.${id}`, id)}</h1>
      </div>

      <div className="figures module-figures">
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
      <Meter value={mastered} max={Math.max(total, 1)} tone="tint" />

      <button className="go module-go" onClick={() => startPractice(id, null, lastMode)}>
        {t('mod.practice')}
        <ArrowIcon />
      </button>

      <div className="rows module-ways">
        <button className="r" onClick={() => startCards(id)}>
          <span className="r-main">
            <span className="r-title">{t('mod.cards')}</span>
            <span className="r-sub">{t('mod.cardsSub')}</span>
          </span>
          <ArrowIcon />
        </button>
        <button className="r" onClick={() => openExplore(id)}>
          <span className="r-main">
            <span className="r-title">{t('mod.explore')}</span>
            <span className="r-sub">{t('mod.exploreSub')}</span>
          </span>
          <ArrowIcon />
        </button>
        <button className="r" onClick={() => startAssessment(id)}>
          <span className="r-main">
            <span className="r-title">{t('mod.exam')}</span>
            <span className="r-sub num">{t('mod.examSub', { n: ASSESSMENT_LENGTH, m: ASSESSMENT_TIME_MS / 60_000, s: ASSESSMENT_ANSWER_TIMER })}</span>
          </span>
          <ArrowIcon />
        </button>
      </div>

      <section className="sect">
        <p className="label">{t('mod.regions')}</p>
        <div className="sect-body rows">
          {stats.map((r) => (
            <button key={r.id} className="r" onClick={() => startPractice(id, r.id, lastMode)}>
              <span className="r-main">
                <span className="r-title">{t.td(`region.${r.id}`, r.name)}</span>
                <span className="r-sub num">
                  {t('mod.seen', { a: r.seen, b: r.total })}
                  {r.accuracy !== null && ` · ${r.accuracy}%`}
                </span>
                <Meter value={r.mastered} max={r.total} tone="tint" />
              </span>
              <ArrowIcon />
            </button>
          ))}
        </div>
      </section>
    </main>
  )
}
