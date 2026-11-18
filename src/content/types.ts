/** Content schema. All quiz content is data in /content/*.json — never hard-coded. */

export type Vec3 = [number, number, number]

export interface CameraView {
  position: Vec3
  target: Vec3
}

/** A course id from content/courses.json (the student's `track` setting). */
export type Track = string

export interface Structure {
  id: string
  name: string
  synonyms: string[]
  latinName: string
  /** One sentence. Must not contain the answer: it is shown as a clue in learn mode. */
  definition: string
  /** Flashcard: what it does. */
  function: string
  /** Flashcard: why it is there (its purpose / design reason). */
  why: string
  /**
   * Notes for particular courses, keyed by note type (nursing, medicine, physio, dentistry, sports); at least one.
   * Each course lists the note types it shows, in order; a structure without the first falls back to the next.
   */
  notes: Record<string, string>
  region: string
  /** GLB file in /public/models. Usually the module's model. */
  modelFile: string
  /**
   * Mesh name(s) to highlight. Matching ignores case and punctuation and allows
   * side/index suffixes, so "humerus" matches "Humerus.l", "Humerus_R", "humerus2".
   */
  meshName: string | string[]
  camera: CameraView
  difficulty: 1 | 2 | 3
}

export interface Region {
  id: string
  name: string
}

export interface ModuleContent {
  module: string
  regions: Region[]
  structures: Structure[]
}

/** Primitive stand-ins used until real GLB models are added. */
export type PlaceholderShape =
  | { shape: 'sphere'; radius: number; position: Vec3; scale?: Vec3; rotation?: Vec3 }
  | { shape: 'box'; size: Vec3; position: Vec3; rotation?: Vec3 }
  | { shape: 'capsule'; radius: number; from: Vec3; to: Vec3 }
  | { shape: 'cone'; radiusTop: number; radiusBottom: number; height: number; position: Vec3; rotation?: Vec3 }
  /** Bones stacked along Y (vertebrae). */
  | { shape: 'stack'; count: number; radius: number; height: number; position: Vec3 }
  /** Parallel rods hanging along -Y (metacarpals, phalanges). */
  | { shape: 'rods'; count: number; radius: number; length: number; spacing: number; position: Vec3; rotation?: Vec3 }
  /** Half-ring lying in the XZ plane, opening backwards (mandible). */
  | { shape: 'arch'; radius: number; tube: number; position: Vec3 }
  /** Rib cage: elliptical arcs from the spine round to the front. */
  | { shape: 'ribcage'; count: number; top: number; bottom: number; radiusX: [number, number]; radiusZ: [number, number]; tube: number; centerZ: number }

export type PlaceholderPart = PlaceholderShape & { name: string }

export interface PlaceholderModel {
  parts: PlaceholderPart[]
}

export interface ModuleInfo {
  id: string
  status: 'available' | 'coming-soon'
  /** Basename of /content/<contentFile>.json */
  contentFile?: string
  /** Basename of /content/<placeholderFile>.json */
  placeholderFile?: string
  model?: {
    file: string
    /** Transform that brings the GLB into atlas space (metres, Y-up, facing +Z, feet at y=0). */
    scale?: number
    position?: Vec3
    rotation?: Vec3
    /** Faint backdrop model for orientation, e.g. the skeleton behind organs. */
    context?: string
  }
  /**
   * A focused region: only these structure ids from `contentFile` are taught. The rest of the model
   * stays visible but faint and can't be tapped, so the student sees where the region sits.
   */
  include?: string[]
  /** Frame one side of the body (`l` or `r`) when the region is bilateral, e.g. a limb. */
  side?: 'l' | 'r'
  /** Body system for colour and grouping; set by the loader for system modules, given explicitly for regions. */
  systemId?: string
  /** Region group id (e.g. `upper-limb`); set by the loader for regional modules. */
  group?: string
  /** English title and description, for modules defined in content (course focus modules). */
  title?: string
  description?: string
  /** A course focus module (content/courses.json), built like a regional module. */
  focus?: boolean
  /**
   * Cover engraving: public/plates/covers/<cover>.webp, cut from the plates by scripts/engravings.py.
   * Only where a plate truly shows the module's anatomy; other modules have none.
   */
  cover?: string
}

/** A group of focused regional modules, e.g. the upper limb. Its name lives in the UI translations (group.<id>). */
export interface RegionGroup {
  id: string
  modules: ModuleInfo[]
}

/** Names and descriptions of systems and modules live in the UI translations (system.<id>, module.<id>). */
export interface BodySystem {
  id: string
  glyph: string
  /** Colour key for the system, after the conventions of anatomical plates (bone ochre, arterial red, nerve yellow…). */
  tint?: string
  modules: ModuleInfo[]
}

/** The full curriculum (content/curriculum.json). Topic titles are English, like the anatomy content. */
export interface CurriculumTopic {
  title: string
  /** One or two sentences: what the topic is. */
  summary: string
  /** The key facts, one sentence each. */
  points: string[]
  /** Available modules that teach this topic's core structures in 3D. */
  modules?: string[]
}

export interface CurriculumCategory {
  id: string
  title: string
  topics: CurriculumTopic[]
}

export interface Curriculum {
  categories: CurriculumCategory[]
}

export interface Catalog {
  systems: BodySystem[]
  /** Focused regional modules built from the system modules' content and models. */
  regions?: RegionGroup[]
}

/** One arrow on an anatomical plate: the point it touches, as a percentage of the image. */
export interface PlateLabel {
  name: string
  x: number
  y: number
  note: string
}

/** A historical anatomical plate with arrows added for Atlas (content/plates.json). English, like the anatomy content. */
export interface Plate {
  id: string
  title: string
  systemId: string
  view: string
  image: string
  width: number
  height: number
  source: string
  intro: string
  labels: PlateLabel[]
}

export interface Plates {
  plates: Plate[]
}

/** A mock-exam question (content/mock.json). The first option is the correct one; the app shuffles them. */
export interface MockQuestion {
  id: string
  topic: string
  q: string
  options: string[]
  explain: string
}

export type MockLevel = 'foundation' | 'higher'

export interface MockBank {
  sets: { id: MockLevel; questions: MockQuestion[] }[]
}

/** A small set of structures from one module, taught together for a course (content/courses.json). */
export interface FocusModule {
  id: string
  title: string
  description: string
  /** The system module whose content and model it uses. */
  from: string
  include: string[]
  /** Cover engraving, as ModuleInfo.cover. */
  cover?: string
}

/** A course (the student's `track`). Every list is in priority order. */
export interface Course {
  id: string
  title: string
  description: string
  /** Note types to show, in order of preference (see Structure.notes). */
  notes: string[]
  /** Focus and system modules. */
  modules: string[]
  /** Regional modules. */
  regions: string[]
  /** Curriculum category ids. */
  categories: string[]
  /** Featured curriculum topic titles. */
  topics: string[]
  /** Plate ids. */
  plates: string[]
  /** Mock-exam question topics used for the course's mock exam. */
  mockTopics: string[]
}

export interface Courses {
  focus: FocusModule[]
  courses: Course[]
}
