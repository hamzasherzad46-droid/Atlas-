import { useSettings } from '../state/settings'
import { publicUrl } from './paths'

/**
 * Atlas's sounds are short real recordings in public/sounds/ (sources and licences in
 * public/sounds/SOURCES.md and on the Credits screen), played quietly through one small player.
 * Every play varies pitch and volume by up to ±3 %, so repeated sounds (typing) never sound
 * mechanical. A file that is missing simply stays silent.
 */
export type Sound = 'key' | 'wrong' | 'fail' | 'complete' | 'flip' | 'finish' | 'mockFinish'

/** The recordings for each sound (one picked at random when there are several). */
export const SOUND_FILES = {
  key: ['typewriter-key-1', 'typewriter-key-2', 'typewriter-key-3', 'typewriter-key-4'],
  wrong: ['wooden-tap'],
  fail: ['wooden-tap'],
  complete: ['desk-bell'],
  flip: ['page-turn'],
  // A finished quiz is silent: the results screen says enough.
  finish: [],
  mockFinish: ['rubber-stamp'],
} satisfies Record<Sound, string[]>

/** How loud each sound plays, from 0 to 1 (the files are levelled to the same peak). */
const VOLUME: Record<Sound, number> = {
  key: 0.22,
  wrong: 0.4,
  fail: 0.45,
  complete: 0.32,
  flip: 0.35,
  finish: 0,
  mockFinish: 0.45,
}

/** Up to ±3 % per play, on pitch and on volume. */
const VARY = 0.03
const vary = () => 1 + (Math.random() * 2 - 1) * VARY

/** A sound asked for before its file has arrived plays only if it can still be on time. */
const LATE_MS = 120

let ctx: AudioContext | null = null
const files = new Map<string, Promise<ArrayBuffer | null>>()
const buffers = new Map<string, Promise<AudioBuffer | null>>()

/** The file's bytes, fetched once. Nothing is decoded until the first sound plays. */
function fetchFile(name: string): Promise<ArrayBuffer | null> {
  let p = files.get(name)
  if (!p) {
    p = fetch(publicUrl(`sounds/${name}.mp3`))
      .then((r) => (r.ok ? r.arrayBuffer() : null))
      .catch(() => null)
    files.set(name, p)
  }
  return p
}

function load(name: string): Promise<AudioBuffer | null> {
  let p = buffers.get(name)
  if (!p) {
    // decodeAudioData takes over the bytes it is given, so it gets a copy.
    p = fetchFile(name)
      .then((data) => (data && ctx ? ctx.decodeAudioData(data.slice(0)) : null))
      .catch(() => null)
    buffers.set(name, p)
  }
  return p
}

/**
 * Fetch the recordings (a few small files) when a quiz, deck or mock exam opens, so the first key
 * already has its sound. Does nothing when sound is off.
 */
export function preloadSounds() {
  if (!useSettings.getState().sound || typeof window === 'undefined') return
  for (const names of Object.values(SOUND_FILES)) for (const n of names) void fetchFile(n)
}

function play(buffer: AudioBuffer, volume: number) {
  if (!ctx) return
  const source = ctx.createBufferSource()
  const gain = ctx.createGain()
  source.buffer = buffer
  source.playbackRate.value = vary()
  gain.gain.value = volume * vary()
  source.connect(gain).connect(ctx.destination)
  source.start()
}

export function playSound(sound: Sound) {
  if (!useSettings.getState().sound || typeof window === 'undefined') return
  const names = SOUND_FILES[sound]
  if (!names.length) return
  try {
    if (!ctx) {
      ctx = new AudioContext()
      preloadSounds()
    }
    if (ctx.state === 'suspended') void ctx.resume()
    const asked = performance.now()
    void load(names[Math.floor(Math.random() * names.length)]).then((buffer) => {
      if (buffer && performance.now() - asked < LATE_MS) play(buffer, VOLUME[sound])
    })
  } catch {
    // Audio unavailable (an old browser, or the system refused): the app works silently.
  }
}
