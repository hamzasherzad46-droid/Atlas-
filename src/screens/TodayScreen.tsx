import { useMemo, useState } from 'react'
import { catalog, getModuleInfo } from '../content/loader'
import type { BodySystem, Structure } from '../content/types'
import { useModule } from '../content/useModule'
import { ArrowIcon, CheckIcon } from '../components/Icons'
import { Masthead } from '../components/Masthead'
import { Meter } from '../components/bits'
import { useT } from '../i18n'
import type { Period } from '../lib/dates'
import { pct, roman, sentence } from '../lib/format'
import { tintVars } from '../lib/tint'
import { defaultModuleId, startAssessment, startCards, startPractice, startReview } from '../state/actions'
import { dueCards, missedCount, useAssignments, useStreak } from '../state/dashboard'
import { ASSESSMENT_ANSWER_TIMER, ASSESSMENT_LENGTH, ASSESSMENT_TIME_MS, useNav } from '../state/nav'
import { dayKey, useProgress } from '../state/progress'
import { useSettings } from '../state/settings'
import { mostMissed, regionStats } from '../state/stats'

function hashIndex(key: string, n: number) {
  let h = 0
  for (const c of key) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return n ? h % n : 0
}

export function TodayScreen() {
  const t = useT()
  const { name, lastSession, dailyGoal } = useSettings()
  const openExplore = useNav((s) => s.openExplore)
  const moduleId = lastSession?.moduleId ?? defaultModuleId
  const info = getModuleInfo(moduleId)
  const { assets } = useModule(moduleId)
  const { records, cards, days } = useProgress()
  const { streak } = useStreak()
  const now = new Date()
  const answered = days[dayKey(now)]?.answered ?? 0

  const hour = now.getHours()
  const greeting = t(hour < 12 ? 'today.morning' : hour < 18 ? 'today.afternoon' : 'today.evening')
  const dateLine = new Intl.DateTimeFormat(t.lang, { weekday: 'long', day: 'numeric', month: 'long' }).format(now)

  const content = assets?.content
  const stats = content ? regionStats(content, records) : []
  const total = stats.reduce((n, r) => n + r.total, 0)
  const seen = stats.reduce((n, r) => n + r.seen, 0)
  const mastered = stats.reduce((n, r) => n + r.mastered, 0)
  const due = content ? dueCards(content, cards) : 0
  const mistakes = content ? missedCount(content, records) : 0
  const weak = content ? mostMissed(content, records, 5) : []
  const fact: Structure | undefined = content ? content.structures[hashIndex(dayKey(now), content.structures.length)] : undefined
  const region = lastSession?.region ?? null
  const regionName = region ? t.td(`region.${region}`, content?.regions.find((r) => r.id === region)?.name ?? region) : t('practice.all')

  return (
    <main className="page today">
      <Masthead />

      <div className="titleblock">
        <p className="label">{dateLine}</p>
        <h1 className="display">{name ? t('today.greeting', { g: greeting, name }) : t('today.greetingAlone', { g: greeting })}</h1>
      </div>

      <section className="sect">
        <p className="label">{lastSession ? t('today.continue') : t('today.startHere')}</p>
        <div className="sect-body">
          <h2 className="title">{t.td(`module.${moduleId}`, moduleId)}</h2>
          <p className="small continue-meta sys" style={tintVars(info?.systemId)}>
            <span className="swatch" aria-hidden />
            {t.td(`system.${info?.systemId}`, '')} · {regionName}
          </p>
          <Meter value={mastered} max={Math.max(total, 1)} />
          <p className="tiny num continue-count">
            {t('mod.seen', { a: seen, b: total })} · {t('atlas.mastered', { n: pct(mastered, total) })}
          </p>
          <button className="go" onClick={() => startPractice(moduleId, region, lastSession?.mode ?? 'learn')}>
            {lastSession ? t('today.resumeGo') : t('practice.start')}
            <ArrowIcon />
          </button>
          <button className="textlink continue-explore" onClick={() => openExplore(moduleId)}>
            {t('mod.explore')}
          </button>
        </div>
      </section>

      <section className="sect">
        <p className="label">{t('period.day')}</p>
        <div className="sect-body rows">
          <div className="r">
            <span className="r-main">
              <span className="r-title">{t('today.goal')}</span>
              <Meter value={answered} max={dailyGoal} tone={answered >= dailyGoal ? 'good' : undefined} />
            </span>
            <span className={`r-value${answered >= dailyGoal ? ' good' : ''}`}>
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
          <div className="r">
            <span className="r-main r-title">{streak > 0 ? t('today.streakTitle') : t('today.streakStart')}</span>
            {streak > 0 && <span className="r-value">{streak}</span>}
          </div>
        </div>
      </section>

      <section className="sect">
        <p className="label">{t('today.assess')}</p>
        <div className="sect-body">
          <p className="head">{t('today.assessSub')}</p>
          <p className="small assess-meta num">
            {t.td(`module.${moduleId}`, moduleId)} ·{' '}
            {t('mod.examSub', { n: ASSESSMENT_LENGTH, m: ASSESSMENT_TIME_MS / 60_000, s: ASSESSMENT_ANSWER_TIMER })}
          </p>
          <button className="go quiet" onClick={() => startAssessment(moduleId)}>
            {t('today.assessGo')}
            <ArrowIcon />
          </button>
        </div>
      </section>

      <StudyPlan />

      <section className="sect">
        <p className="label">{t('today.systems')}</p>
        <div className="sect-body rows">
          {catalog.systems.map((s, i) => (
            <SystemRow key={s.id} system={s} n={i + 1} />
          ))}
        </div>
      </section>

      {fact && (
        <section className="sect">
          <p className="label">{t('today.fact')}</p>
          <button className="sect-body fact" onClick={() => startCards(moduleId)}>
            <span className="title fact-name">{sentence(fact.name)}</span>
            {fact.latinName.toLowerCase() !== fact.name.toLowerCase() && (
              <span className="latin fact-latin" dir="auto">
                {fact.latinName}
              </span>
            )}
            <span className="fact-why" dir="auto">
              {fact.why}
            </span>
            <span className="small" dir="auto">
              {fact.function}
            </span>
          </button>
        </section>
      )}

      <section className="sect">
        <p className="label">{t('today.weak')}</p>
        <div className="sect-body">
          {weak.length === 0 ? (
            <p className="empty">{t('today.noWeak')}</p>
          ) : (
            <div className="rows">
              {weak.map((w) => {
                const p = pct(w.record.correct, w.record.attempts)
                return (
                  <button key={w.structure.id} className="r" onClick={() => void startReview(moduleId)}>
                    <span className="r-main r-title">{sentence(w.structure.name)}</span>
                    <span className={`r-value ${p < 50 ? 'bad' : 'warn'}`}>{p}%</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

function StudyPlan() {
  const t = useT()
  const all = useAssignments()
  const [period, setPeriod] = useState<Period>('day')
  const list = all.filter((a) => a.period === period)
  const left = list[0]?.remainingMs ?? 0
  const leftLabel = left > 48 * 3600_000 ? t('time.daysLeft', { n: Math.ceil(left / 86_400_000) }) : t('time.hoursLeft', { n: Math.max(1, Math.ceil(left / 3_600_000)) })

  return (
    <section className="sect">
      <p className="label">{t('today.assignments')}</p>
      <div className="sect-body">
        <div className="options plan-periods">
          {(['day', 'week', 'month'] as const).map((p) => (
            <button key={p} aria-pressed={period === p} onClick={() => setPeriod(p)}>
              {t(`period.${p}`)}
            </button>
          ))}
        </div>
        <div className="rows plan">
          {list.map((a) => (
            <div key={a.key} className={`r plan-item${a.done ? ' done' : ''}`}>
              <span className="tick" aria-hidden>
                {a.done && <CheckIcon size={11} />}
              </span>
              <span className="r-main">
                <span className="r-title">{t(`assignment.${a.id}` as Parameters<typeof t>[0], { n: a.target })}</span>
              </span>
              <span className={`r-value${a.done ? ' good' : ''}`}>
                {Math.min(a.value, a.target)} / {a.target}
              </span>
            </div>
          ))}
        </div>
        <p className="tiny num plan-left">{leftLabel}</p>
      </div>
    </section>
  )
}

function SystemRow({ system, n }: { system: BodySystem; n: number }) {
  const t = useT()
  const openModule = useNav((s) => s.openModule)
  const available = system.modules.find((m) => m.status === 'available')
  const { assets } = useModule(available?.id ?? null)
  const records = useProgress((s) => s.records)
  const mastery = useMemo(() => {
    if (!assets) return null
    const stats = regionStats(assets.content, records)
    return pct(
      stats.reduce((a, r) => a + r.mastered, 0),
      stats.reduce((a, r) => a + r.total, 0),
    )
  }, [assets, records])

  return (
    <button className="r sys" style={tintVars(system.id)} disabled={!available} onClick={() => available && openModule(available.id)}>
      <span className="r-num num">{roman(n)}</span>
      <span className="r-main r-title">{t.td(`system.${system.id}`, system.id)}</span>
      <span className="r-value">{available ? (mastery === null ? '' : `${mastery}%`) : t('common.soon')}</span>
      {available && <ArrowIcon />}
    </button>
  )
}
