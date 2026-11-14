import { useState } from 'react'
import { catalog, getModuleInfo } from '../content/loader'
import type { ModuleInfo } from '../content/types'
import { useModule } from '../content/useModule'
import { ArrowIcon, BackIcon } from '../components/Icons'
import { Masthead } from '../components/Masthead'
import { Meter } from '../components/bits'
import { useT } from '../i18n'
import { pct } from '../lib/format'
import { tintVars } from '../lib/tint'
import { startAssessment, startCards, startPractice } from '../state/actions'
import { ASSESSMENT_ANSWER_TIMER, ASSESSMENT_LENGTH, ASSESSMENT_TIME_MS, useNav } from '../state/nav'
import { useProgress } from '../state/progress'
import { useSettings } from '../state/settings'
import { regionStats } from '../state/stats'
import { PracticeSheet } from './PracticeSheet'

/** Every module in one list; each row carries its body system's colour key. */
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
      <div className="rows atlas-list">
        {catalog.systems.flatMap((sys) => sys.modules.map((m) => <ModuleRow key={m.id} info={m} systemId={sys.id} />))}
      </div>
    </main>
  )
}

function ModuleRow({ info, systemId }: { info: ModuleInfo; systemId: string }) {
  const t = useT()
  const openModule = useNav((s) => s.openModule)
  const available = info.status === 'available'
  const { assets } = useModule(available ? info.id : null)
  const records = useProgress((s) => s.records)
  const stats = assets ? regionStats(assets.content, records) : []
  const total = stats.reduce((n, r) => n + r.total, 0)
  const mastered = stats.reduce((n, r) => n + r.mastered, 0)

  return (
    <button className="r sys" style={tintVars(systemId)} disabled={!available} onClick={() => openModule(info.id)}>
      <span className="swatch" aria-hidden />
      <span className="r-main">
        <span className="r-title">{t.td(`module.${info.id}`, info.id)}</span>
        <span className="r-sub">{available ? t.td(`system.${systemId}`, '') : t('common.soon')}</span>
      </span>
      {available && <span className="r-value">{pct(mastered, total)}%</span>}
      {available && <ArrowIcon />}
    </button>
  )
}

/** A module: how far along you are, and the four ways to study it. */
function ModuleScreen({ id }: { id: string }) {
  const t = useT()
  const { openModule, openExplore } = useNav()
  const lastMode = useSettings((s) => (s.lastSession?.moduleId === id ? s.lastSession.mode : 'learn'))
  const info = getModuleInfo(id)
  const { assets } = useModule(id)
  const records = useProgress((s) => s.records)
  const [options, setOptions] = useState(false)
  if (!info) return null
  const stats = assets ? regionStats(assets.content, records) : []
  const total = stats.reduce((n, r) => n + r.total, 0)
  const seen = stats.reduce((n, r) => n + r.seen, 0)
  const mastered = stats.reduce((n, r) => n + r.mastered, 0)

  return (
    <main className="page module-page sys" style={tintVars(info.systemId)}>
      <button className="backlink" onClick={() => openModule(null)}>
        <BackIcon /> {t('atlas.title')}
      </button>

      <div className="titleblock module-titleblock">
        <p className="label">
          <span className="swatch" aria-hidden />
          {t.td(`system.${info.systemId}`, '')}
        </p>
        <h1 className="display">{t.td(`module.${id}`, id)}</h1>
        <p className="lede module-blurb">{t.td(`systemBlurb.${info.systemId}`, '')}</p>
        <p className="small module-stats num">
          {t('mod.seen', { a: seen, b: total })} · {t('atlas.mastered', { n: pct(mastered, total) })}
        </p>
      </div>
      <Meter value={mastered} max={Math.max(total, 1)} tone="tint" />

      <button className="go module-go" onClick={() => startPractice(id, null, lastMode)}>
        {t('mod.practice')}
        <ArrowIcon />
      </button>
      <button className="textlink module-options" onClick={() => setOptions(true)}>
        {t('mod.options')}
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

      {options && <PracticeSheet moduleId={id} onClose={() => setOptions(false)} />}
    </main>
  )
}
