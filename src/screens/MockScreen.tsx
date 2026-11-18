import { useCallback, useEffect, useRef, useState } from 'react'
import { getCourse, loadMock } from '../content/loader'
import { courseTitle } from '../content/names'
import type { MockBank, MockLevel } from '../content/types'
import { ChevronIcon, CheckIcon } from '../components/Icons'
import { useT } from '../i18n'
import { formatClock, pct } from '../lib/format'
import { buildMock, mockLengths, mockPool, topicScores, type MockItem } from '../lib/mock'
import { buzz } from '../lib/haptics'
import { playSound } from '../lib/sound'
import { goBack, useNav } from '../state/nav'
import { useProgress } from '../state/progress'
import { useSettings } from '../state/settings'
import '../quiz/quiz.css'
import { ScreenBar } from '../components/ScreenBar'

const LETTERS = ['A', 'B', 'C', 'D']

/** Wall-clock time; only ever read in event handlers (starting and finishing a mock). */
const clock = () => Date.now()

type MockScope = 'topic' | 'course' | 'all'

/**
 * A mock exam of 15, 30 or 45 multiple-choice questions (or all of a smaller pool) at Foundation
 * or Higher level, drawn from the course's topics, every topic, or one topic opened from search.
 * Each answer is marked at once and explained; the results show the score by topic and
 * every question to look at again.
 */
export function MockScreen() {
  const t = useT()
  const [bank, setBank] = useState<MockBank | null>(null)
  // Opened from search on one topic, the mock starts limited to that topic.
  const topic = useNav((s) => s.mock?.topic ?? null)
  // Starting is a step in the history, so Back (or the phone's back gesture) from the questions returns here.
  const running = useNav((s) => !!s.mock?.running)
  const [level, setLevel] = useState<MockLevel>('foundation')
  const [length, setLength] = useState<number>(15)
  // By default a mock draws on the student's course topics; "All topics" uses the whole bank.
  const [scope, setScope] = useState<MockScope>(topic ? 'topic' : 'course')
  const course = getCourse(useSettings((s) => s.track))
  const topics = scope === 'topic' && topic ? [topic] : scope === 'course' ? course.mockTopics : null
  const [items, setItems] = useState<MockItem[] | null>(null)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [index, setIndex] = useState(0)
  const [startedAt, setStartedAt] = useState(0)
  const [finishedAt, setFinishedAt] = useState(0)

  useEffect(() => {
    let alive = true
    void loadMock().then((b) => {
      if (!alive) return
      setBank(b)
      // A topic asked in only one level starts on that level.
      if (topic && !b.sets.find((x) => x.id === 'foundation')?.questions.some((q) => q.topic === topic)) setLevel('higher')
    })
    return () => {
      alive = false
    }
  }, [topic])

  const start = () => {
    const set = bank?.sets.find((s) => s.id === level)
    if (!set) return
    const pool = mockPool(set.questions, topics)
    const list = buildMock(pool, Math.min(length, pool.length))
    setItems(list)
    setAnswers(list.map(() => null))
    setIndex(0)
    setStartedAt(clock())
    setFinishedAt(0)
    useNav.getState().go({ mock: { topic, running: true } })
  }

  const finish = useCallback(() => {
    if (!items) return
    const end = Date.now()
    setFinishedAt(end)
    const correct = items.filter((it, i) => answers[i] === it.correct).length
    useProgress.getState().addAssessment({
      at: end,
      moduleId: `mock-${level}`,
      total: items.length,
      correct,
      durationMs: end - startedAt,
      missed: items.filter((it, i) => answers[i] !== it.correct).map((it) => it.id),
    })
    playSound('mockFinish')
  }, [items, answers, level, startedAt])

  if (!items || !running) {
    const available = mockPool(bank?.sets.find((s) => s.id === level)?.questions ?? [], topics).length
    return (
      <MockSetup
        bank={bank}
        level={level}
        setLevel={setLevel}
        length={length}
        setLength={setLength}
        scope={scope}
        setScope={setScope}
        topic={topic}
        courseName={courseTitle(t, course)}
        available={available}
        onStart={start}
        onClose={() => goBack()}
      />
    )
  }
  // "Another mock exam" returns to the setup; Close leaves the mock exam.
  if (finishedAt) return <MockResults items={items} answers={answers} level={level} ms={finishedAt - startedAt} onAgain={() => goBack()} onClose={() => goBack(2)} />

  const choose = (k: number) => {
    if (answers[index] !== null) return
    setAnswers((a) => a.map((v, i) => (i === index ? k : v)))
    playSound(k === items[index].correct ? 'complete' : 'wrong')
    buzz(k === items[index].correct ? 'right' : 'wrong')
  }
  const next = () => (index + 1 < items.length ? setIndex(index + 1) : finish())

  return (
    <MockQuestion
      key={index}
      item={items[index]}
      index={index}
      total={items.length}
      answer={answers[index]}
      onChoose={choose}
      onNext={next}
      onClose={() => {
        if (window.confirm(t('mock.leave'))) goBack()
      }}
      t={t}
    />
  )
}

function MockSetup(props: {
  bank: MockBank | null
  level: MockLevel
  setLevel(l: MockLevel): void
  length: number
  setLength(n: number): void
  scope: MockScope
  setScope(s: MockScope): void
  topic: string | null
  courseName: string
  available: number
  onStart(): void
  onClose(): void
}) {
  const t = useT()
  const assessments = useProgress((s) => s.assessments)
  const { level, length } = props
  const lengths = mockLengths(props.available)
  const shown = Math.min(length, props.available)
  const last = assessments.find((a) => a.moduleId === `mock-${level}`)

  return (
    <div className="overlay mock">
      <main className="page">
        <ScreenBar onBack={props.onClose} />
        <div className="titleblock">
          <h1 className="display">{t('mock.title')}</h1>
          <p className="lede">{t('mock.lede')}</p>
        </div>

        <section className="sect">
          <p className="label">{t('mock.level')}</p>
          <div className="sect-body">
            <div className="options">
              {(['foundation', 'higher'] as const).map((l) => (
                <button key={l} aria-pressed={level === l} onClick={() => props.setLevel(l)}>
                  {t(`mock.${l}`)}
                </button>
              ))}
            </div>
            <p className="small option-help">{t(level === 'foundation' ? 'mock.foundationHelp' : 'mock.higherHelp')}</p>
            {last && (
              <p className="tiny num mock-last">
                {t('mock.last', { a: last.correct, b: last.total })} · {t.percent(pct(last.correct, last.total))}
              </p>
            )}
          </div>
        </section>

        <section className="sect">
          <p className="label">{t('mock.from')}</p>
          <div className="sect-body">
            <div className="options">
              {props.topic && (
                <button aria-pressed={props.scope === 'topic'} onClick={() => props.setScope('topic')}>
                  {t('mock.oneTopic')}: <span lang="en">{props.topic}</span>
                </button>
              )}
              <button aria-pressed={props.scope === 'course'} onClick={() => props.setScope('course')}>
                {t('mock.courseTopics')}: {props.courseName}
              </button>
              <button aria-pressed={props.scope === 'all'} onClick={() => props.setScope('all')}>
                {t('mock.allTopics')}
              </button>
            </div>
            <p className="small option-help num">{t('mock.available', { n: props.available })}</p>
          </div>
        </section>

        <section className="sect">
          <p className="label">{t('mock.length')}</p>
          <div className="sect-body">
            <div className="options">
              {lengths.map((n) => (
                <button key={n} className="num" aria-pressed={shown === n} onClick={() => props.setLength(n)}>
                  {n}
                </button>
              ))}
            </div>
            <p className="small option-help">{t('mock.minutes', { n: shown })}</p>
          </div>
        </section>

        <div className="start-block">
          <button className="go" disabled={!props.bank} onClick={props.onStart}>
            {t('mock.start')}
            <ChevronIcon />
          </button>
        </div>
      </main>
    </div>
  )
}

function MockQuestion(props: {
  item: MockItem
  index: number
  total: number
  answer: number | null
  onChoose(k: number): void
  onNext(): void
  onClose(): void
  t: ReturnType<typeof useT>
}) {
  const { item, index, total, answer, t } = props
  const done = answer !== null
  const nextRef = useRef<HTMLButtonElement>(null)

  // Keys: 1–4 or A–D to answer, Enter for the next question.
  const { onChoose, onNext } = props
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const k = '1234'.indexOf(e.key) >= 0 ? '1234'.indexOf(e.key) : 'abcd'.indexOf(e.key.toLowerCase())
      if (!done && k >= 0 && e.key.length === 1) onChoose(k)
      else if (done && e.key === 'Enter') onNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [done, onChoose, onNext])

  useEffect(() => {
    if (done) nextRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [done])

  return (
    <div className="quiz mock-quiz">
      <ScreenBar
        close
        label={t('mock.end')}
        onBack={props.onClose}
        title={
          <bdi dir="ltr">
            {t.n(index + 1)} / {t.n(total)}
          </bdi>
        }
      />
      <div className="quiz-progress">
        <span style={{ width: `${((index + (done ? 1 : 0)) / total) * 100}%` }} />
      </div>

      <div className="mock-body">
        <p className="label mock-topic" lang="en" dir="ltr">
          {item.topic}
        </p>
        <h2 className="mock-q" lang="en" dir="ltr">
          {item.q}
        </h2>

        <ol className="mock-options" lang="en" dir="ltr">
          {item.options.map((o, k) => {
            const state = !done ? '' : k === item.correct ? 'right' : k === answer ? 'wrong' : 'dim'
            return (
              <li key={k}>
                <button className={`mock-option ${state}`} disabled={done} onClick={() => props.onChoose(k)}>
                  <span className="figs mock-letter">{LETTERS[k]}</span>
                  <span className="mock-text">{o}</span>
                  {done && k === item.correct && <CheckIcon />}
                </button>
              </li>
            )
          })}
        </ol>

        {done && (
          <div className="mock-feedback">
            <p className={`verdict ${answer === item.correct ? 'good' : 'bad'}`}>
              {answer === item.correct ? t('mock.right') : t('mock.notQuite')}
            </p>
            <div className="note mock-why">
              <p className="label">{t('mock.why')}</p>
              <p lang="en" dir="ltr">
                {item.explain}
              </p>
            </div>
            <button ref={nextRef} className="go mock-next" onClick={props.onNext}>
              {index + 1 < total ? t('mock.next') : t('mock.finish')}
              <ChevronIcon />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function MockResults(props: { items: MockItem[]; answers: (number | null)[]; level: MockLevel; ms: number; onAgain(): void; onClose(): void }) {
  const t = useT()
  const { items, answers } = props
  const correct = items.filter((it, i) => answers[i] === it.correct).length
  const topics = topicScores(items, answers)
  const missed = items.map((it, i) => ({ it, a: answers[i] })).filter(({ it, a }) => a !== it.correct)

  return (
    <div className="overlay mock">
      <main className="page summary-inner">
        <ScreenBar close onBack={props.onClose} title={t('mock.title')} />
        <div className="titleblock">
          <p className="label">{t('mock.resultLabel', { level: t(`mock.${props.level}`) })}</p>
          <p className="summary-score num" aria-hidden>
            {t.n(correct)}
            <span className="of">/{t.n(items.length)}</span>
          </p>
          <p className="lede">
            {t('mock.result', { a: correct, b: items.length })}
            {missed.length > 0 && ` ${t('mock.toReview', { n: missed.length })}`}
          </p>
          <p className="small summary-line num">
            {t('mock.score')} {t.percent(pct(correct, items.length))}<span aria-hidden> · </span>
            {t('summary.time')} {formatClock(props.ms)}
          </p>
        </div>

        <section className="sect">
          <p className="label">{t('mock.byTopic')}</p>
          <div className="sect-body rows">
            {topics.map((s) => {
              const p = pct(s.right, s.total)
              return (
                <div key={s.topic} className="r">
                  <span className="r-main r-title" lang="en" dir="auto">
                    {s.topic}
                  </span>
                  <span className={`r-value${p < 50 ? ' bad' : p < 75 ? ' warn' : ' good'}`}>
                    {t.n(s.right)}/{t.n(s.total)}
                  </span>
                </div>
              )
            })}
          </div>
        </section>

        {missed.length > 0 && (
          <section className="sect">
            <p className="label">{t('mock.review')}</p>
            <ol className="sect-body mock-review">
              {missed.map(({ it, a }) => (
                <li key={it.id}>
                  <p className="mock-review-q" lang="en" dir="ltr">
                    {it.q}
                  </p>
                  {a !== null && (
                    <p className="small bad">
                      {t('mock.yourAnswer')}:{' '}
                      <span lang="en" dir="ltr">
                        {it.options[a]}
                      </span>
                    </p>
                  )}
                  <p className="small good">
                    {t('mock.answer')}:{' '}
                    <span lang="en" dir="ltr">
                      {it.options[it.correct]}
                    </span>
                  </p>
                  <p className="small mock-review-why" lang="en" dir="ltr">
                    {it.explain}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        )}

        <div className="summary-actions">
          <button className="go" onClick={props.onClose}>
            {t('common.done')}
          </button>
          <button className="go quiet" onClick={props.onAgain}>
            {t('mock.again')}
            <ChevronIcon />
          </button>
        </div>
      </main>
    </div>
  )
}
