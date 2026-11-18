import { useT } from '../i18n'
import { useModelLoads } from '../state/modelLoads'

/**
 * Stands in for a 3D model while it downloads: a line of text and a hairline brass meter that
 * fills with the real download, not a spinner. `always` shows it while the 3D viewer itself is being
 * fetched, before any model has started; `settling` keeps it (meter full) after the download, while
 * the model is being prepared for the screen.
 */
export function ModelLoading({ always = false, settling = false }: { always?: boolean; settling?: boolean }) {
  const t = useT()
  const progress = useModelLoads((s) => s.shown)
  if (progress === undefined && !always && !settling) return null
  const known = typeof progress === 'number'
  const pct = known ? Math.round(progress * 100) : settling && progress === undefined ? 100 : 0
  return (
    <div className="model-loading" role="status" aria-live="polite">
      <p className="small">
        {t('viewer.loading')}
        {known && <span className="num"> · {t.percent(pct)}</span>}
      </p>
      <div className="meter" aria-hidden>
        <span style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
