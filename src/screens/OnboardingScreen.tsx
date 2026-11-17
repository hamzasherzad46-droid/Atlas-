import { useState } from 'react'
import { getCourse } from '../content/loader'
import { ArrowIcon } from '../components/Icons'
import { CoursePicker } from '../components/CoursePicker'
import { LANG_NAMES, useT } from '../i18n'
import { OFFERED_LANGS, shownLang, useSettings } from '../state/settings'
import { Seal } from '../components/Celestial'
import { StudyAidNotice } from '../components/StudyAidNotice'

/** First run: the course first, then the language, then straight in. Everything can be changed later in Settings. */
export function OnboardingScreen() {
  const t = useT()
  const s = useSettings()
  const [track, setTrack] = useState<string>(getCourse(s.track).id)

  return (
    <div className="overlay onboarding">
      <main className="page">
        <header className="masthead">
          <span className="brand">
            <Seal />
            <span className="wordmark">{t('app.name')}</span>
          </span>
        </header>

        <div className="titleblock onb-title">
          <h1 className="display">{t('onb.track')}</h1>
          <p className="lede">{t('onb.sub')}</p>
        </div>

        <CoursePicker value={track} onPick={setTrack} />

        {OFFERED_LANGS.length > 1 && (
          <section className="sect onb-lang">
            <p className="label">{t('onb.lang')}</p>
            <div className="sect-body options">
              {OFFERED_LANGS.map((l) => (
                <button key={l} lang={l} aria-pressed={shownLang(s.lang) === l} onClick={() => s.set({ lang: l })}>
                  {LANG_NAMES[l]}
                </button>
              ))}
            </div>
          </section>
        )}

        <div className="start-block">
          <button className="go" onClick={() => s.set({ track, onboarded: true })}>
            {t('onb.start')}
            <ArrowIcon />
          </button>
          <StudyAidNotice />
        </div>
      </main>
    </div>
  )
}
