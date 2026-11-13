import { useState } from 'react'
import { TRACKS } from '../content/types'
import { CheckIcon, ChevronIcon } from '../components/Icons'
import { Bar } from '../components/bits'
import { LANG_NAMES, useT } from '../i18n'
import { useLevel } from '../state/dashboard'
import { useNav } from '../state/nav'
import { useProgress } from '../state/progress'
import { ANSWER_TIMERS, DAILY_GOALS, LANGS, useSettings } from '../state/settings'

export function YouScreen() {
  const t = useT()
  const s = useSettings()
  const reset = useProgress((p) => p.reset)
  const setCredits = useNav((n) => n.setCredits)
  const level = useLevel()
  const [confirming, setConfirming] = useState(false)
  const initial = (s.name.trim()[0] ?? '').toUpperCase()

  return (
    <main className="page">
      <header className="page-head">
        <h1 className="large-title">{t('you.title')}</h1>
      </header>

      <section className="card profile">
        <span className="profile-avatar num">{initial || level.level}</span>
        <div className="profile-main">
          <p className="title-2">{s.name || t(`level.${level.title}`)}</p>
          <p className="footnote">
            {t('level.label', { n: level.level })} · {t(`level.${level.title}`)} · <span className="num">{level.xp} XP</span>
          </p>
          <Bar value={level.into} max={level.span} />
        </div>
      </section>

      <div className="section">
        <div className="group">
          <label className="cell">
            <span className="cell-title">{t('you.name')}</span>
            <input className="input" value={s.name} maxLength={24} placeholder={t('you.namePlaceholder')} onChange={(e) => s.set({ name: e.target.value })} />
          </label>
        </div>
      </div>

      <div className="section">
        <p className="group-label">{t('you.track')}</p>
        <div className="group">
          {TRACKS.map((tr) => (
            <button key={tr} className="cell" aria-pressed={s.track === tr} onClick={() => s.set({ track: tr })}>
              <span className="cell-main">
                <span className="cell-title">{t(`track.${tr}`)}</span>
                <span className="cell-sub">{t(`trackHelp.${tr}`)}</span>
              </span>
              {s.track === tr && (
                <span className="check">
                  <CheckIcon size={18} />
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="section">
        <p className="group-label">{t('you.language')}</p>
        <div className="group">
          {LANGS.map((l) => (
            <button key={l} className="cell" lang={l} aria-pressed={s.lang === l} onClick={() => s.set({ lang: l })}>
              <span className="cell-main cell-title">{LANG_NAMES[l]}</span>
              {s.lang === l && (
                <span className="check">
                  <CheckIcon size={18} />
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group section">
        <p className="group-label">{t('you.theme')}</p>
        <div className="seg">
          {(['dark', 'light', 'system'] as const).map((th) => (
            <button key={th} aria-pressed={s.theme === th} onClick={() => s.set({ theme: th })}>
              {t(`theme.${th}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <p className="group-label">{t('you.goal')}</p>
        <div className="seg">
          {DAILY_GOALS.map((g) => (
            <button key={g} aria-pressed={s.dailyGoal === g} onClick={() => s.set({ dailyGoal: g })}>
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <p className="group-label">{t('you.timer')}</p>
        <div className="seg">
          {ANSWER_TIMERS.map((sec) => (
            <button key={sec} aria-pressed={s.answerTimer === sec} onClick={() => s.set({ answerTimer: sec })}>
              {sec ? t('timer.sec', { n: sec }) : t('timer.off')}
            </button>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="group">
          <button className="cell" role="switch" aria-checked={s.sound} onClick={() => s.set({ sound: !s.sound })}>
            <span className="cell-main cell-title">{t('you.sound')}</span>
            <span className={`switch${s.sound ? ' on' : ''}`} />
          </button>
        </div>
      </div>

      <div className="section">
        <p className="group-label">{t('you.data')}</p>
        <div className="group">
          {/* In-page confirm: native confirm() is blocked in sandboxed hosts. */}
          <button
            className="cell"
            onClick={() => {
              if (!confirming) return setConfirming(true)
              reset()
              setConfirming(false)
            }}
            onBlur={() => setConfirming(false)}
          >
            <span className="cell-main">
              <span className="cell-title danger">{confirming ? t('you.resetConfirm') : t('you.reset')}</span>
              {confirming && <span className="cell-sub">{t('you.cantUndo')}</span>}
            </span>
          </button>
          <button className="cell" onClick={() => setCredits(true)}>
            <span className="cell-main cell-title">{t('you.about')}</span>
            <ChevronIcon />
          </button>
        </div>
      </div>
    </main>
  )
}
