import { createPortal } from 'react-dom'
import { BackIcon } from '../components/Icons'
import { CoursePicker } from '../components/CoursePicker'
import { useT } from '../i18n'
import { useNav } from '../state/nav'
import { useSettings } from '../state/settings'

/** "Change course": pick another course. Only the course setting changes; progress is never touched. */
export function CourseSheet() {
  const t = useT()
  const track = useSettings((s) => s.track)
  const set = useSettings((s) => s.set)
  const openCourses = useNav((s) => s.openCourses)
  return createPortal(
    <div className="overlay sheet" role="dialog" aria-label={t('course.change')}>
      <main className="page">
        <button className="backlink" onClick={() => openCourses(false)}>
          <BackIcon /> {t('common.back')}
        </button>
        <div className="titleblock">
          <h1 className="display">{t('course.change')}</h1>
          <p className="lede">{t('course.kept')}</p>
        </div>
        <CoursePicker
          value={track}
          onPick={(id) => {
            set({ track: id })
            openCourses(false)
          }}
        />
      </main>
    </div>,
    document.body,
  )
}
