import { useSettings } from '../state/settings'
import { publicUrl } from './paths'

/**
 * Atlas's sounds, played quietly through one small player. Typing is a soft click made here: a
 * very short burst of filtered noise, like a good laptop key heard from a little way off. The rest
 * are short real recordings in public/sounds/ (sources and licences in public/sounds/SOURCES.md and
 * on the Credits screen); every play varies their pitch and volume by up to ±3 %, and a file that
 * is missing simply stays silent.
 */
export type Sound = 'key' | 'wrong' | 'fail' | 'complete' | 'flip' | 'finish' | 'mockFinish'
type Recorded = Exclude<Sound, 'key'>

/** The recordings for each sound (one picked at random when there are several). */
export const SOUND_FILES = {
  wrong: ['wooden-tap'],
  fail: ['wooden-tap'],
  complete: ['desk-bell'],
  flip: ['page-turn'],
  // A finished quiz is silent: the results screen says enough.
  finish: [],
  mockFinish: ['rubber-stamp'],
} satisfies Record<Recorded, string[]>

/** How loud each recording plays, from 0 to 1 (the files are levelled to the same peak). */
const VOLUME: Record<Recorded, number> = {
  wrong: 0.4,
  fail: 0.45,
  complete: 0.32,
  flip: 0.35,
  finish: 0,
  mockFinish: 0.45,
}

/**
 * The typing click: 12 ms of noise decaying fast (2.5 ms time constant), band-passed around
 * 2.5 kHz so it has no pitch, quiet. Each press moves the filter by up to ±5 % and the level by up
 * to ±1.5 dB, so fast typing never sounds like a loop.
 */
const CLICK = { ms: 12, decayMs: 2.5, hz: 2500, q: 1.2, volume: 0.32, hzVary: 0.05, dbVary: 1.5 }
let clickNoise: AudioBuffer | null = null

/** The click's noise, made once (per sample rate) and reused for every key, so typing never waits. */
function noise(c: BaseAudioContext): AudioBuffer {
  if (clickNoise && clickNoise.sampleRate === c.sampleRate) return clickNoise
  const length = Math.round((c.sampleRate * CLICK.ms) / 1000)
  const buffer = c.createBuffer(1, length, c.sampleRate)
  const data = buffer.getChannelData(0)
  const tau = (c.sampleRate * CLICK.decayMs) / 1000
  for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / tau)
  clickNoise = buffer
  return buffer
}

const spread = () => Math.random() * 2 - 1

/** One key click on this audio context (exported so it can be measured offline). */
export function click(c: BaseAudioContext, at = c.currentTime) {
  const source = c.createBufferSource()
  source.buffer = noise(c)
  const filter = c.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = CLICK.hz * (1 + spread() * CLICK.hzVary)
  filter.Q.value = CLICK.q
  const gain = c.createGain()
  gain.gain.value = CLICK.volume * 10 ** ((spread() * CLICK.dbVary) / 20)
  source.connect(filter).connect(gain).connect(c.destination)
  source.start(at)
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
 * Fetch the recordings (a few small files) when a quiz, deck or mock exam opens, so the first
 * answer already has its sound. Does nothing when sound is off.
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

function context(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext()
    preloadSounds()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

export function playSound(sound: Sound) {
  if (!useSettings.getState().sound || typeof window === 'undefined') return
  try {
    if (sound === 'key') return click(context())
    const names = SOUND_FILES[sound]
    if (!names.length) return
    context()
    const asked = performance.now()
    void load(names[Math.floor(Math.random() * names.length)]).then((buffer) => {
      if (buffer && performance.now() - asked < LATE_MS) play(buffer, VOLUME[sound])
    })
  } catch {
    // Audio unavailable (an old browser, or the system refused): the app works silently.
  }
}
