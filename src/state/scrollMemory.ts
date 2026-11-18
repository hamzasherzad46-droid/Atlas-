import { useEffect, useLayoutEffect, useRef } from 'react'
import { useNav, type View } from './nav'

/** One key per page in the tabs (a tab's own page, a module, a plate, a topic). */
const pageKey = (v: Pick<View, 'tab' | 'modulePage' | 'plate' | 'topic'>) =>
  [v.tab, v.modulePage ?? '', v.plate ?? '', v.topic ? `${v.topic.cat}:${v.topic.index}` : ''].join('|')

const positions = new Map<string, number>()

/**
 * Each page keeps its own scroll position: a page opened anew starts at the top, and Back (or
 * closing a full-screen view over it) returns to where the student was on it.
 */
export function useScrollMemory(overlayOpen: boolean) {
  const key = useNav(pageKey)
  const current = useRef({ key, overlayOpen })

  useLayoutEffect(() => {
    current.current = { key, overlayOpen }
    if (!overlayOpen) window.scrollTo(0, positions.get(key) ?? 0)
  }, [key, overlayOpen])

  useEffect(() => {
    // While a full-screen view is open the page underneath is hidden and its scroll means nothing.
    const onScroll = () => {
      if (!current.current.overlayOpen) positions.set(current.current.key, window.scrollY)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
}
