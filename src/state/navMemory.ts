import { getModuleInfo } from '../content/loader'
import { appStorage, STORAGE_KEYS } from '../lib/storage'
import { HOME, useNav, viewOf, type View } from './nav'
import { useSearchQuery } from './searchQuery'

/** A place older than this is not reopened: the app opens on Today, as a new day of study should. */
export const PLACE_FRESH_MS = 12 * 60 * 60 * 1000

export interface SavedPlace {
  at: number
  view: View
  history: View[]
  query?: string
}

/** What a view becomes when reopened: no sheet or account dialog over it, and a mock exam at its setup. */
function settle(v: View): View {
  return { ...HOME, ...v, courses: false, account: null, mock: v.mock ? { topic: v.mock.topic } : null }
}

const known = (id: string | null) => !id || !!getModuleInfo(id)

/**
 * The view (and the history behind it) to reopen after a reload, or null for Today. A quiz or deck
 * that was interrupted is not reopened mid-question: the screen it was started from comes back,
 * where its Continue button picks it up.
 */
export function placeToRestore(saved: SavedPlace | null, now: number): { view: View; history: View[] } | null {
  if (!saved?.view || !Array.isArray(saved.history) || now - saved.at > PLACE_FRESH_MS || saved.at > now) return null
  let view = saved.view
  let history = saved.history
  while ((view.session || view.cards) && history.length) {
    view = history[history.length - 1]
    history = history.slice(0, -1)
  }
  if (view.session || view.cards) return null
  const all = [view, ...history]
  // Content can change between visits; a module that no longer exists is not reopened.
  if (!all.every((v) => known(v.modulePage) && known(v.explore))) return null
  return { view: settle(view), history: history.filter((v) => !v.session && !v.cards).map(settle) }
}

/** Reopen the place saved by the last visit, if it is recent. Call before the app first renders. */
export function restorePlace(now = Date.now()) {
  const raw = appStorage.getItem(STORAGE_KEYS.place)
  if (typeof raw !== 'string') return
  let saved: SavedPlace
  try {
    saved = JSON.parse(raw) as SavedPlace
  } catch {
    return
  }
  const place = placeToRestore(saved, now)
  if (!place) return
  useNav.setState({ ...place.view, history: place.history })
  if (place.view.search && saved.query) useSearchQuery.getState().set(saved.query)
}

/** Keep the current place saved as the student moves around (and as they type a search). */
export function rememberPlace() {
  const save = () => {
    const nav = useNav.getState()
    const place: SavedPlace = { at: Date.now(), view: viewOf(nav), history: nav.history, query: useSearchQuery.getState().q || undefined }
    appStorage.setItem(STORAGE_KEYS.place, JSON.stringify(place))
  }
  const a = useNav.subscribe(save)
  const b = useSearchQuery.subscribe(save)
  return () => {
    a()
    b()
  }
}
