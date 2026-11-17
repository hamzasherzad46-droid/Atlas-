import { useEffect } from 'react'
import { TabBar } from './components/TabBar'
import { Toasts } from './components/bits'
import { applyLang, useT } from './i18n'
import { QuizScreen } from './quiz/QuizScreen'
import { AtlasScreen } from './screens/AtlasScreen'
import { BodyScreen } from './screens/BodyScreen'
import { CourseSheet } from './screens/CourseSheet'
import { CreditsScreen } from './screens/CreditsScreen'
import { ExploreScreen } from './screens/ExploreScreen'
import { FlashcardScreen } from './screens/FlashcardScreen'
import { MockScreen } from './screens/MockScreen'
import { OnboardingScreen } from './screens/OnboardingScreen'
import { ProgressScreen } from './screens/ProgressScreen'
import { SearchScreen } from './screens/SearchScreen'
import { TodayScreen } from './screens/TodayScreen'
import { YouScreen } from './screens/YouScreen'
import { useBrowserBack } from './state/browserBack'
import { useAssignments } from './state/dashboard'
import { useNav } from './state/nav'
import { useProgress } from './state/progress'
import { applyTheme, useSettings } from './state/settings'
import { useToasts } from './state/toast'
import './app.css'
import { initAccount } from './account/account'
import { startSync } from './account/sync'
import { AccountScreen } from './screens/AccountScreen'

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
  const { tab, session, cards, explore, credits, mock, body, courses, search, account } = useNav()

  useBrowserBack()
  useEffect(() => {
    startSync()
    initAccount()
  }, [])
  useEffect(() => applyTheme(theme), [theme])
  useEffect(() => applyLang(lang), [lang])

  const Screen = SCREENS[tab]
  const overlay = session || cards || explore || mock || body || search
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
      {mock && !session && !cards && <MockScreen />}
      {body && !session && !cards && !explore && <BodyScreen />}
      {search && !session && !cards && <SearchScreen />}
      {courses && <CourseSheet />}
      {!onboarded && <OnboardingScreen />}
      {account && <AccountScreen mode={account} />}
      <StudyPlanWatcher />
      <Toasts />
    </>
  )
}
