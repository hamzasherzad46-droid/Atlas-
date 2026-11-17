import { useT } from '../i18n'

/** Shown on onboarding, Settings and Credits: Atlas teaches anatomy; it is not clinical guidance. */
export function StudyAidNotice() {
  const t = useT()
  return (
    <p className="small study-aid" role="note">
      {t('common.studyAid')}
    </p>
  )
}
