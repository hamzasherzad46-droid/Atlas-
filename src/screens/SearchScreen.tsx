import { useEffect, useMemo, useState } from 'react'
import { allModules, getModuleInfo, loadCurriculum, loadMock, loadModuleContent, loadPlates, systemModules } from '../content/loader'
import { moduleTitle } from '../content/names'
import { buildSearchEntries, type SearchTarget } from '../content/searchIndex'
import { EmptyState } from '../components/EmptyState'
import { ChevronIcon } from '../components/Icons'
import { ScreenBar } from '../components/ScreenBar'
import { translateDynamic, useT } from '../i18n'
import { sentence } from '../lib/format'
import { buildIndex, search, type SearchHit, type SearchIndex, type SearchKind } from '../lib/search'
import { goBack, useNav } from '../state/nav'
import { useSearchQuery } from '../state/searchQuery'
import { SkeletonRows } from '../components/SkeletonRows'


const GROUPS: SearchKind[] = ['structure', 'module', 'topic', 'plate', 'mock']

/** One search over structures (name, other names, Latin), modules, topics, plates and mock-exam topics. */
export function SearchScreen() {
  const t = useT()
  const { q, set } = useSearchQuery()
  const [index, setIndex] = useState<SearchIndex<SearchTarget> | null>(null)
  const nav = useNav()

  useEffect(() => {
    let alive = true
    const systems = systemModules.filter((m) => m.status === 'available' && m.contentFile)
    void Promise.all([Promise.all(systems.map((info) => loadModuleContent(info).then((content) => ({ info, content })))), loadCurriculum(), loadPlates(), loadMock()]).then(
      ([systemData, curriculum, plates, mock]) => {
        if (!alive) return
        const entries = buildSearchEntries(
          { systems: systemData, modules: allModules, curriculum, plates, mock },
          {
            module: (id) => moduleTitle(t, id),
            english: (id) => translateDynamic('en', `module.${id}`, getModuleInfo(id)?.title ?? id),
            mock: (n) => t('search.mockSub', { n }),
          },
        )
        setIndex(buildIndex(entries))
      },
    )
    return () => {
      alive = false
    }
  }, [t])

  const hits = useMemo(() => (index ? search(index, q) : []), [index, q])
  const groups = GROUPS.map((kind) => ({ kind, hits: hits.filter((h) => h.entry.kind === kind) }))
    .filter((g) => g.hits.length)
    .sort((a, b) => b.hits[0].score - a.hits[0].score || GROUPS.indexOf(a.kind) - GROUPS.indexOf(b.kind))

  const open = (target: SearchTarget) => {
    if (target.kind === 'structure') nav.openExplore(target.moduleId, target.structureId)
    else if (target.kind === 'module') nav.openModule(target.moduleId)
    else if (target.kind === 'topic') nav.openTopic({ cat: target.cat, index: target.index })
    else if (target.kind === 'plate') nav.openPlate(target.plateId)
    else nav.openMock(target.topic)
  }

  return (
    <div className="overlay search" role="dialog" aria-label={t('search.title')}>
      <main className="page">
        <ScreenBar title={t('search.title')} />
        <div className="search-box">
          <label className="label" htmlFor="search-q">
            {t('search.label')}
          </label>
          <input
            id="search-q"
            className="field search-field"
            type="search"
            value={q}
            autoFocus
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="search"
            placeholder={t('search.placeholder')}
            onChange={(e) => set(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') goBack()
              if (e.key === 'Enter' && hits[0]) open(hits[0].entry.target)
            }}
          />
        </div>

        <div aria-live="polite">
          {!q.trim() ? (
            <p className="small search-hint">{t('search.hint')}</p>
          ) : !index ? (
            <SkeletonRows rows={3} label={t('common.loading')} />
          ) : !hits.length ? (
            <EmptyState>{t('search.none', { q: q.trim() })}</EmptyState>
          ) : (
            <p className="tiny num search-count">{t('search.count', { n: hits.length })}</p>
          )}
        </div>

        {groups.map((g) => (
          <section className="sect" key={g.kind}>
            <p className="label">{t(`search.kind.${g.kind}`)}</p>
            <div className="sect-body rows">
              {g.hits.map((h) => (
                <Result key={h.entry.key} hit={h} onOpen={() => open(h.entry.target)} />
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  )
}

function Result({ hit, onOpen }: { hit: SearchHit<SearchTarget>; onOpen(): void }) {
  const { entry, via } = hit
  // Structure names are stored in lower case ("femur"); everything else is already titled.
  const title = entry.kind === 'structure' ? sentence(entry.title) : entry.title
  const english = entry.kind !== 'module'
  return (
    <button className="r" onClick={onOpen}>
      <span className="r-main">
        <span className="r-title" lang={english ? 'en' : undefined} dir="auto">
          {title}
        </span>
        <span className="r-sub" dir="auto">
          {entry.sub}
          {via && (
            <>
              {entry.sub && ' · '}
              <span lang="en">“{via}”</span>
            </>
          )}
        </span>
      </span>
      <ChevronIcon />
    </button>
  )
}
