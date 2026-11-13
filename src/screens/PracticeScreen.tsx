import { useState } from 'react'
import { useModule } from '../content/useModule'
import { ArrowIcon } from '../components/Icons'
import { Masthead } from '../components/Masthead'
import { useT } from '../i18n'
import { availableModules, defaultModuleId, startAssessment, startCards, startPractice, startReview } from '../state/actions'
import { missedCount } from '../state/dashboard'
import { useProgress } from '../state/progress'
import { ANSWER_TIMERS, useSettings, type QuizMode } from '../state/settings'

/** Set up a practice session: what to study and how hard, then start. */
export function PracticeScreen() {
  const t = useT()
  const settings = useSettings()
  const last = settings.lastSession
  const [moduleId, setModuleId] = useState(last?.moduleId ?? defaultModuleId)
  const [mode, setMode] = useState<QuizMode>(last?.mode ?? 'learn')
  const [region, setRegion] = useState<string | null>(last?.region ?? null)
  const [timer, setTimer] = useState<number>(settings.answerTimer)
  const [tier, setTier] = useState<number | null>(null)
  const { assets } = useModule(moduleId)
  const records = useProgress((s) => s.records)
  const missed = assets ? missedCount(assets.content, records) : 0

  return (
    <main className="page">
      <Masthead />
      <div className="titleblock">
        <h1 className="display">{t('practice.title')}</h1>
        <p className="lede">{t('practice.sub')}</p>
      </div>

      <section className="sect">
        <p className="label">{t('practice.module')}</p>
        <div className="sect-body options">
          {availableModules.map((m) => (
            <button
              key={m.id}
              aria-pressed={moduleId === m.id}
              onClick={() => {
                setModuleId(m.id)
                setRegion(null)
              }}
            >
              {t.td(`module.${m.id}`, m.id)}
            </button>
          ))}
        </div>
      </section>

      <section className="sect">
        <p className="label">{t('practice.region')}</p>
        <div className="sect-body options">
          <button aria-pressed={region === null} onClick={() => setRegion(null)}>
            {t('practice.all')}
          </button>
          {assets?.content.regions.map((r) => (
            <button key={r.id} aria-pressed={region === r.id} onClick={() => setRegion(r.id)}>
              {t.td(`region.${r.id}`, r.name)}
            </button>
          ))}
        </div>
      </section>

      <section className="sect">
        <p className="label">{t('practice.mode')}</p>
        <div className="sect-body">
          <div className="options">
            {(['learn', 'hard'] as const).map((m) => (
              <button key={m} aria-pressed={mode === m} onClick={() => setMode(m)}>
                {t(`mode.${m}`)}
              </button>
            ))}
          </div>
          <p className="small option-help">{t(mode === 'learn' ? 'mode.learnHelp' : 'mode.hardHelp')}</p>
        </div>
      </section>

      <section className="sect">
        <p className="label">{t('practice.level')}</p>
        <div className="sect-body options">
          {([null, 1, 2, 3] as const).map((lv) => (
            <button key={lv ?? 'all'} aria-pressed={tier === lv} onClick={() => setTier(lv)}>
              {t(lv ? (`tier.${lv}` as const) : 'tier.all')}
            </button>
          ))}
        </div>
      </section>

      <section className="sect">
        <p className="label">{t('practice.timer')}</p>
        <div className="sect-body options">
          {ANSWER_TIMERS.map((s) => (
            <button key={s} className="num" aria-pressed={timer === s} onClick={() => setTimer(s)}>
              {s ? t('timer.sec', { n: s }) : t('timer.off')}
            </button>
          ))}
        </div>
      </section>

      <div className="start-block">
        <button className="go" disabled={!assets} onClick={() => startPractice(moduleId, region, mode, timer, tier)}>
          {t('practice.start')}
          <ArrowIcon />
        </button>
        <p className="tiny start-note">{t('practice.answerLang')}</p>
      </div>

      <section className="sect">
        <p className="label">{t('practice.other')}</p>
        <div className="sect-body rows">
          <button className="r" onClick={() => startCards(moduleId, region)}>
            <span className="r-main">
              <span className="r-title">{t('mod.cards')}</span>
              <span className="r-sub">{t('mod.cardsSub')}</span>
            </span>
            <ArrowIcon />
          </button>
          <button className="r" onClick={() => startAssessment(moduleId)}>
            <span className="r-main">
              <span className="r-title">{t('mod.exam')}</span>
              <span className="r-sub">{t('today.examSub')}</span>
            </span>
            <ArrowIcon />
          </button>
          <button className="r" disabled={!missed} onClick={() => void startReview(moduleId)}>
            <span className="r-main">
              <span className="r-title">{t('practice.review')}</span>
              <span className="r-sub">{t('practice.reviewSub')}</span>
            </span>
            {missed > 0 && <span className="r-value bad">{missed}</span>}
            <ArrowIcon />
          </button>
        </div>
      </section>
    </main>
  )
}
