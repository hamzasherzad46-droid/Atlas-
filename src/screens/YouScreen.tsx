import { useState } from 'react'
import { ChevronIcon } from '../components/Icons'
import { CoursePicker } from '../components/CoursePicker'
import { Masthead } from '../components/Masthead'
import { LANG_NAMES, useT } from '../i18n'
import { useNav } from '../state/nav'
import { ANSWER_TIMERS, DAILY_GOALS, OFFERED_LANGS, shownLang, useSettings } from '../state/settings'
import { StudyAidNotice } from '../components/StudyAidNotice'
import { StepSlider } from '../components/StepSlider'
import { AccountSection } from './AccountSection'
import { useAccount } from '../account/account'
import { resetProgress } from '../account/sync'

/** Settings: one preference per line, label in the margin. */
export function YouScreen() {
  const t = useT()
  const s = useSettings()
  const signedIn = useAccount((a) => a.status === 'signedIn')
  const openCredits = useNav((n) => n.openCredits)
  const [confirming, setConfirming] = useState(false)

  return (
    <main className="page">
      <Masthead />
      <div className="titleblock">
        <h1 className="display">{t('tab.you')}</h1>
      </div>

      <AccountSection />

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
          <CoursePicker value={s.track} onPick={(id) => s.set({ track: id })} />
          <p className="small option-help">{t('course.kept')}</p>
        </div>
      </section>

      {OFFERED_LANGS.length > 1 && (
        <section className="sect">
          <p className="label">{t('you.language')}</p>
          <div className="sect-body options">
            {OFFERED_LANGS.map((l) => (
              <button key={l} lang={l} aria-pressed={shownLang(s.lang) === l} onClick={() => s.set({ lang: l })}>
                {LANG_NAMES[l]}
              </button>
            ))}
          </div>
        </section>
      )}

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
        <p className="label">{t('you.study')}</p>
        <div className="sect-body rows">
          <StepSlider
            id="you-goal"
            label={t('you.goal')}
            values={DAILY_GOALS}
            value={s.dailyGoal as (typeof DAILY_GOALS)[number]}
            format={(g) => t('you.goalValue', { n: g })}
            onChange={(g) => s.set({ dailyGoal: g })}
          />
          <StepSlider
            id="you-timer"
            label={t('you.timer')}
            values={ANSWER_TIMERS}
            value={s.answerTimer as (typeof ANSWER_TIMERS)[number]}
            format={(sec) => (sec ? t('timer.sec', { n: sec }) : t('timer.off'))}
            onChange={(sec) => s.set({ answerTimer: sec })}
          />
          <button className="r toggle-row" role="switch" aria-checked={s.sound} onClick={() => s.set({ sound: !s.sound })}>
            <span className="r-main">
              <span className="r-title">{t('you.sound')}</span>
              <span className="r-sub">{t('you.soundSub')}</span>
            </span>
            <span className={`switch${s.sound ? ' on' : ''}`} />
          </button>
        </div>
      </section>

      <div className="rows settings-end">
        <button className="r" onClick={() => openCredits()}>
          <span className="r-main r-title">{t('you.about')}</span>
          <ChevronIcon />
        </button>
        {/* In-page confirm: native confirm() is blocked in sandboxed hosts. */}
        <button
          className="r"
          onClick={() => {
            if (!confirming) return setConfirming(true)
            resetProgress()
            setConfirming(false)
          }}
          onBlur={() => setConfirming(false)}
        >
          <span className="r-main">
            <span className="r-title bad">{confirming ? t('you.resetConfirm') : t('you.reset')}</span>
            {confirming && <span className="r-sub">{t('you.cantUndo')}</span>}
            {confirming && signedIn && <span className="r-sub">{t('account.resetEverywhere')}</span>}
          </span>
        </button>
      </div>
      <StudyAidNotice />
    </main>
  )
}
