import { useState } from 'react'
import { catalog, getModuleInfo, regionModules } from '../content/loader'
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
import { Curriculum } from './Curriculum'
import { PlateScreen, PlatesList } from './Plates'
import { PracticeSheet } from './PracticeSheet'
import { TopicScreen } from './TopicScreen'

type AtlasView = 'regions' | 'systems' | 'plates' | 'curriculum'

/**
 * The atlas, four ways in: focused regions (one part of the body at a time), whole systems,
 * labelled historical plates, and the full curriculum index. Rows carry their body system's colour key.
 */
export function AtlasScreen() {
  const t = useT()
  const modulePage = useNav((s) => s.modulePage)
  const plate = useNav((s) => s.plate)
  const openBody = useNav((s) => s.openBody)
  const topic = useNav((s) => s.topic)
  const [view, setView] = useState<AtlasView>(plate ? 'plates' : topic ? 'curriculum' : 'regions')
  const [openCategory, setOpenCategory] = useState<string | null>(null)
  if (modulePage) return <ModuleScreen id={modulePage} />
  if (plate) return <PlateScreen id={plate} />
  if (topic) return <TopicScreen key={`${topic.cat}:${topic.index}`} cat={topic.cat} index={topic.index} />

  return (
    <main className="page">
      <Masthead />
      <div className="titleblock">
        <h1 className="display">{t('atlas.title')}</h1>
        <p className="lede">{t('atlas.sub')}</p>
      </div>
      <button className="go atlas-body" onClick={() => openBody(true)}>
        <span>
          {t('body.title')} <span className="go-sub">· {t('body.short')}</span>
        </span>
        <ArrowIcon />
      </button>
      <div className="options atlas-views">
        {(['regions', 'systems', 'plates', 'curriculum'] as const).map((v) => (
          <button key={v} aria-pressed={view === v} onClick={() => setView(v)}>
            {t(`atlas.${v}`)}
          </button>
        ))}
      </div>
      {view === 'regions' && (
        <div className="rows atlas-list">
          {regionModules.map((m) => (
            <ModuleRow key={m.id} info={m} systemId={m.systemId ?? 'skeletal'} sub={t.td(`group.${m.group}`, '')} />
          ))}
        </div>
      )}
      {view === 'systems' && (
        <div className="rows atlas-list">
          {catalog.systems.flatMap((sys) => sys.modules.map((m) => <ModuleRow key={m.id} info={m} systemId={sys.id} sub={t.td(`system.${sys.id}`, '')} />))}
        </div>
      )}
      {view === 'plates' && <PlatesList />}
      {view === 'curriculum' && <Curriculum open={openCategory} onOpen={setOpenCategory} />}
    </main>
  )
}

function ModuleRow({ info, systemId, sub }: { info: ModuleInfo; systemId: string; sub: string }) {
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
        <span className="r-sub">{available ? sub : t('common.soon')}</span>
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
          {info.group ? t.td(`group.${info.group}`, '') : t.td(`system.${info.systemId}`, '')}
        </p>
        <h1 className="display">{t.td(`module.${id}`, id)}</h1>
        <p className="lede module-blurb">{t.td(`systemBlurb.${info.systemId}`, '')}</p>
        <p className="small module-stats num">
          {t('mod.seen', { a: seen, b: total })} · {t('atlas.mastered', { n: pct(mastered, total) })}
        </p>
      </div>
      <Meter value={mastered} max={Math.max(total, 1)} tone="tint" />

      <button className="go module-go" onClick={() => startPractice(id, null, lastMode)}>
        <span>
          {t('mod.practice')} <span className="go-sub">· {t('format.type')}</span>
        </span>
        <ArrowIcon />
      </button>
      <button className="textlink module-options" onClick={() => setOptions(true)}>
        {t('mod.options')}
      </button>

      <section className="sect module-ways">
        <p className="label">{t('mod.learn')}</p>
        <div className="sect-body rows">
          <button className="r" onClick={() => openExplore(id)}>
            <span className="r-main">
              <span className="r-title">{t('mod.explore')}</span>
              <span className="r-sub">{t('mod.exploreSub')}</span>
            </span>
            <ArrowIcon />
          </button>
          <button className="r" onClick={() => startCards(id)}>
            <span className="r-main">
              <span className="r-title">{t('mod.cards')}</span>
              <span className="r-sub">{t('mod.cardsSub')}</span>
            </span>
            <ArrowIcon />
          </button>
        </div>
      </section>

      <section className="sect">
        <p className="label">{t('mod.test')}</p>
        <div className="sect-body rows">
          <button className="r" onClick={() => startPractice(id, null, lastMode, undefined, null, 'choice')}>
            <span className="r-main">
              <span className="r-title">{t('format.choice')}</span>
              <span className="r-sub">{t('mod.choiceSub')}</span>
            </span>
            <ArrowIcon />
          </button>
          <button className="r" onClick={() => startPractice(id, null, lastMode, undefined, null, 'identify')}>
            <span className="r-main">
              <span className="r-title">{t('format.identify')}</span>
              <span className="r-sub">{t('mod.identifySub')}</span>
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
      </section>

      {options && <PracticeSheet moduleId={id} onClose={() => setOptions(false)} />}
    </main>
  )
}
