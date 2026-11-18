import { useT } from '../i18n'
import { useNav, type Tab } from '../state/nav'

const TABS: Tab[] = ['today', 'atlas', 'progress', 'you']

/** Understated text navigation: the current section in white with an accent line above it. */
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
