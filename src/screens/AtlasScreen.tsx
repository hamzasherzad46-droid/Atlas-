import { useState, type ReactNode } from 'react'
import { moduleTitle } from '../content/names'
import { catalog, focusModules, getModuleInfo, regionModules, shownForBody } from '../content/loader'
import { BodyChoice } from '../components/BodyChoice'
import type { Body } from '../content/types'
import { useModule } from '../content/useModule'
import { ChevronIcon, BackIcon } from '../components/Icons'
import { Masthead } from '../components/Masthead'
import { Meter } from '../components/bits'
import { useT } from '../i18n'
import { pct } from '../lib/format'
import { startAssessment, startCards, startPractice, startReview } from '../state/actions'
import { missedCount } from '../state/dashboard'
import { ASSESSMENT_ANSWER_TIMER, ASSESSMENT_LENGTH, ASSESSMENT_TIME_MS, goBack, useNav, type QuestionFormat } from '../state/nav'
import { useProgress } from '../state/progress'
import { ANSWER_TIMERS, useSettings, type QuizMode } from '../state/settings'
import { regionStats } from '../state/stats'
import { Curriculum } from './Curriculum'
import { PlateScreen, PlatesList } from './Plates'
import { ModuleRow } from './ModuleRow'
import { TopicScreen } from './TopicScreen'

/**
 * All content on one page, every section in view (no switches to find): the body in 3D, the short
 * course modules, regions, whole systems, plates, the mock exam and every curriculum topic.
 * Rows carry their body system's colour key.
 */
export function AtlasScreen() {
  const t = useT()
  const modulePage = useNav((s) => s.modulePage)
  const plate = useNav((s) => s.plate)
  const openBody = useNav((s) => s.openBody)
  const openMock = useNav((s) => s.openMock)
  const topic = useNav((s) => s.topic)
  const body = useSettings((s) => s.body)
  const [openCategory, setOpenCategory] = useState<string | null>(null)
  if (modulePage) return <ModuleScreen id={modulePage} />
  if (plate) return <PlateScreen id={plate} />
  if (topic) return <TopicScreen key={`${topic.cat}:${topic.index}`} cat={topic.cat} index={topic.index} />

  return (
    <main className="page">
      <Masthead />
      <div className="titleblock">
        <h1 className="display">{t('atlas.title')}</h1>
      </div>
      <button className="go atlas-body" onClick={() => openBody()}>
        <span>
          {t('body.title')}
        </span>
        <ChevronIcon />
      </button>

      <section className="sect">
        <p className="label">{t('atlas.focus')}</p>
        <div className="sect-body rows atlas-list" lang="en">
          {focusModules.map((m) => (
            <ModuleRow key={m.id} info={m} sub={m.description ?? ''} />
          ))}
        </div>
      </section>

      <section className="sect">
        <p className="label">{t('atlas.regions')}</p>
        <div className="sect-body rows atlas-list">
          {regionModules.map((m) => (
            <ModuleRow key={m.id} info={m} sub={t.td(`group.${m.group}`, '')} />
          ))}
        </div>
      </section>

      <section className="sect">
        <p className="label">{t('atlas.systems')}</p>
        <div className="sect-body rows atlas-list">
          {catalog.systems.flatMap((sys) =>
            sys.modules.filter((m) => shownForBody(m, body)).map((m) => <ModuleRow key={m.id} info={{ ...m, systemId: sys.id }} sub={t.td(`system.${sys.id}`, '')} />),
          )}
        </div>
      </section>

      <section className="sect">
        <p className="label">{t('atlas.plates')}</p>
        <div className="sect-body">
          <PlatesList />
        </div>
      </section>

      <section className="sect">
        <p className="label">{t('today.mock')}</p>
        <div className="sect-body rows">
          <button className="r" onClick={() => openMock()}>
            <span className="r-main">
              <span className="r-title">{t('today.mock')}</span>
              <span className="r-sub">{t('today.mockSub')}</span>
            </span>
            <ChevronIcon />
          </button>
        </div>
      </section>

      <section className="sect">
        <p className="label">{t('atlas.curriculum')}</p>
        <div className="sect-body">
          <Curriculum open={openCategory} onOpen={setOpenCategory} />
        </div>
      </section>
    </main>
  )
}

/**
 * A module: how far along you are, then every way to study it in view. The test settings sit above
 * the tests they apply to, and the spelling quiz is the one outlined action; nothing is hidden
 * behind a link.
 */
function ModuleScreen({ id }: { id: string }) {
  const t = useT()
  const openExplore = useNav((s) => s.openExplore)
  const settings = useSettings()
  const last = settings.lastSession?.moduleId === id ? settings.lastSession : null
  const [mode, setMode] = useState<QuizMode>(last?.mode ?? 'learn')
  const [region, setRegion] = useState<string | null>(last?.region ?? null)
  const [timer, setTimer] = useState<number>(settings.answerTimer)
  const [tier, setTier] = useState<number | null>(null)
  const info = getModuleInfo(id)
  const { assets } = useModule(id)
  const records = useProgress((s) => s.records)
  if (!info) return null
  const content = assets?.content
  const stats = content ? regionStats(content, records) : []
  const total = stats.reduce((n, r) => n + r.total, 0)
  const seen = stats.reduce((n, r) => n + r.seen, 0)
  const mastered = stats.reduce((n, r) => n + r.mastered, 0)
  const mistakes = content ? missedCount(content, records) : 0
  const start = (format: QuestionFormat) => startPractice(id, region, mode, timer, tier, format)
  // The same system on the other body: one Body setting, so the rest of the app follows; this page
  // is replaced, so Back still leads where it did.
  const switchBody = (b: Body, other: string) => {
    if (b === info.body) return
    settings.set({ body: b })
    useNav.getState().go({ modulePage: other }, true)
  }

  return (
    <main className="page module-page">
      <button className="backlink" onClick={() => goBack()}>
        <BackIcon /> {t('common.back')}
      </button>

      <div className="titleblock module-titleblock">
        <p className="label">
          {info.group ? t.td(`group.${info.group}`, '') : t.td(`system.${info.systemId}`, '')}
        </p>
        <h1 className="display">{moduleTitle(t, id)}</h1>
        {info.description ? (
          <p className="lede module-blurb" lang="en">
            {info.description}
          </p>
        ) : (
          <p className="lede module-blurb">{t.td(`systemBlurb.${info.systemId}`, '')}</p>
        )}
        <p className="small module-stats num">
          {t('mod.seen', { a: seen, b: total })} · {t('atlas.mastered', { n: pct(mastered, total) })}
        </p>
        {info.body && info.counterpart && <BodyChoice className="module-body" value={info.body} onChange={(b) => switchBody(b, info.counterpart!)} />}
      </div>
      <Meter value={mastered} max={Math.max(total, 1)} />

      <section className="sect module-first">
        <p className="label">{t('mod.learn')}</p>
        <div className="sect-body rows">
          <Way title={t('mod.explore')} sub={t('mod.exploreSub')} onClick={() => openExplore(id)} />
          <Way title={t('mod.cards')} sub={t('mod.cardsSub')} onClick={() => startCards(id)} />
        </div>
      </section>

      <section className="sect">
        <p className="label">{t('mod.test')}</p>
        <div className="sect-body">
          <p className="tiny module-settings-note">{t('mod.settingsNote')}</p>
          {content && content.regions.length > 1 && (
            <Setting label={t('practice.region')}>
              <button aria-pressed={region === null} onClick={() => setRegion(null)}>
                {t('practice.all')}
              </button>
              {content.regions.map((r) => (
                <button key={r.id} aria-pressed={region === r.id} onClick={() => setRegion(r.id)}>
                  {t.td(`region.${r.id}`, r.name)}
                </button>
              ))}
            </Setting>
          )}
          <Setting label={t('practice.mode')} help={t(`mode.${mode}Help`)}>
            {(['learn', 'medium', 'hard'] as const).map((m) => (
              <button key={m} aria-pressed={mode === m} onClick={() => setMode(m)}>
                {t(`mode.${m}`)}
              </button>
            ))}
          </Setting>
          <Setting label={t('practice.level')}>
            {([null, 1, 2, 3] as const).map((lv) => (
              <button key={lv ?? 'all'} aria-pressed={tier === lv} onClick={() => setTier(lv)}>
                {t(lv ? (`tier.${lv}` as const) : 'tier.all')}
              </button>
            ))}
          </Setting>
          <Setting label={t('practice.timer')}>
            {ANSWER_TIMERS.map((s) => (
              <button key={s} className="num" aria-pressed={timer === s} onClick={() => setTimer(s)}>
                {s ? t('timer.sec', { n: s }) : t('timer.off')}
              </button>
            ))}
          </Setting>

          <button className="go module-start" onClick={() => start('type')} disabled={!assets}>
            {last ? t('today.resumeGo') : t('practice.start')}
            <ChevronIcon />
          </button>
          <p className="tiny start-note">{t('practice.answerLang')}</p>
          <div className="rows module-tests">
            <Way title={t('format.choice')} sub={t('mod.choiceSub')} onClick={() => start('choice')} disabled={!assets} />
            <Way title={t('format.identify')} sub={t('mod.identifySub')} onClick={() => start('identify')} disabled={!assets} />
          </div>
        </div>
      </section>

      <section className="sect">
        <p className="label">{t('mod.more')}</p>
        <div className="sect-body rows">
          <Way
            title={t('mod.exam')}
            sub={t('mod.examSub', { n: ASSESSMENT_LENGTH, m: ASSESSMENT_TIME_MS / 60_000, s: ASSESSMENT_ANSWER_TIMER })}
            onClick={() => startAssessment(id)}
          />
          {mistakes > 0 && <Way title={t('today.mistakes')} sub={t('mod.mistakesSub', { n: mistakes })} onClick={() => void startReview(id)} />}
        </div>
      </section>
    </main>
  )
}

function Way({ title, sub, onClick, disabled }: { title: string; sub: string; onClick(): void; disabled?: boolean }) {
  return (
    <button className="r" onClick={onClick} disabled={disabled}>
      <span className="r-main">
        <span className="r-title">{title}</span>
        <span className="r-sub num">{sub}</span>
      </span>
      <ChevronIcon />
    </button>
  )
}

function Setting({ label, help, children }: { label: string; help?: string; children: ReactNode }) {
  return (
    <div className="module-setting" role="group" aria-label={label}>
      <p className="small module-setting-label">{label}</p>
      <div className="options">{children}</div>
      {help && <p className="small option-help">{help}</p>}
    </div>
  )
}
