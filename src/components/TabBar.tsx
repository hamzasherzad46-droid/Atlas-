import type { ComponentType } from 'react'
import { useT } from '../i18n'
import { useNav, type Tab } from '../state/nav'
import { AtlasIcon, PracticeIcon, ProgressIcon, TodayIcon, YouIcon } from './Icons'

const TABS: { id: Tab; Icon: ComponentType<{ active?: boolean }> }[] = [
  { id: 'today', Icon: TodayIcon },
  { id: 'atlas', Icon: AtlasIcon },
  { id: 'practice', Icon: PracticeIcon },
  { id: 'progress', Icon: ProgressIcon },
  { id: 'you', Icon: YouIcon },
]

export function TabBar() {
  const t = useT()
  const { tab, setTab } = useNav()
  return (
    <nav className="tabbar" aria-label="Sections">
      {TABS.map(({ id, Icon }) => (
        <button key={id} className="tab" aria-current={tab === id ? 'page' : undefined} onClick={() => setTab(id)}>
          <Icon active={tab === id} />
          <span>{t(`tab.${id}`)}</span>
        </button>
      ))}
    </nav>
  )
}
