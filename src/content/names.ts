import { getModuleInfo } from './loader'
import type { Course } from './types'

/** Anything with the dynamic translation lookup of useT(). */
interface Td {
  td(key: string, fallback: string): string
}

/** A module's display name: its translation, else the English title from content, else its id. */
export function moduleTitle(t: Td, id: string): string {
  return t.td(`module.${id}`, getModuleInfo(id)?.title ?? id)
}

/** A course's display name and description: translations where they exist, else the English from courses.json. */
export function courseTitle(t: Td, course: Course): string {
  return t.td(`track.${course.id}`, course.title)
}

export function courseDescription(t: Td, course: Course): string {
  return t.td(`trackHelp.${course.id}`, course.description)
}
