import { useState } from 'react'
import { TRACKS, type Track } from '../content/types'
import { CheckIcon } from '../components/Icons'
import { LANG_NAMES, useT } from '../i18n'
import { DAILY_GOALS, LANGS, useSettings } from '../state/settings'

/** First run: language, name, study track and daily goal. */
export function OnboardingScreen() {
  const t = useT()
  const s = useSettings()
  const [name, setName] = useState(s.name)
  const [track, setTrack] = useState<Track>(s.track)
  const [goal, setGoal] = useState(s.dailyGoal)

  return (
    <div className="overlay onboarding">
      <main className="page">
        <header className="brand-bar">
          <span className="wordmark">ATLAS</span>
        </header>
        <div className="page-head">
          <p className="eyebrow">{t('onb.kicker')}</p>
          <h1 className="large-title">{t('onb.title')}</h1>
          <p className="lead">{t('onb.sub')}</p>
        </div>

        <p className="group-label">{t('onb.lang')}</p>
        <div className="chips">
          {LANGS.map((l) => (
            <button key={l} className="chip" lang={l} aria-pressed={s.lang === l} onClick={() => s.set({ lang: l })}>
              {LANG_NAMES[l]}
            </button>
          ))}
        </div>

        <div className="section">
          <div className="group">
            <label className="cell">
              <span className="cell-title">{t('you.name')}</span>
              <input className="input" value={name} maxLength={24} placeholder={t('you.namePlaceholder')} onChange={(e) => setName(e.target.value)} />
            </label>
          </div>
        </div>

        <div className="section">
          <p className="group-label">{t('onb.track')}</p>
          <div className="group">
            {TRACKS.map((tr) => (
              <button key={tr} className="cell" aria-pressed={track === tr} onClick={() => setTrack(tr)}>
                <span className="cell-main">
                  <span className="cell-title">{t(`track.${tr}`)}</span>
                  <span className="cell-sub">{t(`trackHelp.${tr}`)}</span>
                </span>
                {track === tr && (
                  <span className="check">
                    <CheckIcon size={18} />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group section">
          <p className="group-label">{t('onb.goal')}</p>
          <div className="seg">
            {DAILY_GOALS.map((g) => (
              <button key={g} aria-pressed={goal === g} onClick={() => setGoal(g)}>
                {g}
              </button>
            ))}
          </div>
        </div>

        <button className="btn btn-primary btn-block start-btn" onClick={() => s.set({ name: name.trim(), track, dailyGoal: goal, onboarded: true })}>
          {t('onb.start')}
        </button>
      </main>
    </div>
  )
}
