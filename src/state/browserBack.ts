import { useEffect } from 'react'
import { browserDepth, NAV_SESSION, useNav, type BrowserEntry } from './nav'

const entry = (atlasDepth: number): BrowserEntry => ({ atlasDepth, atlasSession: NAV_SESSION })

/**
 * Keeps the browser's history in step with the app's: every new view adds a browser entry, so the
 * phone's back gesture and the browser's back button do what the app's own Back does.
 */
export function useBrowserBack() {
  useEffect(() => {
    // The entry the app opened on is depth 0, whatever an earlier load left in it.
    window.history.replaceState(entry(useNav.getState().history.length), '')
    let depth = useNav.getState().history.length
    const unsubscribe = useNav.subscribe((s) => {
      if (s.history.length > depth) window.history.pushState(entry(s.history.length), '')
      depth = s.history.length
    })
    // Each entry records how deep the app's history was when it was added; going back to an entry
    // (one step or several) steps the app back to the same depth.
    const onPop = (e: PopStateEvent) => {
      const target = browserDepth(e.state)
      const nav = useNav.getState()
      // Forward has nothing to return to (the app keeps no forward history), so step the browser back again.
      if (target > nav.history.length) return window.history.go(nav.history.length - target)
      while (useNav.getState().history.length > target) useNav.getState().back()
      depth = useNav.getState().history.length
    }
    window.addEventListener('popstate', onPop)
    return () => {
      unsubscribe()
      window.removeEventListener('popstate', onPop)
    }
  }, [])
}
