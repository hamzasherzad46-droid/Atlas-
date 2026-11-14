import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useModule } from '../content/useModule'
import { ArrowIcon, BackIcon } from '../components/Icons'
import { useT } from '../i18n'
import { startPractice } from '../state/actions'
import { ANSWER_TIMERS, useSettings, type QuizMode } from '../state/settings'

/** Practice options for one module: region, mode, level and timer, then start. Opened from the module page. */
export function PracticeSheet({ moduleId, onClose }: { moduleId: string; onClose(): void }) {
  const t = useT()
  const settings = useSettings()
  const last = settings.lastSession?.moduleId === moduleId ? settings.lastSession : null
  const [mode, setMode] = useState<QuizMode>(last?.mode ?? 'learn')
  const [region, setRegion] = useState<string | null>(last?.region ?? null)
  const [timer, setTimer] = useState<number>(settings.answerTimer)
  const [tier, setTier] = useState<number | null>(null)
  const { assets } = useModule(moduleId)

  // Portalled to <body> so it sits above the tab bar, outside the page's stacking context.
  return createPortal(
    <div className="overlay sheet" role="dialog" aria-label={t('mod.options')}>
      <main className="page">
        <button className="backlink" onClick={onClose}>
          <BackIcon /> {t.td(`module.${moduleId}`, moduleId)}
        </button>
        <div className="titleblock">
          <h1 className="display">{t('mod.options')}</h1>
        </div>

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
          <button
            className="go"
            disabled={!assets}
            onClick={() => {
              onClose() // the sheet lives outside the app shell, so close it before the session takes over
              startPractice(moduleId, region, mode, timer, tier)
            }}
          >
            {t('practice.start')}
            <ArrowIcon />
          </button>
          <p className="tiny start-note">{t('practice.answerLang')}</p>
        </div>
      </main>
    </div>,
    document.body,
  )
}
