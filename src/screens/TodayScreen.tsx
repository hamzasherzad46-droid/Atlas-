import { getModuleInfo } from '../content/loader'
import { useModule } from '../content/useModule'
import { ArrowIcon } from '../components/Icons'
import { Masthead } from '../components/Masthead'
import { Meter } from '../components/bits'
import { useT } from '../i18n'
import { pct } from '../lib/format'
import { tintVars } from '../lib/tint'
import { defaultModuleId, startAssessment, startCards, startPractice, startReview } from '../state/actions'
import { dueCards, missedCount } from '../state/dashboard'
import { useNav } from '../state/nav'
import { dayKey, useProgress } from '../state/progress'
import { useSettings } from '../state/settings'
import { regionStats } from '../state/stats'

/** Today: pick up where you left off, and what is waiting for you. Everything else lives in its own tab. */
export function TodayScreen() {
  const t = useT()
  const { name, lastSession, dailyGoal } = useSettings()
  const openExplore = useNav((s) => s.openExplore)
  const moduleId = lastSession?.moduleId ?? defaultModuleId
  const info = getModuleInfo(moduleId)
  const { assets } = useModule(moduleId)
  const { records, cards, days } = useProgress()
  const now = new Date()
  const answered = days[dayKey(now)]?.answered ?? 0

  const hour = now.getHours()
  const greeting = t(hour < 12 ? 'today.morning' : hour < 18 ? 'today.afternoon' : 'today.evening')
  const dateLine = new Intl.DateTimeFormat(t.lang, { weekday: 'long', day: 'numeric', month: 'long' }).format(now)

  const content = assets?.content
  const stats = content ? regionStats(content, records) : []
  const total = stats.reduce((n, r) => n + r.total, 0)
  const mastered = stats.reduce((n, r) => n + r.mastered, 0)
  const due = content ? dueCards(content, cards) : 0
  const mistakes = content ? missedCount(content, records) : 0
  const region = lastSession?.region ?? null
  const regionName = region ? t.td(`region.${region}`, content?.regions.find((r) => r.id === region)?.name ?? region) : t('practice.all')
  const goalDone = answered >= dailyGoal

  return (
    <main className="page today">
      <Masthead />

      <div className="titleblock">
        <p className="label">{dateLine}</p>
        <h1 className="display">{name ? t('today.greeting', { g: greeting, name }) : t('today.greetingAlone', { g: greeting })}</h1>
      </div>

      <section className="resume sys" style={tintVars(info?.systemId)}>
        <p className="label">
          <span className="swatch" aria-hidden />
          {lastSession ? t('today.continue') : t('today.startHere')}
        </p>
        <h2 className="title">{t.td(`module.${moduleId}`, moduleId)}</h2>
        <p className="small resume-meta num">
          {regionName} · {t('atlas.mastered', { n: pct(mastered, total) })}
        </p>
        <Meter value={mastered} max={Math.max(total, 1)} tone="tint" />
        <button className="go resume-go" onClick={() => startPractice(moduleId, region, lastSession?.mode ?? 'learn')}>
          {lastSession ? t('today.resumeGo') : t('practice.start')}
          <ArrowIcon />
        </button>
        <div className="resume-links">
          <button className="textlink" onClick={() => openExplore(moduleId)}>
            {t('mod.explore')}
          </button>
          <button className="textlink" onClick={() => startAssessment(moduleId)}>
            {t('mod.exam')}
          </button>
        </div>
      </section>

      <section className="sect">
        <p className="label">{t('period.day')}</p>
        <div className="sect-body rows">
          <div className="r">
            <span className="r-main">
              <span className="r-title">{t('today.goal')}</span>
              <Meter value={answered} max={dailyGoal} tone={goalDone ? 'good' : undefined} />
            </span>
            <span className={`r-value${goalDone ? ' good' : ''}`}>
              {Math.min(answered, dailyGoal)} / {dailyGoal}
            </span>
          </div>
          <button className="r" onClick={() => startCards(moduleId)}>
            <span className="r-main r-title">{t('today.cardsDue')}</span>
            <span className={`r-value${due ? ' warn' : ''}`}>{due}</span>
            <ArrowIcon />
          </button>
          <button className="r" disabled={!mistakes} onClick={() => void startReview(moduleId)}>
            <span className="r-main r-title">{t('today.mistakes')}</span>
            <span className={`r-value${mistakes ? ' bad' : ''}`}>{mistakes}</span>
            <ArrowIcon />
          </button>
        </div>
      </section>
    </main>
  )
}
