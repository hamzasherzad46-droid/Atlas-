import { useMemo, useState } from 'react'
import { catalog, getModuleInfo } from '../content/loader'
import type { BodySystem, Structure } from '../content/types'
import { useModule } from '../content/useModule'
import { ArrowIcon, CardsIcon, CheckIcon, ChevronIcon, RedoIcon } from '../components/Icons'
import { Bar } from '../components/bits'
import { useT } from '../i18n'
import type { Period } from '../lib/dates'
import { pct, sentence } from '../lib/format'
import { defaultModuleId, startAssessment, startCards, startPractice, startReview } from '../state/actions'
import { dueCards, missedCount, useAssignments, useLevel, useStreak } from '../state/dashboard'
import { useNav } from '../state/nav'
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
  const { name, track, lastSession, dailyGoal } = useSettings()
  const setTab = useNav((s) => s.setTab)
  const moduleId = lastSession?.moduleId ?? defaultModuleId
  const info = getModuleInfo(moduleId)
  const { assets } = useModule(moduleId)
  const { records, cards, days } = useProgress()
  const { streak } = useStreak()
  const level = useLevel()
  const now = new Date()
  const answered = days[dayKey(now)]?.answered ?? 0

  const hour = now.getHours()
  const greeting = t(hour < 12 ? 'today.morning' : hour < 18 ? 'today.afternoon' : 'today.evening')

  const content = assets?.content
  const stats = content ? regionStats(content, records) : []
  const total = stats.reduce((n, r) => n + r.total, 0)
  const mastered = stats.reduce((n, r) => n + r.mastered, 0)
  const due = content ? dueCards(content, cards) : 0
  const mistakes = content ? missedCount(content, records) : 0
  const weak = content ? mostMissed(content, records, 6) : []
  const fact: Structure | undefined = content ? content.structures[hashIndex(dayKey(now), content.structures.length)] : undefined
  const region = lastSession?.region ?? null
  const regionName = region ? t.td(`region.${region}`, content?.regions.find((r) => r.id === region)?.name ?? region) : t('practice.all')
  const goalDone = answered >= dailyGoal

  return (
    <main className="page today">
      <header className="brand-bar">
        <span className="wordmark">ATLAS</span>
        <button className="pill good lg" onClick={() => setTab('you')}>
          {t(`track.${track}`)}
        </button>
      </header>

      <div className="page-head">
        <p className="eyebrow">{t('today.space')}</p>
        <h1 className="large-title">{name ? `${greeting}, ${name}.` : `${greeting}.`}</h1>
        <p className="lead">{lastSession ? t('today.resume') : t('today.begin')}</p>
      </div>

      <button className="card resume" onClick={() => startPractice(moduleId, region, lastSession?.mode ?? 'learn')}>
        <span className="title-2">{t.td(`module.${moduleId}`, moduleId)}</span>
        <span className="resume-sub">
          {t.td(`system.${info?.systemId}`, '')} · {regionName}
        </span>
        <Bar value={mastered} max={Math.max(total, 1)} />
        <span className="resume-pct num">{t('atlas.mastered', { n: pct(mastered, total) })}</span>
      </button>

      <section className="card goal">
        <div className="row">
          <span className="eyebrow">{t('today.goal')}</span>
          {goalDone ? (
            <span className="pill good">
              <CheckIcon size={12} /> {t('today.goalDone')}
            </span>
          ) : (
            <span className="goal-count num">
              {answered} <span className="muted">/ {dailyGoal}</span>
            </span>
          )}
        </div>
        <Bar value={answered} max={dailyGoal} color={goalDone ? 'var(--good)' : undefined} />
        <div className="goal-stats">
          <div>
            <span className="stat-num num">{streak}</span>
            <span className="footnote">{streak > 0 ? t('today.streak') : t('today.streakStart')}</span>
          </div>
          <div>
            <span className="stat-num num">{t('level.label', { n: level.level })}</span>
            <span className="footnote">{t(`level.${level.title}`)}</span>
          </div>
          <div>
            <span className="stat-num num">{level.xp}</span>
            <span className="footnote">{t('common.xp')}</span>
          </div>
        </div>
      </section>

      <button className="card assess" onClick={() => startAssessment(moduleId)}>
        <span className="title-2">{t('today.assess')}</span>
        <span className="assess-sub">{t('today.assessSub')}</span>
        <span className="link">
          {t('today.assessGo')} <ArrowIcon />
        </span>
      </button>

      <section className="section">
        <p className="group-label">{t('today.due')}</p>
        <div className="group with-icons">
          <button className="cell" onClick={() => startCards(moduleId)}>
            <span className="icon-badge">
              <CardsIcon />
            </span>
            <span className="cell-main cell-title">{t('today.cardsDue')}</span>
            {due > 0 ? <span className="pill warn num">{due}</span> : <span className="cell-value num">0</span>}
            <ChevronIcon />
          </button>
          <button className="cell" disabled={!mistakes} onClick={() => void startReview(moduleId)}>
            <span className="icon-badge">
              <RedoIcon />
            </span>
            <span className="cell-main cell-title">{t('today.mistakes')}</span>
            {mistakes > 0 ? <span className="pill bad num">{mistakes}</span> : <span className="cell-value num">0</span>}
            <ChevronIcon />
          </button>
        </div>
      </section>

      <Assignments />

      <section className="section">
        <div className="section-head">
          <h2 className="title-2">{t('today.systems')}</h2>
          <button className="see-all" onClick={() => setTab('atlas')}>
            {t('atlas.title')}
          </button>
        </div>
        <div className="group">
          {catalog.systems.map((s) => (
            <SystemRow key={s.id} system={s} />
          ))}
        </div>
      </section>

      {fact && (
        <section className="section">
          <p className="group-label">{t('today.fact')}</p>
          <button className="card fact" onClick={() => startCards(moduleId)}>
            <span className="title-2">{sentence(fact.name)}</span>
            {fact.latinName.toLowerCase() !== fact.name.toLowerCase() && <span className="fact-latin" dir="auto">{fact.latinName}</span>}
            <span className="fact-why" dir="auto">{fact.why}</span>
            <span className="footnote" dir="auto">{fact.function}</span>
          </button>
        </section>
      )}

      <section className="section">
        <p className="group-label">{t('today.weak')}</p>
        {weak.length === 0 ? (
          <p className="empty">{t('today.noWeak')}</p>
        ) : (
          <div className="chips">
            {weak.map((w) => (
              <button key={w.structure.id} className="chip" onClick={() => void startReview(moduleId)}>
                {sentence(w.structure.name)}{' '}
                <span className={`num weak-pct ${pct(w.record.correct, w.record.attempts) < 50 ? 'bad' : 'warn'}`}>
                  {pct(w.record.correct, w.record.attempts)}%
                </span>
              </button>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

function Assignments() {
  const t = useT()
  const all = useAssignments()
  const [period, setPeriod] = useState<Period>('day')
  const list = all.filter((a) => a.period === period)
  const doneCount = list.filter((a) => a.done).length
  const left = list[0]?.remainingMs ?? 0
  const leftLabel = left > 48 * 3600_000 ? t('time.daysLeft', { n: Math.ceil(left / 86_400_000) }) : t('time.hoursLeft', { n: Math.max(1, Math.ceil(left / 3_600_000)) })

  return (
    <section className="section">
      <div className="section-head">
        <h2 className="title-2">{t('today.assignments')}</h2>
        <span className="footnote num">
          {doneCount}/{list.length} · {leftLabel}
        </span>
      </div>
      <div className="seg assign-seg">
        {(['day', 'week', 'month'] as const).map((p) => (
          <button key={p} aria-pressed={period === p} onClick={() => setPeriod(p)}>
            {t(`period.${p}`)}
          </button>
        ))}
      </div>
      <div className="group">
        {list.map((a) => (
          <div key={a.key} className={`cell assignment${a.done ? ' done' : ''}`}>
            <span className="cell-main">
              <span className="cell-title">{t(`assignment.${a.id}` as Parameters<typeof t>[0], { n: a.target })}</span>
              <span className="cell-sub num">
                {Math.min(a.value, a.target)} / {a.target} · +{a.xp} {t('common.xp')}
              </span>
              <Bar value={a.value} max={a.target} thin color={a.done ? 'var(--good)' : undefined} />
            </span>
            {a.done && (
              <span className="done-mark" aria-label={t('common.done')}>
                <CheckIcon size={14} />
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

function SystemRow({ system }: { system: BodySystem }) {
  const t = useT()
  const openModule = useNav((s) => s.openModule)
  const available = system.modules.find((m) => m.status === 'available')
  const { assets } = useModule(available?.id ?? null)
  const records = useProgress((s) => s.records)
  const summary = useMemo(() => {
    if (!assets) return null
    const stats = regionStats(assets.content, records)
    const total = stats.reduce((a, r) => a + r.total, 0)
    return { total, mastery: pct(stats.reduce((a, r) => a + r.mastered, 0), total) }
  }, [assets, records])

  return (
    <button className="cell system-row" disabled={!available} onClick={() => available && openModule(available.id)}>
      <span className="cell-main">
        <span className="cell-title">{t.td(`system.${system.id}`, system.id)}</span>
        <span className="cell-sub num">
          {available && summary ? `${t('atlas.structures', { n: summary.total })} · ${t('atlas.mastered', { n: summary.mastery })}` : t('common.soon')}
        </span>
        {available && summary && <Bar value={summary.mastery} max={100} thin />}
      </span>
      <ChevronIcon />
    </button>
  )
}
