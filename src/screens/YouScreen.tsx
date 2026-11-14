import { useState } from 'react'
import { TRACKS } from '../content/types'
import { ArrowIcon } from '../components/Icons'
import { Masthead } from '../components/Masthead'
import { LANG_NAMES, useT } from '../i18n'
import { useNav } from '../state/nav'
import { useProgress } from '../state/progress'
import { ANSWER_TIMERS, DAILY_GOALS, LANGS, useSettings } from '../state/settings'

/** Settings: one preference per line, label in the margin. */
export function YouScreen() {
  const t = useT()
  const s = useSettings()
  const reset = useProgress((p) => p.reset)
  const setCredits = useNav((n) => n.setCredits)
  const [confirming, setConfirming] = useState(false)

  return (
    <main className="page">
      <Masthead />
      <div className="titleblock">
        <h1 className="display">{t('tab.you')}</h1>
      </div>

      <section className="sect">
        <label className="label" htmlFor="you-name">
          {t('you.name')}
        </label>
        <div className="sect-body">
          <input id="you-name" className="field" value={s.name} maxLength={24} placeholder={t('you.namePlaceholder')} onChange={(e) => s.set({ name: e.target.value })} />
        </div>
      </section>

      <section className="sect">
        <p className="label">{t('you.track')}</p>
        <div className="sect-body">
          <div className="options">
            {TRACKS.map((tr) => (
              <button key={tr} aria-pressed={s.track === tr} onClick={() => s.set({ track: tr })}>
                {t(`track.${tr}`)}
              </button>
            ))}
          </div>
          <p className="small option-help">{t(`trackHelp.${s.track}`)}</p>
        </div>
      </section>

      <section className="sect">
        <p className="label">{t('you.language')}</p>
        <div className="sect-body options">
          {LANGS.map((l) => (
            <button key={l} lang={l} aria-pressed={s.lang === l} onClick={() => s.set({ lang: l })}>
              {LANG_NAMES[l]}
            </button>
          ))}
        </div>
      </section>

      <section className="sect">
        <p className="label">{t('you.theme')}</p>
        <div className="sect-body options">
          {(['light', 'dark', 'system'] as const).map((th) => (
            <button key={th} aria-pressed={s.theme === th} onClick={() => s.set({ theme: th })}>
              {t(`theme.${th}`)}
            </button>
          ))}
        </div>
      </section>

      <section className="sect">
        <p className="label">{t('you.goal')}</p>
        <div className="sect-body options">
          {DAILY_GOALS.map((g) => (
            <button key={g} className="num" aria-pressed={s.dailyGoal === g} onClick={() => s.set({ dailyGoal: g })}>
              {g}
            </button>
          ))}
        </div>
      </section>

      <section className="sect">
        <p className="label">{t('you.timer')}</p>
        <div className="sect-body options">
          {ANSWER_TIMERS.map((sec) => (
            <button key={sec} className="num" aria-pressed={s.answerTimer === sec} onClick={() => s.set({ answerTimer: sec })}>
              {sec ? t('timer.sec', { n: sec }) : t('timer.off')}
            </button>
          ))}
        </div>
      </section>

      <section className="sect">
        <p className="label">{t('you.sound')}</p>
        <div className="sect-body">
          <button className="r toggle-row" role="switch" aria-checked={s.sound} onClick={() => s.set({ sound: !s.sound })}>
            <span className="r-main r-title">{s.sound ? t('you.on') : t('you.off')}</span>
            <span className={`switch${s.sound ? ' on' : ''}`} />
          </button>
        </div>
      </section>

      <div className="rows settings-end">
        <button className="r" onClick={() => setCredits(true)}>
          <span className="r-main r-title">{t('you.about')}</span>
          <ArrowIcon />
        </button>
        {/* In-page confirm: native confirm() is blocked in sandboxed hosts. */}
        <button
          className="r"
          onClick={() => {
            if (!confirming) return setConfirming(true)
            reset()
            setConfirming(false)
          }}
          onBlur={() => setConfirming(false)}
        >
          <span className="r-main">
            <span className="r-title bad">{confirming ? t('you.resetConfirm') : t('you.reset')}</span>
            {confirming && <span className="r-sub">{t('you.cantUndo')}</span>}
          </span>
        </button>
      </div>
    </main>
  )
}
