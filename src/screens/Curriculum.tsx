import { useEffect, useState } from 'react'
import { loadCurriculum } from '../content/loader'
import type { Curriculum as CurriculumData } from '../content/types'
import { ChevronIcon, DisclosureIcon } from '../components/Icons'
import { useT } from '../i18n'
import { useNav } from '../state/nav'
import { SkeletonRows } from '../components/SkeletonRows'

/**
 * Every topic in the curriculum, by category. Categories open one at a time; each topic opens its
 * study page, and topics taught by an available 3D module are marked.
 */
export function Curriculum({ open, onOpen, only }: { open: string | null; onOpen(id: string | null): void; only?: string[] }) {
  const t = useT()
  const openTopic = useNav((s) => s.openTopic)
  const [data, setData] = useState<CurriculumData | null>(null)

  useEffect(() => {
    let alive = true
    void loadCurriculum().then((c) => alive && setData(c))
    return () => {
      alive = false
    }
  }, [])

  if (!data) return <SkeletonRows rows={6} label={t('common.loading')} />
  // A course shows its own categories, in its order; otherwise every category.
  const categories = only ? only.flatMap((id) => data.categories.filter((c) => c.id === id)) : data.categories
  const total = data.categories.reduce((n, c) => n + c.topics.length, 0)
  const ready = data.categories.reduce((n, c) => n + c.topics.filter((x) => x.modules?.length).length, 0)

  return (
    <div className="curriculum">
      {!only && <p className="small num curriculum-count">{t('curriculum.count', { a: ready, b: total })}</p>}
      <div className="rows">
        {categories.map((c) => {
          const isOpen = open === c.id
          return (
            <div key={c.id} className="curriculum-cat">
              <button className="r" aria-expanded={isOpen} onClick={() => onOpen(isOpen ? null : c.id)}>
                <span className="r-main">
                  <span className="r-title" lang="en">
                    {c.title}
                  </span>
                </span>
                <span className="r-value">
                  {t.n(c.topics.length)}
                </span>
                <DisclosureIcon open={isOpen} />
              </button>
              {isOpen && (
                <ul className="topics" lang="en">
                  {c.topics.map((topic, index) => (
                    <li key={topic.title}>
                      <button className="topic-open" dir="ltr" onClick={() => openTopic({ cat: c.id, index })}>
                        <span className="topic-title">{topic.title}</span>
                        {topic.modules?.length ? (
                          <span className="figs topic-3d" aria-label={t('topic.has3d')}>
                            3D
                          </span>
                        ) : null}
                        <ChevronIcon size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
