import { noteForCourse } from './courses'
import { getCourse } from './loader'
import type { Structure } from './types'

/** The note for the student's course (its preferred note types first), or the closest available one. */
export function noteFor(s: Structure, courseId: string): { kind: string; text: string } | null {
  return noteForCourse(s, getCourse(courseId))
}
