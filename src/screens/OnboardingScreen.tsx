import { useState } from 'react'
import { TRACKS, type Track } from '../content/types'
import { ArrowIcon } from '../components/Icons'
import { LANG_NAMES, useT } from '../i18n'
import { DAILY_GOALS, LANGS, useSettings } from '../state/settings'

/** First run, set like a title page: language, name, study track and daily goal. */
export function OnboardingScreen() {
  const t = useT()
  const s = useSettings()
  const [name, setName] = useState(s.name)
  const [track, setTrack] = useState<Track>(s.track)
  const [goal, setGoal] = useState(s.dailyGoal)

  return (
    <div className="overlay onboarding">
      <main className="page">
        <header className="masthead">
          <span className="wordmark">{t('app.name')}</span>
        </header>
        <div className="titleblock onb-title">
          <p className="label">{t('onb.kicker')}</p>
          <h1 className="display">{t('onb.title')}</h1>
          <p className="lede">{t('onb.sub')}</p>
        </div>

        <section className="sect">
          <p className="label">{t('onb.lang')}</p>
          <div className="sect-body options">
            {LANGS.map((l) => (
              <button key={l} lang={l} aria-pressed={s.lang === l} onClick={() => s.set({ lang: l })}>
                {LANG_NAMES[l]}
              </button>
            ))}
          </div>
        </section>

        <section className="sect">
          <label className="label" htmlFor="onb-name">
            {t('you.name')}
          </label>
          <div className="sect-body">
            <input id="onb-name" className="field" value={name} maxLength={24} placeholder={t('you.namePlaceholder')} onChange={(e) => setName(e.target.value)} />
          </div>
        </section>

        <section className="sect">
          <p className="label">{t('onb.track')}</p>
          <div className="sect-body">
            {TRACKS.map((tr) => (
              <button key={tr} className="choice" aria-pressed={track === tr} onClick={() => setTrack(tr)}>
                <span className="choice-mark" aria-hidden />
                <span className="r-main">
                  <span className="r-title">{t(`track.${tr}`)}</span>
                  <span className="r-sub">{t(`trackHelp.${tr}`)}</span>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="sect">
          <p className="label">{t('onb.goal')}</p>
          <div className="sect-body options">
            {DAILY_GOALS.map((g) => (
              <button key={g} className="num" aria-pressed={goal === g} onClick={() => setGoal(g)}>
                {g}
              </button>
            ))}
          </div>
        </section>

        <div className="start-block">
          <button className="go" onClick={() => s.set({ name: name.trim(), track, dailyGoal: goal, onboarded: true })}>
            {t('onb.start')}
            <ArrowIcon />
          </button>
        </div>
      </main>
    </div>
  )
}
