import { create } from 'zustand'
import { audioEngine, type StreetDensity } from '@/providers/audioEngine'
import type { AmbienceChannelState, RadioChannelState } from '@/types'

/** How far radio/street/weather duck while a Moment's own voice/audio is playing. */
const DUCK_FACTOR = 0.12

interface AudioState {
  unlocked: boolean
  masterVolume: number
  muted: boolean
  radio: RadioChannelState
  street: AmbienceChannelState
  weather: AmbienceChannelState
  /** Count of currently-playing Moment audio clips — ambient channels duck while this is > 0. */
  duckCount: number
  /**
   * Last stream URL actually handed to the engine for the current radio
   * station, and last density actually handed to the engine for the current
   * street ambience — tracked separately from `radio.stationId`/`street.optionId`
   * because those can be reused across neighborhoods (see setRadioStation's
   * `?? 'default'` fallback), so only these reflect what's truly already
   * playing. Used to skip a redundant restart when SoundPanel remounts (it's
   * conditionally rendered) and re-applies the same values it already set.
   */
  _radioStreamUrl: string | null
  _streetDensity: StreetDensity | undefined

  unlock: () => Promise<void>
  setMasterVolume: (v: number) => void
  toggleMuteAll: () => void
  /** Call when a Moment's voice/audio starts playing; pair with releaseDuck when it stops. Safe to call from multiple overlapping clips. */
  requestDuck: () => void
  releaseDuck: () => void

  setRadioStation: (stationId: string, streamUrl: string) => Promise<void>
  toggleRadio: (streamUrl: string | undefined) => void
  setRadioVolume: (v: number) => void

  setStreetAmbience: (optionId: string, density?: StreetDensity) => void
  toggleStreet: (defaultOption: string, density?: StreetDensity) => void
  setStreetVolume: (v: number) => void

  setWeatherSound: (optionId: string) => void
  toggleWeatherSound: (defaultOption: string) => void
  setWeatherVolume: (v: number) => void
}

export const useAudioStore = create<AudioState>((set, get) => ({
  unlocked: false,
  masterVolume: 0.8,
  muted: false,
  radio: { on: false, volume: 0.7, stationId: null, status: 'idle' },
  street: { on: false, volume: 0.5, optionId: null, status: 'idle' },
  weather: { on: false, volume: 0.5, optionId: null, status: 'idle' },
  duckCount: 0,
  _radioStreamUrl: null,
  _streetDensity: undefined,

  requestDuck: () => {
    const next = get().duckCount + 1
    set({ duckCount: next })
    if (next !== 1) return
    // First overlapping clip to start — pull the ambient channels down
    // without touching the stored slider volumes, so they snap back to
    // exactly where the user left them once every clip has stopped.
    const { radio, street, weather } = get()
    if (radio.on) audioEngine.setRadioVolume(radio.volume * DUCK_FACTOR)
    if (street.on) audioEngine.setStreetVolume(street.volume * DUCK_FACTOR)
    if (weather.on) audioEngine.setWeatherVolume(weather.volume * DUCK_FACTOR)
  },

  releaseDuck: () => {
    const next = Math.max(0, get().duckCount - 1)
    set({ duckCount: next })
    if (next !== 0) return
    const { radio, street, weather } = get()
    if (radio.on) audioEngine.setRadioVolume(radio.volume)
    if (street.on) audioEngine.setStreetVolume(street.volume)
    if (weather.on) audioEngine.setWeatherVolume(weather.volume)
  },

  unlock: async () => {
    await audioEngine.resume()
    audioEngine.setMasterVolume(get().masterVolume)
    set({ unlocked: true })
  },

  setMasterVolume: (v) => {
    audioEngine.setMasterVolume(v)
    set({ masterVolume: v, muted: false })
  },

  toggleMuteAll: () => {
    const muted = !get().muted
    audioEngine.setMuted(muted)
    set({ muted })
  },

  setRadioStation: async (stationId, streamUrl) => {
    const current = get()
    // Already playing exactly this stream (e.g. SoundPanel remounted and
    // re-ran its sync effect without the neighborhood actually changing) —
    // skip the reconnect, which would otherwise cause an audible restart.
    if (current.radio.status === 'playing' && current._radioStreamUrl === streamUrl) return
    set((s) => ({ radio: { ...s.radio, stationId, status: 'loading' } }))
    await audioEngine.playRadio(streamUrl, (status) => set((s) => ({ radio: { ...s.radio, status } })))
    audioEngine.setRadioVolume(get().radio.on ? get().radio.volume : 0)
    set((s) => ({ radio: { ...s.radio, on: true }, _radioStreamUrl: streamUrl }))
  },

  toggleRadio: (streamUrl) => {
    const radio = get().radio
    const on = !radio.on
    if (on && streamUrl) {
      audioEngine.setRadioVolume(radio.volume)
      void get().setRadioStation(radio.stationId ?? 'default', streamUrl)
    } else {
      // A real stop, not just a volume fade — guarantees nothing keeps
      // playing in the background once the channel is switched off.
      audioEngine.stopRadio()
      set((s) => ({ radio: { ...s.radio, status: 'idle' } }))
    }
    set((s) => ({ radio: { ...s.radio, on } }))
  },

  setRadioVolume: (v) => {
    audioEngine.setRadioVolume(get().radio.on ? v : 0)
    set((s) => ({ radio: { ...s.radio, volume: v } }))
  },

  setStreetAmbience: (optionId, density) => {
    const current = get()
    // Already playing exactly this — skip the reconnect (see setRadioStation).
    if (current.street.status === 'playing' && current.street.optionId === optionId && current._streetDensity === density) {
      return
    }
    audioEngine.setStreetAmbience(optionId, density)
    audioEngine.setStreetVolume(get().street.on ? get().street.volume : 0)
    set((s) => ({ street: { ...s.street, optionId, status: 'playing' }, _streetDensity: density }))
  },

  toggleStreet: (defaultOption, density) => {
    const street = get().street
    const on = !street.on
    if (on) {
      audioEngine.setStreetAmbience(defaultOption, density)
      audioEngine.setStreetVolume(street.volume)
      set((s) => ({ street: { ...s.street, on, optionId: defaultOption, status: 'playing' }, _streetDensity: density }))
    } else {
      // A real stop, not just a volume fade — guarantees nothing keeps
      // playing in the background once the channel is switched off.
      audioEngine.stopStreetAmbience()
      set((s) => ({ street: { ...s.street, on, status: 'idle' } }))
    }
  },

  setStreetVolume: (v) => {
    audioEngine.setStreetVolume(get().street.on ? v : 0)
    set((s) => ({ street: { ...s.street, volume: v } }))
  },

  setWeatherSound: (optionId) => {
    const current = get().weather
    // Already playing exactly this — skip the reconnect (see setRadioStation).
    if (current.status === 'playing' && current.optionId === optionId) return
    audioEngine.setWeatherSound(optionId)
    audioEngine.setWeatherVolume(get().weather.on ? get().weather.volume : 0)
    set((s) => ({ weather: { ...s.weather, optionId, status: 'playing' } }))
  },

  toggleWeatherSound: (defaultOption) => {
    const weather = get().weather
    const on = !weather.on
    if (on) {
      audioEngine.setWeatherSound(defaultOption)
      audioEngine.setWeatherVolume(weather.volume)
      set((s) => ({ weather: { ...s.weather, on, optionId: defaultOption, status: 'playing' } }))
    } else {
      // A real stop, not just a volume fade.
      audioEngine.stopWeatherSound()
      set((s) => ({ weather: { ...s.weather, on, status: 'idle' } }))
    }
  },

  setWeatherVolume: (v) => {
    audioEngine.setWeatherVolume(get().weather.on ? v : 0)
    set((s) => ({ weather: { ...s.weather, volume: v } }))
  },
}))
