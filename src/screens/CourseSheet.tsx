import { createPortal } from 'react-dom'
import { CoursePicker } from '../components/CoursePicker'
import { useT } from '../i18n'
import { goBack } from '../state/nav'
import { useSettings } from '../state/settings'
import { ScreenBar } from '../components/ScreenBar'

/** "Change course": pick another course. Only the course setting changes; progress is never touched. */
export function CourseSheet() {
  const t = useT()
  const track = useSettings((s) => s.track)
  const set = useSettings((s) => s.set)
  return createPortal(
    <div className="overlay sheet" role="dialog" aria-label={t('course.change')}>
      <main className="page">
        <ScreenBar />
        <div className="titleblock">
          <h1 className="display">{t('course.change')}</h1>
          <p className="lede">{t('course.kept')}</p>
        </div>
        <CoursePicker
          value={track}
          onPick={(id) => {
            set({ track: id })
            goBack()
          }}
        />
      </main>
    </div>,
    document.body,
  )
}
