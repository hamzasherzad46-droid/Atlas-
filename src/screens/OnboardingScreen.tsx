import { useState } from 'react'
import { TRACKS, type Track } from '../content/types'
import { ArrowIcon } from '../components/Icons'
import { LANG_NAMES, useT } from '../i18n'
import { LANGS, useSettings } from '../state/settings'

/** First run: language and study track, then straight in. Name and daily goal can be set later in Settings. */
export function OnboardingScreen() {
  const t = useT()
  const s = useSettings()
  const [track, setTrack] = useState<Track>(s.track)

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
          <p className="label">{t('onb.track')}</p>
          <div className="sect-body">
            <div className="options">
              {TRACKS.map((tr) => (
                <button key={tr} aria-pressed={track === tr} onClick={() => setTrack(tr)}>
                  {t(`track.${tr}`)}
                </button>
              ))}
            </div>
            <p className="small option-help">{t(`trackHelp.${track}`)}</p>
          </div>
        </section>

        <div className="start-block">
          <button className="go" onClick={() => s.set({ track, onboarded: true })}>
            {t('onb.start')}
            <ArrowIcon />
          </button>
        </div>
      </main>
    </div>
  )
}
