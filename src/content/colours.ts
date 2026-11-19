import data from '../../content/colours.json'

/**
 * One muted colour per organ or tissue in the 3D views, from content/colours.json: a mesh takes the
 * group of the first rule with a pattern in its (lower-case) name, else its model file's group, else
 * "other". Never colours in components.
 */
export interface ColourGroup {
  id: string
  /** English name, shown in the colour key. */
  name: string
  colour: string
  /** Below 1 for wrapping tissue drawn see-through (breast fat, skin). */
  opacity: number
}

interface ColourData {
  groups: Record<string, { name: string; colour: string; opacity?: number }>
  rules: { group: string; match: string[] }[]
  files: Record<string, string>
  fallback: string
  neighbours: [string, string][]
}

const colours = data as unknown as ColourData

export const COLOUR_GROUPS: ColourGroup[] = Object.entries(colours.groups).map(([id, g]) => ({ id, name: g.name, colour: g.colour, opacity: g.opacity ?? 1 }))
const byId = new Map(COLOUR_GROUPS.map((g) => [g.id, g]))

export const colourGroup = (id: string): ColourGroup => byId.get(id) ?? byId.get(colours.fallback)!

/** The group of a mesh in a model file (file is the GLB's basename, e.g. "digestive.glb"). */
export function colourGroupFor(file: string | undefined, meshName: string): ColourGroup {
  const name = meshName.toLowerCase()
  for (const rule of colours.rules) if (rule.match.some((p) => name.includes(p))) return colourGroup(rule.group)
  return colourGroup((file && colours.files[file]) || colours.fallback)
}

/** Groups in the order of content/colours.json, for listing in the colour key. */
export function sortGroups(ids: Iterable<string>): ColourGroup[] {
  const set = new Set(ids)
  return COLOUR_GROUPS.filter((g) => set.has(g.id))
}

export const COLOUR_NEIGHBOURS = colours.neighbours
export const COLOUR_RULES = colours.rules
export const COLOUR_FILES = colours.files
