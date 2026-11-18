import { useEffect, useState } from 'react'
import { getCourse, getModuleInfo, loadCurriculum, loadPlates } from '../content/loader'
import { continueModuleId } from '../content/courses'
import { courseDescription, courseTitle, moduleTitle } from '../content/names'
import type { Course, Curriculum as CurriculumData, Plate } from '../content/types'
import { useModule } from '../content/useModule'
import { ChevronIcon } from '../components/Icons'
import { Engraving } from '../components/Engraving'
import { Masthead } from '../components/Masthead'
import { Meter } from '../components/bits'
import { useT } from '../i18n'
import { pct } from '../lib/format'
import { tintVars } from '../lib/tint'
import { startAssessment, startCards, startPractice, startReview } from '../state/actions'
import { dueCards, missedCount, useAllDays } from '../state/dashboard'
import { useNav } from '../state/nav'
import { dayKey, useProgress } from '../state/progress'
import { useSettings } from '../state/settings'
import { regionStats } from '../state/stats'
import { Curriculum } from './Curriculum'
import { ModuleRow } from './ModuleRow'

const exists = (id: string) => getModuleInfo(id)?.status === 'available'

/**
 * Today is the home page of the student's course. One thing leads: the module to continue, with its
 * cover engraving and one brass button. Then, as quiet rows: today's study, learn, test, the course
 * (and Change course) with its modules, its topics, and a way into all content.
 */
export function TodayScreen() {
  const t = useT()
  const { name, lastSession, dailyGoal, track } = useSettings()
  const { openExplore, openMock, openBody, openCourses, setTab } = useNav()
  const course = getCourse(track)
  const moduleId = continueModuleId(course, lastSession?.moduleId, exists)
  const info = getModuleInfo(moduleId)
  const { assets } = useModule(moduleId)
  const { records, cards } = useProgress()
  const days = useAllDays()
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

  return (
    <main className="page today">
      <Masthead />

      <div className="today-date">
        <p className="label">{dateLine}</p>
        <p className="small">{name ? t('today.greeting', { g: greeting, name }) : t('today.greetingAlone', { g: greeting })}</p>
      </div>

      <section className="resume sys" style={tintVars(info?.systemId)}>
        {info?.cover && <Engraving name={info.cover} className="resume-cover" />}
        <p className="label">
          <span className="swatch" aria-hidden />
          {resumed ? t('today.continueTitle') : t('today.startHere')}
        </p>
        <h2 className="display resume-title">{forModule}</h2>
        <p className="small resume-meta num">
          {region ? `${regionName} · ` : ''}
          {t('atlas.mastered', { n: pct(mastered, total) })}
        </p>
        <Meter value={mastered} max={Math.max(total, 1)} tone="tint" />
        <button className="go resume-go" onClick={() => startPractice(moduleId, region, mode)}>
          {resumed ? t('today.resumeGo') : t('practice.start')}
          <ChevronIcon />
        </button>
      </section>

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
          <button key={p.id} className="r sys" style={tintVars(p.systemId)} onClick={() => openPlate(p.id)}>
            <span className="swatch" aria-hidden />
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
