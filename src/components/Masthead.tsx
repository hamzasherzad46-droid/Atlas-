import { getCourse } from '../content/loader'
import { courseTitle } from '../content/names'
import { useT } from '../i18n'
import { useNav } from '../state/nav'
import { useSettings } from '../state/settings'
import { Seal } from './Celestial'

/** Running head on every tab: the seal and wordmark, and the student's course (tap to change it). */
export function Masthead() {
  const t = useT()
  const course = getCourse(useSettings((s) => s.track))
  const openCourses = useNav((s) => s.openCourses)
  return (
    <header className="masthead">
      <span className="brand">
        <Seal />
        <span className="wordmark">{t('app.name')}</span>
      </span>
      <button className="mono masthead-track" aria-label={`${t('course.change')}: ${courseTitle(t, course)}`} onClick={() => openCourses(true)}>
        {courseTitle(t, course)}
      </button>
    </header>
  )
}
