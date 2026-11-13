import { useState } from 'react'
import { useModule } from '../content/useModule'
import { CardsIcon, ChevronIcon, ClockIcon, KeyboardIcon, RedoIcon } from '../components/Icons'
import { useT } from '../i18n'
import { availableModules, defaultModuleId, startAssessment, startCards, startPractice, startReview } from '../state/actions'
import { missedCount } from '../state/dashboard'
import { useProgress } from '../state/progress'
import { ANSWER_TIMERS, useSettings, type QuizMode } from '../state/settings'

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
      <header className="page-head">
        <div>
          <p className="eyebrow">{t('practice.sub')}</p>
          <h1 className="large-title">{t('practice.title')}</h1>
        </div>
      </header>

      <p className="group-label">{t('practice.module')}</p>
      <div className="module-scroller">
        {availableModules.map((m) => (
          <button
            key={m.id}
            className="chip"
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

      <div className="form-group">
        <p className="group-label">{t('practice.mode')}</p>
        <div className="seg">
          {(['learn', 'hard'] as const).map((m) => (
            <button key={m} aria-pressed={mode === m} onClick={() => setMode(m)}>
              {t(`mode.${m}`)}
            </button>
          ))}
        </div>
        <p className="group-foot">{t(mode === 'learn' ? 'mode.learnHelp' : 'mode.hardHelp')}</p>
      </div>

      <div className="form-group">
        <p className="group-label">{t('practice.level')}</p>
        <div className="seg">
          {([null, 1, 2, 3] as const).map((lv) => (
            <button key={lv ?? 'all'} aria-pressed={tier === lv} onClick={() => setTier(lv)}>
              {t(lv ? (`tier.${lv}` as const) : 'tier.all')}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <p className="group-label">{t('practice.timer')}</p>
        <div className="seg">
          {ANSWER_TIMERS.map((s) => (
            <button key={s} aria-pressed={timer === s} onClick={() => setTimer(s)}>
              {s ? t('timer.sec', { n: s }) : t('timer.off')}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <p className="group-label">{t('practice.region')}</p>
        <div className="chips">
          <button className="chip" aria-pressed={region === null} onClick={() => setRegion(null)}>
            {t('practice.all')}
          </button>
          {assets?.content.regions.map((r) => (
            <button key={r.id} className="chip" aria-pressed={region === r.id} onClick={() => setRegion(r.id)}>
              {t.td(`region.${r.id}`, r.name)}
            </button>
          ))}
        </div>
      </div>

      <button className="btn btn-primary btn-block start-btn" disabled={!assets} onClick={() => startPractice(moduleId, region, mode, timer, tier)}>
        <KeyboardIcon /> {t('practice.start')}
      </button>
      <p className="group-foot center">{t('practice.answerLang')}</p>

      <div className="section">
        <p className="group-label">{t('practice.other')}</p>
        <div className="group with-icons">
          <button className="cell" onClick={() => startCards(moduleId, region)}>
            <span className="icon-badge">
              <CardsIcon />
            </span>
            <span className="cell-main">
              <span className="cell-title">{t('mod.cards')}</span>
              <span className="cell-sub">{t('mod.cardsSub')}</span>
            </span>
            <ChevronIcon />
          </button>
          <button className="cell" onClick={() => startAssessment(moduleId)}>
            <span className="icon-badge">
              <ClockIcon />
            </span>
            <span className="cell-main">
              <span className="cell-title">{t('mod.exam')}</span>
              <span className="cell-sub">{t('today.examSub')}</span>
            </span>
            <ChevronIcon />
          </button>
          <button className="cell" disabled={!missed} onClick={() => void startReview(moduleId)}>
            <span className="icon-badge">
              <RedoIcon />
            </span>
            <span className="cell-main">
              <span className="cell-title">{t('practice.review')}</span>
              <span className="cell-sub">{t('practice.reviewSub')}</span>
            </span>
            {missed > 0 && <span className="pill bad num">{missed}</span>}
            <ChevronIcon />
          </button>
        </div>
      </div>
    </main>
  )
}
