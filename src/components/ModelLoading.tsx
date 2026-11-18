import { useT } from '../i18n'
import { useModelLoads } from '../state/modelLoads'

/**
 * Stands in for a 3D model while it downloads: a line of text and a hairline brass meter that
 * fills with the real download, not a spinner. With `always`, it also shows while the 3D viewer
 * itself is being fetched, before any model has started.
 */
export function ModelLoading({ always = false }: { always?: boolean }) {
  const t = useT()
  const progress = useModelLoads((s) => s.shown)
  if (progress === undefined && !always) return null
  const pct = progress ? Math.round(progress * 100) : 0
  return (
    <div className="model-loading" role="status" aria-live="polite">
      <p className="small">
        {t('viewer.loading')}
        {progress != null && <span className="num"> · {t.percent(pct)}</span>}
      </p>
      <div className="meter" aria-hidden>
        <span style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
