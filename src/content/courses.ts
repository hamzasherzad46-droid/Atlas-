import type { Course, Courses, ModuleInfo, Structure } from './types'

/**
 * Pure helpers for courses (content/courses.json). They take the data as arguments so tests can
 * add a course that exists only in JSON and check that nothing else is needed.
 */

/** Focus modules become ordinary modules built from their source module, like regional modules. */
export function buildFocusModules(data: Courses, systemModules: ModuleInfo[]): ModuleInfo[] {
  return data.focus.flatMap((f) => {
    const from = systemModules.find((m) => m.id === f.from)
    if (!from) return []
    return [
      {
        id: f.id,
        status: from.status,
        contentFile: from.contentFile,
        model: from.model,
        systemId: from.systemId,
        include: f.include,
        title: f.title,
        description: f.description,
        focus: true,
        cover: f.cover,
      },
    ]
  })
}

/** The course with this id, or the first course if the id is unknown (for example a course that was removed). */
export function findCourse(data: Courses, id: string): Course {
  return data.courses.find((c) => c.id === id) ?? data.courses[0]
}

/** The note for this course: its note types in order, then any note the structure has. */
export function noteForCourse(s: Structure, course: Course): { kind: string; text: string } | null {
  const order = [...course.notes, ...Object.keys(s.notes)]
  for (const kind of order) {
    const text = s.notes[kind]
    if (text) return { kind, text }
  }
  return null
}

/** The module to continue with: the last one studied if it still exists, otherwise the course's first. */
export function continueModuleId(course: Course, last: string | null | undefined, exists: (id: string) => boolean): string {
  if (last && exists(last)) return last
  return [...course.modules, ...course.regions].find(exists) ?? course.modules[0]
}
