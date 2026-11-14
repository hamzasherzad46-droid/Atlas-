import { useT } from '../i18n'
import { useNav } from '../state/nav'
import { useSettings } from '../state/settings'
import { Seal } from './Celestial'

/** Running head on every tab: the seal and wordmark, and the student's track (tap to change it). */
export function Masthead() {
  const t = useT()
  const track = useSettings((s) => s.track)
  const setTab = useNav((s) => s.setTab)
  return (
    <header className="masthead">
      <span className="brand">
        <Seal />
        <span className="wordmark">{t('app.name')}</span>
      </span>
      <button className="mono masthead-track" onClick={() => setTab('you')}>
        {t(`track.${track}`)}
      </button>
    </header>
  )
}
