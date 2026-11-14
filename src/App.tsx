import { useEffect } from 'react'
import { TabBar } from './components/TabBar'
import { Toasts } from './components/bits'
import { applyLang, useT } from './i18n'
import { QuizScreen } from './quiz/QuizScreen'
import { AtlasScreen } from './screens/AtlasScreen'
import { CreditsScreen } from './screens/CreditsScreen'
import { ExploreScreen } from './screens/ExploreScreen'
import { FlashcardScreen } from './screens/FlashcardScreen'
import { OnboardingScreen } from './screens/OnboardingScreen'
import { ProgressScreen } from './screens/ProgressScreen'
import { TodayScreen } from './screens/TodayScreen'
import { YouScreen } from './screens/YouScreen'
import { useAssignments } from './state/dashboard'
import { useNav } from './state/nav'
import { useProgress } from './state/progress'
import { applyTheme, useSettings } from './state/settings'
import { useToasts } from './state/toast'
import './app.css'

const SCREENS = {
  today: TodayScreen,
  atlas: AtlasScreen,
  progress: ProgressScreen,
  you: YouScreen,
}

/** Marks finished study-plan items once and posts a quiet notice. */
function StudyPlanWatcher() {
  const t = useT()
  const assignments = useAssignments()
  const claimed = useProgress((s) => s.claimed)
  const push = useToasts((s) => s.push)

  useEffect(() => {
    for (const a of assignments) {
      if (a.done && !claimed[a.key]) {
        // The XP ledger is kept in storage for compatibility but no longer shown anywhere.
        useProgress.getState().claim(a.key, a.xp)
        push({ kind: 'assignment', title: t('toast.assignment'), detail: t(`assignment.${a.id}` as Parameters<typeof t>[0], { n: a.target }) })
      }
    }
  }, [assignments, claimed, push, t])

  return null
}

export default function App() {
  const theme = useSettings((s) => s.theme)
  const lang = useSettings((s) => s.lang)
  const onboarded = useSettings((s) => s.onboarded)
  const { tab, session, cards, explore, credits } = useNav()

  useEffect(() => applyTheme(theme), [theme])
  useEffect(() => applyLang(lang), [lang])

  const Screen = SCREENS[tab]
  const overlay = session || cards || explore
  return (
    <>
      <div className="app" hidden={!!overlay}>
        <Screen key={tab} />
        <TabBar />
      </div>
      {credits && !overlay && <CreditsScreen />}
      {explore && !session && !cards && <ExploreScreen moduleId={explore} />}
      {session && <QuizScreen config={session} />}
      {cards && <FlashcardScreen config={cards} />}
      {!onboarded && <OnboardingScreen />}
      <StudyPlanWatcher />
      <Toasts />
    </>
  )
}
