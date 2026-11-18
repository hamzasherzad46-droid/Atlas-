import { moduleTitle } from '../content/names'
import { useT } from '../i18n'

/** A module that failed to load: what happened, what to do, and Try again. */
export function LoadError({ moduleId, onRetry }: { moduleId: string; onRetry(): void }) {
  const t = useT()
  return (
    <div className="load-error" role="alert">
      <p className="small">{t('quiz.error', { module: moduleTitle(t, moduleId) })}</p>
      <button className="go quiet" onClick={onRetry}>
        {t('common.retry')}
      </button>
    </div>
  )
}
