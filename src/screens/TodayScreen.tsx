import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { getCourse, getModuleInfo, loadCurriculum, loadPlates } from '../content/loader'
import { continueModuleId } from '../content/courses'
import { courseDescription, courseTitle, moduleTitle } from '../content/names'
import type { Course, Curriculum as CurriculumData, Plate } from '../content/types'
import { useModule } from '../content/useModule'
import { CountUp } from '../components/CountUp'
import { ChevronIcon } from '../components/Icons'
import { ModelLoading } from '../components/ModelLoading'
import { Masthead } from '../components/Masthead'
import { Meter } from '../components/bits'
import { useT } from '../i18n'
import { HERO_MODELS } from '../lib/bodyLayers'
import { bearingText, pct } from '../lib/format'
import { startAssessment, startCards, startPractice, startReview } from '../state/actions'
import { dueCards, missedCount, useAllDays, useStreak } from '../state/dashboard'
import { useNav } from '../state/nav'
import { dayKey, useProgress } from '../state/progress'
import { useSettings } from '../state/settings'
import { regionStats } from '../state/stats'
import { Curriculum } from './Curriculum'
import { ModuleRow } from './ModuleRow'
import { ViewerHud, type BearingReadout } from '../viewer/ViewerHud'

const HeroBody = lazy(() => import('../viewer/HeroBody'))

const exists = (id: string) => getModuleInfo(id)?.status === 'available'

/**
 * Today is the home page of the student's course, laid out as an instrument: the body turning
 * slowly with the student's real readouts around it (streak, cards due, accuracy, today's count),
 * the module to continue and one outlined button. Below it, as quiet lists: today's study, learn,
 * test, the course (and Change course) with its modules, its topics, and a way into all content.
 */
export function TodayScreen() {
  const t = useT()
  const { name, lastSession, dailyGoal, track } = useSettings()
  const { openExplore, openMock, openBody, openCourses, setTab } = useNav()
  const course = getCourse(track)
  const moduleId = continueModuleId(course, lastSession?.moduleId, exists)
  const { assets } = useModule(moduleId)
  const { records, cards } = useProgress()
  const days = useAllDays()
  const { streak } = useStreak()
  const now = new Date()
  const answered = days[dayKey(now)]?.answered ?? 0

  const hour = now.getHours()
  const greeting = t(hour < 12 ? 'today.morning' : hour < 18 ? 'today.afternoon' : 'today.evening')
  const dateLine = new Intl.DateTimeFormat(t.locale, { weekday: 'long', day: 'numeric', month: 'long' }).format(now)

  const content = assets?.content
  const stats = content ? regionStats(content, records) : []
  const total = stats.reduce((n, r) => n + r.total, 0)
  const mastered = stats.reduce((n, r) => n + r.mastered, 0)
  const due = content ? dueCards(content, cards) : 0
  const mistakes = content ? missedCount(content, records) : 0
  const resumed = lastSession?.moduleId === moduleId
  const region = resumed ? (lastSession?.region ?? null) : null
  const mode = resumed ? (lastSession?.mode ?? 'learn') : 'learn'
  const regionName = region ? t.td(`region.${region}`, content?.regions.find((r) => r.id === region)?.name ?? region) : t('practice.all')
  const goalDone = answered >= dailyGoal
  const forModule = moduleTitle(t, moduleId)

  // Readouts, all from the student's own record: every flashcard due now, and first-time accuracy
  // over every answer on every device.
  const allDue = Object.values(cards).filter((c) => c.dueAt <= now.getTime()).length
  const sums = Object.values(days).reduce((a, d) => ({ answered: a.answered + d.answered, correct: a.correct + d.correct }), { answered: 0, correct: 0 })

  // The camera's bearing moves the tape and rewrites the AZ/EL line without re-rendering the page.
  const tape = useRef<BearingReadout>(null)
  const azel = useRef<HTMLSpanElement>(null)
  const onBearing = useCallback(
    (az: number, el: number) => {
      tape.current?.set(az, el)
      if (azel.current) azel.current.textContent = bearingText(az, el, t('viewer.az'), t('viewer.el'))
    },
    [t],
  )

  return (
    <main className="page today">
      <Masthead />

      <section className="today-hero" aria-label={t('today.readouts')}>
        <Suspense fallback={<ModelLoading always />}>
          <HeroBody skin={HERO_MODELS.skin} bones={HERO_MODELS.bones} onBearing={onBearing} />
        </Suspense>
        <ViewerHud ref={tape} azel={false} />
        <div className="ro hero-ro hero-tl">
          <span className="hud">{t('today.streak')}</span>
          <span className="ro-v">
            <CountUp value={streak} format={t.n} />
            <small> {streak === 1 ? t('unit.day') : t('unit.days')}</small>
          </span>
        </div>
        <div className="ro ro-end hero-ro hero-tr">
          <span className="hud">{t('today.dueShort')}</span>
          <span className={`ro-v${allDue ? ' live' : ''}`}>
            <CountUp value={allDue} format={t.n} />
          </span>
        </div>
        <div className="ro hero-ro hero-bl">
          <span className="hud">{t('summary.accuracy')}</span>
          <span className="ro-v">
            {sums.answered ? (
              <>
                <CountUp value={pct(sums.correct, sums.answered)} format={t.n} />
                <small>%</small>
              </>
            ) : (
              <span aria-label={t('today.noAnswers')}>—</span>
            )}
          </span>
        </div>
        <div className="ro ro-end hero-ro hero-br">
          <span className="hud" ref={azel} aria-hidden />
          <span className="small hero-today">{t('today.count', { a: Math.min(answered, dailyGoal), b: dailyGoal })}</span>
        </div>
      </section>

      <section className="resume">
        <div className="resume-row">
          <p className="label">{resumed ? t('today.continueTitle') : t('today.startHere')}</p>
          <p className="tiny resume-count">{t('today.structures', { n: total })}</p>
        </div>
        <div className="resume-row">
          <h2 className="resume-title">{forModule}</h2>
          <p className="small resume-meta">{t('atlas.mastered', { n: pct(mastered, total) })}</p>
        </div>
        {region && <p className="tiny resume-region">{regionName}</p>}
        <Meter value={mastered} max={Math.max(total, 1)} />
        <button className="go resume-go" onClick={() => startPractice(moduleId, region, mode)}>
          {resumed ? t('today.resume') : t('practice.start')}
          <ChevronIcon />
        </button>
      </section>

      <div className="today-date">
        <p className="small">{name ? t('today.greeting', { g: greeting, name }) : t('today.greetingAlone', { g: greeting })}</p>
        <p className="tiny">{dateLine}</p>
      </div>

      <section className="sect">
        <p className="label">{t('today.study')}</p>
        <div className="sect-body rows">
          <div className="r">
            <span className="r-main">
              <span className="r-title">{t('today.goal')}</span>
              <Meter value={answered} max={dailyGoal} tone={goalDone ? 'good' : undefined} />
            </span>
            <span className={`r-value${goalDone ? ' good' : ''}`}>
              {t.n(Math.min(answered, dailyGoal))} / {t.n(dailyGoal)}
            </span>
          </div>
          <button className="r" onClick={() => startCards(moduleId)}>
            <span className="r-main">
              <span className="r-title">{t('today.cardsDue')}</span>
              <span className="r-sub">{forModule}</span>
            </span>
            <span className={`r-value${due ? ' warn' : ''}`}>{t.n(due)}</span>
            <ChevronIcon />
          </button>
          {mistakes > 0 && (
            <button className="r" onClick={() => void startReview(moduleId)}>
              <span className="r-main">
                <span className="r-title">{t('today.mistakes')}</span>
                <span className="r-sub">{forModule}</span>
              </span>
              <span className="r-value bad">{t.n(mistakes)}</span>
              <ChevronIcon />
            </button>
          )}
        </div>
      </section>

      <section className="sect">
        <p className="label">{t('mod.learn')}</p>
        <div className="sect-body rows">
          <ActionRow title={t('mod.explore')} sub={forModule} onClick={() => openExplore(moduleId)} />
          <ActionRow title={t('mod.cards')} sub={forModule} onClick={() => startCards(moduleId)} />
          <ActionRow title={t('body.title')} sub={t('body.sub')} onClick={() => openBody()} />
        </div>
        <CoursePlates course={course} />
      </section>

      <section className="sect">
        <p className="label">{t('mod.test')}</p>
        <div className="sect-body rows">
          <ActionRow title={t('format.type')} sub={forModule} onClick={() => startPractice(moduleId, region, mode, undefined, null, 'type')} />
          <ActionRow title={t('format.choice')} sub={forModule} onClick={() => startPractice(moduleId, region, mode, undefined, null, 'choice')} />
          <ActionRow title={t('format.identify')} sub={forModule} onClick={() => startPractice(moduleId, region, mode, undefined, null, 'identify')} />
          <ActionRow title={t('mod.exam')} sub={forModule} onClick={() => startAssessment(moduleId)} />
          <ActionRow title={t('today.mock')} sub={t('today.mockSub')} onClick={() => openMock()} />
        </div>
      </section>

      <section className="sect">
        <p className="label">{t('course.your')}</p>
        <div className="sect-body">
          <div className="course-line">
            <h2 className="course-line-title">{courseTitle(t, course)}</h2>
            <button className="textlink" onClick={() => openCourses()}>
              {t('course.change')}
            </button>
          </div>
          <p className="small course-line-sub">{courseDescription(t, course)}</p>
          <div className="rows atlas-list">
            {[...course.modules, ...course.regions].map((id) => {
              const m = getModuleInfo(id)
              if (!m) return null
              const sub = m.description ?? (m.group ? t.td(`group.${m.group}`, '') : t.td(`system.${m.systemId}`, ''))
              return <ModuleRow key={id} info={m} sub={sub} />
            })}
          </div>
        </div>
      </section>

      <section className="sect">
        <p className="label">{t('today.topics')}</p>
        <div className="sect-body">
          <CourseTopics course={course} />
        </div>
      </section>

      <div className="rows today-all">
        <button className="r" onClick={() => setTab('atlas')}>
          <span className="r-main">
            <span className="r-title">{t('today.allContent')}</span>
            <span className="r-sub">{t('today.allContentSub')}</span>
          </span>
          <ChevronIcon />
        </button>
      </div>
    </main>
  )
}

function ActionRow({ title, sub, onClick }: { title: string; sub: string; onClick(): void }) {
  return (
    <button className="r" onClick={onClick}>
      <span className="r-main">
        <span className="r-title">{title}</span>
        <span className="r-sub">{sub}</span>
      </span>
      <ChevronIcon />
    </button>
  )
}

/** The course's plates, in its order. */
function CoursePlates({ course }: { course: Course }) {
  const t = useT()
  const openPlate = useNav((s) => s.openPlate)
  const [plates, setPlates] = useState<Plate[]>([])
  useEffect(() => {
    let alive = true
    void loadPlates().then((p) => alive && setPlates(course.plates.flatMap((id) => p.plates.filter((x) => x.id === id))))
    return () => {
      alive = false
    }
  }, [course])
  if (!plates.length) return null
  return (
    <>
      <p className="label today-sublabel">{t('today.plates')}</p>
      <div className="sect-body rows" lang="en">
        {plates.map((p) => (
          <button key={p.id} className="r" onClick={() => openPlate(p.id)}>
            <span className="r-main r-title" dir="auto">
              {p.title}
            </span>
            <ChevronIcon />
          </button>
        ))}
      </div>
    </>
  )
}

/** The course's featured topics first, then its curriculum categories. */
function CourseTopics({ course }: { course: Course }) {
  const t = useT()
  const openTopic = useNav((s) => s.openTopic)
  const [data, setData] = useState<CurriculumData | null>(null)
  const [open, setOpen] = useState<string | null>(null)
  useEffect(() => {
    let alive = true
    void loadCurriculum().then((c) => alive && setData(c))
    return () => {
      alive = false
    }
  }, [])
  const featured = data
    ? course.topics.flatMap((title) =>
        data.categories.flatMap((c) => {
          const index = c.topics.findIndex((x) => x.title === title)
          return index >= 0 ? [{ cat: c.id, index, title }] : []
        }),
      )
    : []
  return (
    <>
      <div className="rows" lang="en">
        {featured.map((f) => (
          <button key={f.title} className="r" dir="ltr" onClick={() => openTopic({ cat: f.cat, index: f.index })}>
            <span className="r-main r-title">{f.title}</span>
            <ChevronIcon />
          </button>
        ))}
      </div>
      <p className="label today-sublabel">{t('today.allTopics')}</p>
      <Curriculum open={open} onOpen={setOpen} only={course.categories} />
    </>
  )
}
