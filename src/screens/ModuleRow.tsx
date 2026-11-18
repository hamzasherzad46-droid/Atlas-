import type { ModuleInfo } from '../content/types'
import { moduleTitle } from '../content/names'
import { useModule } from '../content/useModule'
import { ChevronIcon } from '../components/Icons'
import { useT } from '../i18n'
import { pct } from '../lib/format'
import { useNav } from '../state/nav'
import { useProgress } from '../state/progress'
import { regionStats } from '../state/stats'

/** One module in a list: its colour key, name, a line of context and how much of it is learned. Modules that aren't ready are not listed. */
export function ModuleRow({ info, sub }: { info: ModuleInfo; sub: string }) {
  const t = useT()
  const openModule = useNav((s) => s.openModule)
  const available = info.status === 'available'
  const { assets } = useModule(available ? info.id : null)
  // Hooks above run for every row; anything not ready simply isn't shown (no "coming soon").
  const records = useProgress((s) => s.records)
  const stats = assets ? regionStats(assets.content, records) : []
  const total = stats.reduce((n, r) => n + r.total, 0)
  const mastered = stats.reduce((n, r) => n + r.mastered, 0)

  if (!available) return null
  return (
    <button className="r" onClick={() => openModule(info.id)}>
      <span className="r-main">
        <span className="r-title">{moduleTitle(t, info.id)}</span>
        <span className="r-sub">{sub}</span>
      </span>
      <span className="r-value">{t.percent(pct(mastered, total))}</span>
      <ChevronIcon />
    </button>
  )
}
