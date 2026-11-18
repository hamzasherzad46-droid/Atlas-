import { useEffect, useState } from 'react'
import { moduleTitle } from '../content/names'
import { getModuleInfo, loadCurriculum } from '../content/loader'
import type { Curriculum } from '../content/types'
import { ChevronIcon, BackIcon } from '../components/Icons'
import { useT } from '../i18n'
import { tintVars } from '../lib/tint'
import { goBack, useNav } from '../state/nav'

/** Categories whose topics are parts of the body, so the 3D body is a useful companion. */
const BODY_CATEGORIES = new Set(['sub-regional', 'regional', 'systemic'])

/** A curriculum topic: what it is, its key points, where to study it in 3D, and the next topic. */
export function TopicScreen({ cat, index }: { cat: string; index: number }) {
  const t = useT()
  const { openTopic, openModule, openBody } = useNav()
  const [data, setData] = useState<Curriculum | null>(null)

  useEffect(() => {
    let alive = true
    void loadCurriculum().then((c) => alive && setData(c))
    return () => {
      alive = false
    }
  }, [])

  const category = data?.categories.find((c) => c.id === cat)
  const topic = category?.topics[index]
  if (!category || !topic) return <main className="page">{data && <p className="empty">{t('common.loading')}</p>}</main>
  const prev = index > 0 ? category.topics[index - 1] : null
  const next = index < category.topics.length - 1 ? category.topics[index + 1] : null

  return (
    <main className="page topic-page">
      <button className="backlink" onClick={() => goBack()}>
        <BackIcon /> {t('common.back')}
      </button>

      <div className="titleblock topic-titleblock" lang="en" dir="ltr">
        <p className="label">{category.title}</p>
        <h1 className="title topic-heading">{topic.title}</h1>
        <p className="lede topic-summary">{topic.summary}</p>
      </div>

      <section className="sect">
        <p className="label">{t('topic.points')}</p>
        <ol className="sect-body topic-points" lang="en" dir="ltr">
          {topic.points.map((p, i) => (
            <li key={i}>
              <span className="figs topic-no">{i + 1}</span>
              <p>{p}</p>
            </li>
          ))}
        </ol>
      </section>

      {(topic.modules?.length || BODY_CATEGORIES.has(cat)) && (
        <section className="sect">
          <p className="label">{t('topic.study')}</p>
          <div className="sect-body rows">
            {topic.modules?.map((id) => (
              <button key={id} className="r sys" style={tintVars(getModuleInfo(id)?.systemId)} onClick={() => openModule(id)}>
                <span className="swatch" aria-hidden />
                <span className="r-main r-title">{moduleTitle(t, id)}</span>
                <ChevronIcon />
              </button>
            ))}
            {BODY_CATEGORIES.has(cat) && (
              <button className="r" onClick={() => openBody()}>
                <span className="r-main r-title">{t('body.title')}</span>
                <ChevronIcon />
              </button>
            )}
          </div>
        </section>
      )}

      <nav className="topic-nav" aria-label={category.title}>
        {prev ? (
          <button className="topic-step" onClick={() => openTopic({ cat, index: index - 1 })}>
            <span className="label">{t('topic.prev')}</span>
            <span className="topic-step-title" lang="en" dir="auto">
              {prev.title}
            </span>
          </button>
        ) : (
          <span />
        )}
        {next && (
          <button className="topic-step next" onClick={() => openTopic({ cat, index: index + 1 })}>
            <span className="label">{t('topic.next')}</span>
            <span className="topic-step-title" lang="en" dir="auto">
              {next.title}
            </span>
          </button>
        )}
      </nav>
    </main>
  )
}
