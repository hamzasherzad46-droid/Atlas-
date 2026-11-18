import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { SOUND_FILES } from './sound'

const dir = fileURLToPath(new URL('../../public/sounds', import.meta.url))
const sources = readFileSync(`${dir}/SOURCES.md`, 'utf8')
const named = new Set(Object.values(SOUND_FILES).flat())

describe('sound recordings', () => {
  it('every recording in public/sounds is used, and its source and licence are recorded', () => {
    const files = readdirSync(dir).filter((f) => f.endsWith('.mp3'))
    expect(files.length).toBeGreaterThan(0)
    for (const f of files) {
      expect(named.has(f.replace(/\.mp3$/, '')), `${f} is not used`).toBe(true)
      expect(sources, `${f} is missing from SOURCES.md`).toContain(f.replace(/-\d\.mp3$/, '-1.mp3'))
    }
  })

  it('every sound the app asks for is listed in SOURCES.md, whether or not its file is there yet', () => {
    for (const name of named) {
      const file = `${name.replace(/-\d$/, '-1')}.mp3`
      expect(sources, file).toContain(file)
      if (!existsSync(`${dir}/${name}.mp3`)) expect(sources, `${file} should say it is not chosen yet`).toMatch(/Not yet chosen/)
    }
  })
})
