import { useT } from '../i18n'
import { useNav, type Tab } from '../state/nav'

const TABS: Tab[] = ['today', 'atlas', 'practice', 'progress', 'you']

/** Understated text navigation: the current section is set in ink with a burgundy rule above it. */
export function TabBar() {
  const t = useT()
  const { tab, setTab } = useNav()
  return (
    <nav className="tabbar" aria-label="Sections">
      {TABS.map((id) => (
        <button key={id} className="tab" aria-current={tab === id ? 'page' : undefined} onClick={() => setTab(id)}>
          {t(`tab.${id}`)}
        </button>
      ))}
    </nav>
  )
}
