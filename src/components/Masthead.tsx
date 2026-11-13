import { useT } from '../i18n'
import { useNav } from '../state/nav'
import { useSettings } from '../state/settings'

/** Running head on every tab: the wordmark, and the student's track (tap to change it). */
export function Masthead() {
  const t = useT()
  const track = useSettings((s) => s.track)
  const setTab = useNav((s) => s.setTab)
  return (
    <header className="masthead">
      <span className="wordmark">{t('app.name')}</span>
      <button className="label masthead-track" onClick={() => setTab('you')}>
        {t(`track.${track}`)}
      </button>
    </header>
  )
}
