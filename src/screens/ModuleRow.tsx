import type { ModuleInfo } from '../content/types'
import { moduleTitle } from '../content/names'
import { useModule } from '../content/useModule'
import { ArrowIcon } from '../components/Icons'
import { useT } from '../i18n'
import { pct } from '../lib/format'
import { tintVars } from '../lib/tint'
import { useNav } from '../state/nav'
import { useProgress } from '../state/progress'
import { regionStats } from '../state/stats'

/** One module in a list: its colour key, name, a line of context and how much of it is mastered. */
export function ModuleRow({ info, sub }: { info: ModuleInfo; sub: string }) {
  const t = useT()
  const openModule = useNav((s) => s.openModule)
  const available = info.status === 'available'
  const { assets } = useModule(available ? info.id : null)
  const records = useProgress((s) => s.records)
  const stats = assets ? regionStats(assets.content, records) : []
  const total = stats.reduce((n, r) => n + r.total, 0)
  const mastered = stats.reduce((n, r) => n + r.mastered, 0)

  return (
    <button className="r sys" style={tintVars(info.systemId ?? 'skeletal')} disabled={!available} onClick={() => openModule(info.id)}>
      <span className="swatch" aria-hidden />
      <span className="r-main">
        <span className="r-title">{moduleTitle(t, info.id)}</span>
        <span className="r-sub">{available ? sub : t('common.soon')}</span>
      </span>
      {available && <span className="r-value">{pct(mastered, total)}%</span>}
      {available && <ArrowIcon />}
    </button>
  )
}
