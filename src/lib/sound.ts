import { useSettings } from '../state/settings'

/**
 * Small synthesised sounds (no audio files, nothing borrowed): a soft typewriter tick, a muted
 * knock for a wrong key, a bright two-note bell for a correct answer that climbs with the combo,
 * a short bell arpeggio for finishing a session, and a warm closing chord after a mock exam.
 */
type Sound = 'key' | 'wrong' | 'complete' | 'combo' | 'fail' | 'flip' | 'finish' | 'level' | 'mockFinish'

let ctx: AudioContext | null = null
let out: AudioNode | null = null

/** Everything passes through a gentle compressor so stacked notes never clip. */
function output(): AudioNode {
  if (out && ctx) return out
  const comp = ctx!.createDynamicsCompressor()
  comp.threshold.value = -18
  comp.knee.value = 12
  comp.ratio.value = 4
  comp.attack.value = 0.003
  comp.release.value = 0.2
  comp.connect(ctx!.destination)
  out = comp
  return comp
}

function tone(freq: number, start: number, dur: number, gain: number, type: OscillatorType = 'sine', attack = 0.006) {
  if (!ctx) return
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = type
  osc.frequency.value = freq
  const t = ctx.currentTime + start
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(gain, t + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(g).connect(output())
  osc.start(t)
  osc.stop(t + dur + 0.03)
}

/**
 * A small glass bell: the fundamental, a soft octave and a quickly fading bright partial
 * give it a clear, rounded ring rather than a bare beep.
 */
function bell(freq: number, start: number, dur: number, gain: number) {
  tone(freq, start, dur, gain, 'sine', 0.004)
  tone(freq * 2, start, dur * 0.6, gain * 0.32, 'sine', 0.004)
  tone(freq * 3.01, start, dur * 0.28, gain * 0.14, 'sine', 0.002)
  tone(freq * 4.2, start, dur * 0.12, gain * 0.06, 'sine', 0.002)
}

/** Major pentatonic steps so rising combos always sound consonant. */
const PENTA = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21]
const note = (base: number, step: number) => base * Math.pow(2, PENTA[Math.min(step, PENTA.length - 1)] / 12)
const semis = (base: number, n: number) => base * Math.pow(2, n / 12)

export function playSound(sound: Sound, combo = 0) {
  if (!useSettings.getState().sound || typeof window === 'undefined') return
  try {
    ctx ??= new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
    switch (sound) {
      case 'key':
        tone(1800, 0, 0.025, 0.025, 'triangle')
        tone(900, 0, 0.02, 0.015, 'square')
        break
      case 'wrong':
        // A soft wooden knock: low and short, never harsh.
        tone(196, 0, 0.12, 0.07, 'triangle')
        tone(147, 0.05, 0.16, 0.05, 'sine')
        break
      case 'complete': {
        // Correct: a quick rising fifth on a bell, with a faint sparkle an octave above.
        const base = 659.25 // E5
        tone(base / 2, 0, 0.3, 0.035, 'sine', 0.01)
        bell(base, 0, 0.42, 0.06)
        bell(semis(base, 7), 0.085, 0.6, 0.065)
        tone(semis(base, 19), 0.17, 0.25, 0.012, 'sine', 0.003)
        break
      }
      case 'combo': {
        const step = Math.min(combo, 9)
        bell(note(523.25, step), 0, 0.3, 0.05)
        bell(note(523.25, step + 2), 0.07, 0.36, 0.05)
        bell(note(523.25, step + 4), 0.14, 0.55, 0.055)
        break
      }
      case 'fail':
        tone(330, 0, 0.18, 0.045)
        tone(247, 0.1, 0.28, 0.045)
        break
      case 'flip':
        tone(1200, 0, 0.04, 0.02, 'triangle')
        break
      case 'finish':
        ;[0, 2, 4, 5].forEach((s, i) => bell(note(392, s), i * 0.09, 0.6, 0.05))
        break
      case 'level':
        ;[0, 2, 4, 5, 7].forEach((s, i) => bell(note(523.25, s), i * 0.09, 0.7, 0.05))
        break
      case 'mockFinish': {
        // The end of a mock exam: a rising arpeggio that settles on a warm, open major chord.
        const c = 523.25 // C5
        ;[0, 4, 7, 12].forEach((n, i) => bell(semis(c, n), i * 0.11, 0.7, 0.05))
        const chordAt = 0.5
        tone(c / 2, chordAt, 1.9, 0.045, 'sine', 0.04)
        ;[0, 4, 7, 12, 16].forEach((n, i) => {
          tone(semis(c, n), chordAt + i * 0.015, 1.8, 0.03, 'sine', 0.03)
          tone(semis(c, n) * 1.003, chordAt + i * 0.015, 1.6, 0.012, 'sine', 0.05)
        })
        bell(semis(c, 24), chordAt + 0.12, 1.2, 0.02)
        break
      }
    }
  } catch {
    /* audio unavailable */
  }
}
