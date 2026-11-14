import { useEffect, useState } from 'react'
import { getModuleInfo, loadCurriculum } from '../content/loader'
import type { Curriculum as CurriculumData } from '../content/types'
import { ArrowIcon } from '../components/Icons'
import { useT } from '../i18n'
import { tintVars } from '../lib/tint'
import { useNav } from '../state/nav'

/**
 * Every topic in the curriculum, by category. Categories open one at a time; a topic that an
 * available module teaches links to it, everything else is marked as in preparation.
 */
export function Curriculum({ open, onOpen }: { open: string | null; onOpen(id: string | null): void }) {
  const t = useT()
  const openModule = useNav((s) => s.openModule)
  const [data, setData] = useState<CurriculumData | null>(null)

  useEffect(() => {
    let alive = true
    void loadCurriculum().then((c) => alive && setData(c))
    return () => {
      alive = false
    }
  }, [])

  if (!data) return <p className="empty">{t('common.loading')}</p>
  const total = data.categories.reduce((n, c) => n + c.topics.length, 0)
  const ready = data.categories.reduce((n, c) => n + c.topics.filter((x) => x.modules?.length).length, 0)

  return (
    <div className="curriculum">
      <p className="mono curriculum-count">{t('curriculum.count', { a: ready, b: total })}</p>
      <div className="rows">
        {data.categories.map((c) => {
          const isOpen = open === c.id
          const available = c.topics.filter((x) => x.modules?.length).length
          return (
            <div key={c.id} className="curriculum-cat">
              <button className="r" aria-expanded={isOpen} onClick={() => onOpen(isOpen ? null : c.id)}>
                <span className="r-main">
                  <span className="r-title" lang="en">
                    {c.title}
                  </span>
                </span>
                <span className="r-value">
                  {available ? `${available}/` : ''}
                  {c.topics.length}
                </span>
                <span className="mono fold" aria-hidden>
                  {isOpen ? '−' : '+'}
                </span>
              </button>
              {isOpen && (
                <ul className="topics" lang="en">
                  {c.topics.map((topic) =>
                    topic.modules?.length ? (
                      <li key={topic.title}>
                        <span className="topic-title">{topic.title}</span>
                        <span className="topic-links">
                          {topic.modules.map((id) => (
                            <button key={id} className="topic-link sys" style={tintVars(getModuleInfo(id)?.systemId)} onClick={() => openModule(id)}>
                              <span className="swatch" aria-hidden />
                              {t.td(`module.${id}`, id)}
                              <ArrowIcon size={12} />
                            </button>
                          ))}
                        </span>
                      </li>
                    ) : (
                      <li key={topic.title} className="in-prep">
                        <span className="topic-title">{topic.title}</span>
                        <span className="mono">{t('common.soon')}</span>
                      </li>
                    ),
                  )}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
