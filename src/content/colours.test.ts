import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { COLOUR_FILES, COLOUR_GROUPS, COLOUR_NEIGHBOURS, COLOUR_RULES, colourGroupFor } from './colours'

/** CIELAB (D65) of a #rrggbb colour. */
function lab(hex: string): [number, number, number] {
  const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  const [r, g, b] = [1, 3, 5].map((i) => lin(parseInt(hex.slice(i, i + 2), 16) / 255))
  const x = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047
  const y = 0.2126 * r + 0.7152 * g + 0.0722 * b
  const z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))]
}

const models = fileURLToPath(new URL('../../public/models/', import.meta.url))
/** Mesh (node) names in a GLB, read from its JSON chunk. */
function meshNames(file: string): string[] {
  const data = readFileSync(join(models, file))
  const length = data.readUInt32LE(12)
  const doc = JSON.parse(data.subarray(20, 20 + length).toString('utf8')) as { nodes: { name?: string; mesh?: number }[] }
  return doc.nodes.filter((n) => n.mesh !== undefined).map((n) => n.name ?? '')
}

describe('organ colours', () => {
  const ids = new Set(COLOUR_GROUPS.map((g) => g.id))

  it('every group has a colour and a name, every rule and file names a group', () => {
    for (const g of COLOUR_GROUPS) {
      expect(g.colour, g.id).toMatch(/^#[0-9a-f]{6}$/)
      expect(g.name.length, g.id).toBeGreaterThan(2)
    }
    expect(new Set(COLOUR_GROUPS.map((g) => g.name)).size).toBe(COLOUR_GROUPS.length)
    for (const r of COLOUR_RULES) expect(ids.has(r.group), r.group).toBe(true)
    for (const g of Object.values(COLOUR_FILES)) expect(ids.has(g), g).toBe(true)
  })

  it('has its own colour for each organ the students study', () => {
    for (const id of ['heart', 'lungs', 'airway', 'liver', 'gallbladder', 'stomach', 'spleen', 'pancreas', 'small-intestine', 'large-intestine', 'kidney', 'ureter', 'bladder', 'brain', 'thyroid', 'adrenal', 'uterus', 'ovary', 'tube', 'breast', 'prostate', 'testis', 'bone', 'muscle', 'arteries', 'veins', 'nerves'])
      expect(ids.has(id), id).toBe(true)
  })

  it('colours are muted: chroma at most 40', () => {
    for (const g of COLOUR_GROUPS) {
      const [, a, b] = lab(g.colour)
      expect(Math.hypot(a, b), g.id).toBeLessThanOrEqual(40)
    }
  })

  it('neighbouring organs differ in lightness (10+) as well as colour (ΔE 20+), so colour-blind students can tell them apart', () => {
    for (const [a, b] of COLOUR_NEIGHBOURS) {
      const ca = COLOUR_GROUPS.find((g) => g.id === a)
      const cb = COLOUR_GROUPS.find((g) => g.id === b)
      expect(ca && cb, `${a}/${b}`).toBeTruthy()
      const la = lab(ca!.colour)
      const lb = lab(cb!.colour)
      expect(Math.abs(la[0] - lb[0]), `lightness ${a}/${b}`).toBeGreaterThanOrEqual(10)
      expect(Math.hypot(la[0] - lb[0], la[1] - lb[1], la[2] - lb[2]), `ΔE ${a}/${b}`).toBeGreaterThanOrEqual(20)
    }
  })

  it('every mesh of every model has a colour of its own (none falls to “other”)', () => {
    const missing: string[] = []
    for (const file of readdirSync(models).filter((f) => f.endsWith('.glb'))) for (const name of meshNames(file)) if (colourGroupFor(file, name).id === 'other') missing.push(`${file}: ${name}`)
    expect(missing).toEqual([])
  })

  it('maps meshes to the organ they are', () => {
    const cases: [string, string, string][] = [
      ['digestive.glb', 'liver_surface', 'liver'],
      ['digestive.glb', 'cystic_duct', 'gallbladder'],
      ['digestive.glb', 'pancreatic_duct', 'pancreas'],
      ['digestive.glb', 'mesoappendix', 'mesentery'],
      ['heart.glb', 'pulmonary_trunk', 'veins'],
      ['heart.glb', 'superior_pulmonary_vein.l', 'arteries'],
      ['heart.glb', 'wall_of_ventricle.l', 'heart'],
      ['airways.glb', 'trachea', 'airway'],
      ['airways.glb', 'apical_segmental_bronchial_tree.r', 'lungs'],
      ['skeleton.glb', 'lacrimal.l', 'bone'],
      ['skeleton.glb', 'costal_cartilage_1.l', 'cartilage'],
      ['body-glands.glb', 'flexor_retinaculum_of_wrist.l', 'ligament'],
      ['body-glands.glb', 'lacrimal_gland.l', 'eye'],
      ['body-nervous.glb', 'lacrimal_nerve.l', 'nerves'],
      ['urinary.glb', 'urinary_bladder', 'bladder'],
      ['female-reproductive.glb', 'uterine_tube_ampulla.l', 'tube'],
      ['female-reproductive.glb', 'pubis.r', 'bone'],
    ]
    for (const [file, mesh, group] of cases) expect(colourGroupFor(file, mesh).id, `${file} ${mesh}`).toBe(group)
  })
})
