/**
 * Procedural ambient audio engine.
 *
 * Local Radio plays real internet radio streams (may fail if a station is
 * geo-restricted or offline — this is surfaced as a channel error state).
 *
 * Street Sounds and Weather Sounds are synthesized in the browser with the
 * Web Audio API (filtered noise + slow modulation). This keeps the mixer
 * fully functional offline and avoids relying on third-party sound-effect
 * licensing for a thesis prototype, while still producing three genuinely
 * independent, simultaneously mixable channels as specified.
 */

type AmbienceKind = string
/** How often street-level voice/car events fire — tracks the neighborhood's actual activity level 1:1. */
export type StreetDensity = 'quiet' | 'light' | 'moderate' | 'busy' | 'very-busy'

class NoiseVoice {
  private ctx: AudioContext
  private source: AudioBufferSourceNode | null = null
  private filter: BiquadFilterNode
  private gain: GainNode
  private lfo: OscillatorNode | null = null
  private lfoGain: GainNode | null = null
  private output: GainNode
  private eventTimerId: ReturnType<typeof setTimeout> | null = null
  private eventTimerIds: ReturnType<typeof setTimeout>[] = []

  constructor(ctx: AudioContext, destination: AudioNode) {
    this.ctx = ctx
    this.filter = ctx.createBiquadFilter()
    this.gain = ctx.createGain()
    this.output = ctx.createGain()
    this.gain.gain.value = 0
    this.filter.connect(this.gain)
    this.gain.connect(this.output)
    this.output.connect(destination)
  }

  private makeNoiseBuffer(seconds = 4) {
    const bufferSize = this.ctx.sampleRate * seconds
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
    const data = buffer.getChannelData(0)
    let b0 = 0, b1 = 0, b2 = 0
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1
      // mild pink-ish coloring for a softer noise floor
      b0 = 0.99 * b0 + white * 0.1
      b1 = 0.95 * b1 + white * 0.15
      b2 = white
      data[i] = (b0 + b1 + b2 * 0.2) * 0.35
    }
    return buffer
  }

  configure(kind: AmbienceKind, density?: StreetDensity) {
    this.stop()
    const buffer = this.makeNoiseBuffer()
    const source = this.ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true

    switch (kind) {
      case 'urban-street':
        this.filter.type = 'lowpass'
        this.filter.frequency.value = 900
        this.addLFO(this.filter.frequency, 0.05, 150)
        this.scheduleCityEvents(density ?? 'busy')
        break
      case 'quiet-neighborhood':
        this.filter.type = 'lowpass'
        this.filter.frequency.value = 400
        this.addLFO(this.filter.frequency, 0.03, 80)
        this.scheduleCityEvents(density ?? 'light')
        break
      case 'market':
        this.filter.type = 'bandpass'
        this.filter.frequency.value = 1200
        this.filter.Q.value = 0.6
        this.addLFO(this.filter.frequency, 0.4, 400)
        this.scheduleCityEvents(density ?? 'busy')
        break
      case 'cafe':
        this.filter.type = 'bandpass'
        this.filter.frequency.value = 850
        this.filter.Q.value = 0.8
        this.addLFO(this.filter.frequency, 0.25, 200)
        this.scheduleCityEvents(density ?? 'light')
        break
      case 'waterfront':
        // Still a street-level scene, not a nature/weather one — the water
        // just colors the bed; voices and the odd car still live on top.
        this.filter.type = 'lowpass'
        this.filter.frequency.value = 650
        this.addLFO(this.filter.frequency, 0.08, 250)
        this.scheduleCityEvents(density ?? 'light')
        break
      case 'quiet-city':
        // The "mostly quiet" street bed: no wind/birds (that's the Weather
        // channel's job) — just a soft room-tone-like hum under occasional
        // distant voices and the rare car passing by.
        this.filter.type = 'lowpass'
        this.filter.frequency.value = 380
        this.scheduleCityEvents(density ?? 'quiet')
        break
      case 'light-rain':
        this.filter.type = 'highpass'
        this.filter.frequency.value = 2200
        this.addLFO(this.filter.frequency, 0.15, 300)
        break
      case 'heavy-rain':
        this.filter.type = 'highpass'
        this.filter.frequency.value = 1400
        this.addLFO(this.filter.frequency, 0.3, 500)
        break
      case 'wind':
        this.filter.type = 'lowpass'
        this.filter.frequency.value = 500
        this.addLFO(this.filter.frequency, 0.06, 350)
        break
      case 'thunder':
        this.filter.type = 'lowpass'
        this.filter.frequency.value = 220
        this.addLFO(this.filter.frequency, 0.04, 100)
        break
      case 'clear-outdoor':
        this.filter.type = 'lowpass'
        this.filter.frequency.value = 300
        break
      case 'snow':
        this.filter.type = 'lowpass'
        this.filter.frequency.value = 250
        this.addLFO(this.filter.frequency, 0.02, 60)
        break
      case 'birds':
        // a very quiet room-tone bed; the actual "sound" is the chirps layered on top
        this.filter.type = 'lowpass'
        this.filter.frequency.value = 220
        this.scheduleNatureEvents('birds')
        break
      case 'night':
        this.filter.type = 'lowpass'
        this.filter.frequency.value = 180
        this.scheduleNatureEvents('night')
        break
      default:
        this.filter.type = 'lowpass'
        this.filter.frequency.value = 600
    }

    source.connect(this.filter)
    source.start()
    this.source = source
  }

  /** Schedules randomized short chirp/cricket bursts layered on top of the ambient bed. */
  private scheduleNatureEvents(kind: 'birds' | 'night') {
    const next = () => {
      const delay = kind === 'birds' ? 700 + Math.random() * 2600 : 180 + Math.random() * 500
      this.eventTimerId = setTimeout(() => {
        if (kind === 'birds') this.playChirp()
        else this.playCricketPulse()
        next()
      }, delay)
    }
    next()
  }

  private playChirp() {
    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const env = this.ctx.createGain()
    osc.type = 'sine'
    const base = 2200 + Math.random() * 1800
    osc.frequency.setValueAtTime(base, now)
    osc.frequency.exponentialRampToValueAtTime(base * (0.55 + Math.random() * 0.5), now + 0.09)
    env.gain.setValueAtTime(0, now)
    env.gain.linearRampToValueAtTime(0.5, now + 0.012)
    env.gain.exponentialRampToValueAtTime(0.001, now + 0.15)
    osc.connect(env)
    env.connect(this.gain)
    osc.start(now)
    osc.stop(now + 0.18)
    osc.onended = () => {
      osc.disconnect()
      env.disconnect()
    }
  }

  private playCricketPulse() {
    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const env = this.ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.value = 4000 + Math.random() * 500
    env.gain.setValueAtTime(0, now)
    env.gain.linearRampToValueAtTime(0.16, now + 0.008)
    env.gain.exponentialRampToValueAtTime(0.001, now + 0.07)
    osc.connect(env)
    env.connect(this.gain)
    osc.start(now)
    osc.stop(now + 0.08)
    osc.onended = () => {
      osc.disconnect()
      env.disconnect()
    }
  }

  /**
   * Street-level city texture: soft, indistinct crowd murmur plus the
   * occasional car passing by. Deliberately avoids anything wind/bird-like
   * so it never reads as a weather sound — that's the Weather channel's job.
   * `density` tracks the neighborhood's real activity level 1:1 — light
   * activity gets sparse, quiet voices and rare cars; very-busy gets
   * frequent, louder ones.
   */
  private scheduleCityEvents(density: StreetDensity) {
    const GAPS: Record<StreetDensity, { murmur: [number, number]; car: [number, number] }> = {
      quiet: { murmur: [1800, 5200], car: [25000, 60000] },
      light: { murmur: [900, 3200], car: [14000, 32000] },
      moderate: { murmur: [550, 1900], car: [9000, 20000] },
      busy: { murmur: [350, 1300], car: [5500, 13000] },
      'very-busy': { murmur: [200, 850], car: [3000, 7500] },
    }
    const { murmur: murmurGap, car: carGap } = GAPS[density]

    const nextMurmur = () => {
      const [lo, hi] = murmurGap
      const id = setTimeout(() => {
        this.playMurmurSwell(density)
        nextMurmur()
      }, lo + Math.random() * (hi - lo))
      this.eventTimerIds.push(id)
    }
    const nextCar = () => {
      const [lo, hi] = carGap
      const id = setTimeout(() => {
        this.playCarPass(density)
        nextCar()
      }, lo + Math.random() * (hi - lo))
      this.eventTimerIds.push(id)
    }
    nextMurmur()
    nextCar()
  }

  /** A short, indistinct swell of overlapping voices — never intelligible words, just texture. */
  private playMurmurSwell(density: StreetDensity) {
    const now = this.ctx.currentTime
    const dur = 0.7 + Math.random() * 1.1
    const PEAK: Record<StreetDensity, number> = { quiet: 0.07, light: 0.11, moderate: 0.14, busy: 0.17, 'very-busy': 0.2 }
    const peak = PEAK[density]

    const src = this.ctx.createBufferSource()
    src.buffer = this.makeNoiseBuffer(dur + 0.2)
    const band = this.ctx.createBiquadFilter()
    band.type = 'bandpass'
    band.frequency.value = 450 + Math.random() * 900
    band.Q.value = 0.9
    const env = this.ctx.createGain()
    env.gain.setValueAtTime(0, now)
    env.gain.linearRampToValueAtTime(peak, now + dur * 0.35)
    env.gain.linearRampToValueAtTime(0, now + dur)

    src.connect(band)
    band.connect(env)
    env.connect(this.gain)
    src.start(now)
    src.stop(now + dur)
    src.onended = () => {
      src.disconnect()
      band.disconnect()
      env.disconnect()
    }
  }

  /** A car driving past: a low-passed noise swell with a filter sweep, like a Doppler pass-by. */
  private playCarPass(density: StreetDensity) {
    const now = this.ctx.currentTime
    const dur = 2.2 + Math.random() * 1.4
    const direction = Math.random() < 0.5 ? 1 : -1
    const PEAK: Record<StreetDensity, number> = { quiet: 0.06, light: 0.08, moderate: 0.1, busy: 0.12, 'very-busy': 0.15 }

    const src = this.ctx.createBufferSource()
    src.buffer = this.makeNoiseBuffer(dur + 0.2)
    const low = this.ctx.createBiquadFilter()
    low.type = 'lowpass'
    const startFreq = direction > 0 ? 180 : 650
    const endFreq = direction > 0 ? 650 : 180
    low.frequency.setValueAtTime(startFreq, now)
    low.frequency.linearRampToValueAtTime(endFreq, now + dur)
    const env = this.ctx.createGain()
    env.gain.setValueAtTime(0, now)
    env.gain.linearRampToValueAtTime(PEAK[density], now + dur * 0.4)
    env.gain.linearRampToValueAtTime(0, now + dur)

    src.connect(low)
    low.connect(env)
    env.connect(this.gain)
    src.start(now)
    src.stop(now + dur)
    src.onended = () => {
      src.disconnect()
      low.disconnect()
      env.disconnect()
    }
  }

  private addLFO(param: AudioParam, rate: number, depth: number) {
    const lfo = this.ctx.createOscillator()
    const lfoGain = this.ctx.createGain()
    lfo.frequency.value = rate
    lfoGain.gain.value = depth
    lfo.connect(lfoGain)
    lfoGain.connect(param)
    lfo.start()
    this.lfo = lfo
    this.lfoGain = lfoGain
  }

  setVolume(v: number, rampSeconds = 0.4) {
    const now = this.ctx.currentTime
    this.gain.gain.cancelScheduledValues(now)
    this.gain.gain.setTargetAtTime(v, now, rampSeconds)
  }

  stop() {
    if (this.eventTimerId !== null) {
      clearTimeout(this.eventTimerId)
      this.eventTimerId = null
    }
    if (this.eventTimerIds.length) {
      this.eventTimerIds.forEach(clearTimeout)
      this.eventTimerIds = []
    }
    this.source?.stop()
    this.source?.disconnect()
    this.source = null
    this.lfo?.stop()
    this.lfo?.disconnect()
    this.lfo = null
    this.lfoGain?.disconnect()
    this.lfoGain = null
  }

  dispose() {
    this.stop()
    this.filter.disconnect()
    this.gain.disconnect()
    this.output.disconnect()
  }
}

class RadioVoice {
  private element: HTMLAudioElement | null = null
  private lastVolume = 0
  /** Set by the engine from master volume / mute-all, since this channel isn't routed through the Web Audio graph. */
  private masterFactor = 1
  /**
   * iOS Safari ignores `.volume` on media elements entirely (by design —
   * only the hardware buttons/Control Center set device output level there),
   * so driving mute through `masterFactor` alone silently does nothing on
   * iOS. `.muted` is the one property iOS actually honors from JS, so it's
   * tracked and re-applied separately, including onto a freshly created
   * element in play() (a new <audio> always starts unmuted otherwise).
   */
  private isMuted = false
  /** Bumped on every play()/stop() so a stale attempt's callbacks can tell they've been superseded. */
  private generation = 0
  onStatusChange: ((status: 'idle' | 'loading' | 'playing' | 'error') => void) | null = null

  /**
   * Deliberately NOT routed through the shared Web Audio graph via
   * createMediaElementSource: Safari/WebKit has a long-standing quirk where
   * a live, indefinite-duration stream connected that way fires `playing`
   * normally while producing silent output through the graph — so the
   * element itself looks like it's working (status: playing, UI "on") but
   * no sound ever reaches the speakers. Playing directly through the
   * element's own `.volume` sidesteps that entirely and works the same way
   * in every browser. Master volume / mute-all are mixed in by hand below
   * instead of via a shared gain node.
   */
  async play(streamUrl: string, loop = false) {
    this.stop()
    this.onStatusChange?.('loading')
    const myGeneration = this.generation
    const isCurrent = () => myGeneration === this.generation

    const audio = new Audio()
    audio.preload = 'auto'
    audio.loop = loop
    audio.volume = this.effectiveVolume()
    audio.muted = this.isMuted
    audio.src = streamUrl
    this.element = audio

    await new Promise<void>((resolve) => {
      let settled = false
      const finish = () => {
        if (settled) return
        settled = true
        resolve()
      }

      audio.addEventListener('playing', () => {
        if (isCurrent()) this.onStatusChange?.('playing')
        finish()
      })
      audio.addEventListener('error', () => {
        if (isCurrent()) this.onStatusChange?.('error')
        finish()
      })
      setTimeout(() => {
        if (isCurrent() && audio.paused) this.onStatusChange?.('error')
        finish()
      }, 10000)

      audio.play().catch(() => {
        if (isCurrent()) this.onStatusChange?.('error')
        finish()
      })
    })
  }

  private effectiveVolume() {
    return Math.max(0, Math.min(1, this.lastVolume * this.masterFactor))
  }

  setVolume(v: number) {
    this.lastVolume = v
    if (this.element) this.element.volume = this.effectiveVolume()
  }

  setMasterFactor(f: number) {
    this.masterFactor = f
    if (this.element) this.element.volume = this.effectiveVolume()
  }

  setMuted(muted: boolean) {
    this.isMuted = muted
    if (this.element) this.element.muted = muted
  }

  stop() {
    this.generation++
    if (this.element) {
      this.element.pause()
      this.element.src = ''
      this.element = null
    }
  }

  dispose() {
    this.stop()
  }
}

export class AudioEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private street: NoiseVoice | null = null
  private streetReal: RadioVoice | null = null
  private weather: NoiseVoice | null = null
  private radio: RadioVoice | null = null
  private mutedState = false
  private preMuteMaster = 0.8

  ensureContext() {
    if (this.ctx) return this.ctx
    const Ctx = window.AudioContext || (window as any).webkitAudioContext
    this.ctx = new Ctx()
    this.master = this.ctx.createGain()
    this.master.gain.value = this.preMuteMaster
    this.master.connect(this.ctx.destination)
    this.street = new NoiseVoice(this.ctx, this.master)
    this.streetReal = new RadioVoice()
    this.weather = new NoiseVoice(this.ctx, this.master)
    this.radio = new RadioVoice()
    const initialFactor = this.mutedState ? 0 : this.preMuteMaster
    this.streetReal.setMasterFactor(initialFactor)
    this.radio.setMasterFactor(initialFactor)
    return this.ctx
  }

  async resume() {
    const ctx = this.ensureContext()
    if (ctx.state === 'suspended') await ctx.resume()
  }

  setMasterVolume(v: number) {
    this.ensureContext()
    this.preMuteMaster = v
    if (!this.mutedState) {
      const now = this.ctx!.currentTime
      this.master!.gain.cancelScheduledValues(now)
      this.master!.gain.setTargetAtTime(v, now, 0.3)
      this.radio!.setMasterFactor(v)
      this.streetReal!.setMasterFactor(v)
    }
  }

  setMuted(muted: boolean) {
    this.ensureContext()
    this.mutedState = muted
    const now = this.ctx!.currentTime
    this.master!.gain.cancelScheduledValues(now)
    this.master!.gain.setTargetAtTime(muted ? 0 : this.preMuteMaster, now, 0.25)
    this.radio!.setMasterFactor(muted ? 0 : this.preMuteMaster)
    this.radio!.setMuted(muted)
    this.streetReal!.setMasterFactor(muted ? 0 : this.preMuteMaster)
    this.streetReal!.setMuted(muted)
  }

  /** `kindOrUrl` is either a synth preset id, or a real audio URL (detected by a leading "http") to loop instead. */
  setStreetAmbience(kindOrUrl: AmbienceKind, density?: StreetDensity) {
    this.ensureContext()
    if (kindOrUrl.startsWith('http')) {
      this.street!.stop()
      void this.streetReal!.play(kindOrUrl, true)
    } else {
      this.streetReal!.stop()
      this.street!.configure(kindOrUrl, density)
    }
  }

  setStreetVolume(v: number) {
    this.ensureContext()
    this.street!.setVolume(v)
    this.streetReal!.setVolume(v)
  }

  /** A real stop (not just volume to 0) — guarantees nothing keeps playing once the channel is switched off. */
  stopStreetAmbience() {
    this.street?.stop()
    this.streetReal?.stop()
  }

  setWeatherSound(kind: AmbienceKind) {
    this.ensureContext()
    this.weather!.configure(kind)
  }

  stopWeatherSound() {
    this.weather?.stop()
  }

  setWeatherVolume(v: number) {
    this.ensureContext()
    this.weather!.setVolume(v)
  }

  async playRadio(streamUrl: string, onStatus: (s: 'idle' | 'loading' | 'playing' | 'error') => void) {
    this.ensureContext()
    this.radio!.onStatusChange = onStatus
    await this.radio!.play(streamUrl)
  }

  stopRadio() {
    this.radio?.stop()
  }

  setRadioVolume(v: number) {
    this.ensureContext()
    this.radio!.setVolume(v)
  }

  dispose() {
    this.street?.dispose()
    this.streetReal?.dispose()
    this.weather?.dispose()
    this.radio?.dispose()
    this.master?.disconnect()
    this.ctx?.close()
    this.ctx = null
  }
}

export const audioEngine = new AudioEngine()
