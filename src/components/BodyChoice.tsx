import type { Body } from '../content/types'
import { useT } from '../i18n'

const BODIES: Body[] = ['male', 'female']

/**
 * Male or female: which body the 3D models show where both exist (the whole body and the
 * reproductive system). Progress is kept either way.
 */
export function BodyChoice({ value, onChange, className = '' }: { value: Body; onChange(body: Body): void; className?: string }) {
  const t = useT()
  return (
    <div className={`options ${className}`} role="group" aria-label={t('bodyOf.label')}>
      {BODIES.map((b) => (
        <button key={b} aria-pressed={value === b} onClick={() => onChange(b)}>
          {t(`bodyOf.${b}`)}
        </button>
      ))}
    </div>
  )
}
