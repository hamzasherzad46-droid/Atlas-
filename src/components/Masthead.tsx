import { getCourse } from '../content/loader'
import { courseTitle } from '../content/names'
import { useT } from '../i18n'
import { useNav } from '../state/nav'
import { useSettings } from '../state/settings'
import { Seal } from './Celestial'
import { SearchIcon } from './Icons'

/** Running head on every tab: the seal and wordmark, the student's course (tap to change it) and search. */
export function Masthead() {
  const t = useT()
  const course = getCourse(useSettings((s) => s.track))
  const openCourses = useNav((s) => s.openCourses)
  const openSearch = useNav((s) => s.openSearch)
  return (
    <header className="masthead">
      <span className="brand">
        <Seal />
        <span className="wordmark">{t('app.name')}</span>
      </span>
      <span className="masthead-end">
        <button className="mono masthead-track" aria-label={`${t('course.change')}: ${courseTitle(t, course)}`} onClick={() => openCourses()}>
          {courseTitle(t, course)}
        </button>
        <button className="icon-btn masthead-search" aria-label={t('search.open')} onClick={() => openSearch()}>
          <SearchIcon />
        </button>
      </span>
    </header>
  )
}
