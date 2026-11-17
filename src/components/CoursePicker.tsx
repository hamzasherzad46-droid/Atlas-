import { courses } from '../content/loader'
import { courseDescription, courseTitle } from '../content/names'
import { useT } from '../i18n'

/** One large button per course, title and description, for onboarding, Settings and "Change course". */
export function CoursePicker({ value, onPick }: { value: string; onPick(id: string): void }) {
  const t = useT()
  return (
    <div className="course-picker" role="radiogroup" aria-label={t('onb.track')}>
      {courses.courses.map((c) => (
        <button key={c.id} className="course-choice" role="radio" aria-checked={value === c.id} onClick={() => onPick(c.id)}>
          <span className="course-choice-title">{courseTitle(t, c)}</span>
          <span className="course-choice-sub">{courseDescription(t, c)}</span>
        </button>
      ))}
    </div>
  )
}
