import { useEffect } from 'react'
import { Radio, Users as StreetIcon, CloudRain, Volume2, VolumeX } from 'lucide-react'
import { useAudioStore } from '@/stores/audioStore'
import { autoStreetAmbience, autoWeatherSound, streetDensityFromActivity } from '@/features/audio/autoSound'
import { clsx } from '@/utils/clsx'
import { isIOS } from '@/utils/platform'
import type { ActivityLevel, Neighborhood, WeatherData } from '@/types'

interface SoundPanelProps {
  neighborhood: Neighborhood
  weather: WeatherData | null
  activityLevel: ActivityLevel
}

const onIOS = isIOS()

export function SoundPanel({ neighborhood, weather, activityLevel }: SoundPanelProps) {
  const audio = useAudioStore()

  const street = autoStreetAmbience(activityLevel, neighborhood)
  const streetDensity = streetDensityFromActivity(activityLevel)
  const weatherSound = weather
    ? autoWeatherSound(weather.condition, weather.isDay, weather.precipitationMm)
    : { id: 'clear-outdoor', label: 'Waiting on weather…' }

  // Live-update the sound while it's already playing if the underlying
  // activity/weather changes — there's no manual picker to do this instead.
  // neighborhood.id is included even though street.id usually changes with
  // it too: several activity levels (busy/light/quiet) map to a generic id
  // that's the same across neighborhoods with no real recording, so relying
  // on street.id alone could silently miss a neighborhood switch and leave
  // the previous city's ambience looping.
  useEffect(() => {
    if (audio.street.on) audio.setStreetAmbience(street.id, streetDensity)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [street.id, streetDensity, neighborhood.id])

  useEffect(() => {
    if (audio.weather.on) audio.setWeatherSound(weatherSound.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weatherSound.id])

  // Radio has no activity/weather input to react to — it's tied directly to
  // the neighborhood, so it needs its own effect to follow a neighborhood
  // switch instead of leaving the previous city's station playing.
  useEffect(() => {
    if (!audio.radio.on) return
    const station = neighborhood.radioStations[0]
    if (station) {
      void audio.setRadioStation(station.id, station.streamUrl)
    } else {
      // Nowhere to switch to — stop rather than keep playing the previous neighborhood's station.
      audio.toggleRadio(undefined)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [neighborhood.id])

  return (
    <div className="w-[340px] p-5">
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-medium tracking-[0.04em] text-white/45">Sound</p>
        <button
          onClick={() => audio.toggleMuteAll()}
          className={clsx(
            'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] transition-colors',
            audio.muted ? 'bg-wine/30 text-rose' : 'bg-white/8 text-white/55 hover:bg-white/15',
          )}
        >
          {audio.muted ? <VolumeX size={12} /> : <Volume2 size={12} />}
          {audio.muted ? 'Muted' : 'Mute All'}
        </button>
      </div>

      <div className="mt-3 space-y-3">
        {/* Radio */}
        <ChannelBlock
          icon={<Radio size={15} />}
          title="Local Radio"
          description={neighborhood.radioStations[0]?.name ?? 'No station configured here'}
          on={audio.radio.on}
          volume={audio.radio.volume}
          status={audio.radio.status}
          disabled={neighborhood.radioStations.length === 0}
          onToggle={() => audio.toggleRadio(neighborhood.radioStations[0]?.streamUrl)}
          onVolume={(v) => audio.setRadioVolume(v)}
          note={onIOS ? 'On iOS, use your device’s volume buttons to adjust this' : undefined}
        />

        {/* Street sounds — automatically whatever matches current activity, no picker */}
        <ChannelBlock
          icon={<StreetIcon size={15} />}
          title="Street Sounds"
          description={street.label}
          on={audio.street.on}
          volume={audio.street.volume}
          status={audio.street.status === 'playing' ? 'playing' : 'idle'}
          onToggle={() => audio.toggleStreet(street.id, streetDensity)}
          onVolume={(v) => audio.setStreetVolume(v)}
        />

        {/* Weather sounds — automatically whatever the sky is doing, no picker */}
        <ChannelBlock
          icon={<CloudRain size={15} />}
          title="Weather Sounds"
          description={weatherSound.label}
          on={audio.weather.on}
          volume={audio.weather.volume}
          status={audio.weather.status === 'playing' ? 'playing' : 'idle'}
          onToggle={() => audio.toggleWeatherSound(weatherSound.id)}
          onVolume={(v) => audio.setWeatherVolume(v)}
        />
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-[11px] text-white/45">
          <span>Master Volume</span>
          <span>{Math.round(audio.masterVolume * 100)}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={audio.masterVolume}
          onChange={(e) => audio.setMasterVolume(Number(e.target.value))}
          className="mt-1.5 w-full accent-white"
        />
      </div>
    </div>
  )
}

function ChannelBlock({
  icon,
  title,
  description,
  on,
  volume,
  status,
  disabled,
  onToggle,
  onVolume,
  note,
}: {
  icon: React.ReactNode
  title: string
  description: string
  on: boolean
  volume: number
  status: string
  disabled?: boolean
  onToggle: () => void
  onVolume: (v: number) => void
  /** Shown instead of a working slider when the volume control genuinely can't do anything on this platform (e.g. iOS ignoring `.volume` on a real `<audio>` element). */
  note?: string
}) {
  return (
    <div className="rounded-2xl bg-white/5 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white/80">
          {icon}
          <div>
            <p className="text-[13px] font-medium">{title}</p>
            <p className="text-[11px] text-white/40">
              {status === 'loading' ? 'loading…' : status === 'error' ? 'unavailable' : description}
            </p>
          </div>
        </div>
        <button
          onClick={onToggle}
          disabled={disabled}
          className={clsx(
            'h-5 w-9 shrink-0 rounded-full p-0.5 transition-colors disabled:opacity-30',
            on ? 'bg-rose/80' : 'bg-white/15',
          )}
          aria-pressed={on}
          aria-label={`Toggle ${title}`}
        >
          <span className={clsx('block h-4 w-4 rounded-full bg-white transition-transform', on && 'translate-x-4')} />
        </button>
      </div>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={volume}
        onChange={(e) => onVolume(Number(e.target.value))}
        disabled={!on || Boolean(note)}
        className="mt-2.5 w-full accent-white disabled:opacity-30"
      />
      {note && <p className="mt-1.5 text-[10.5px] leading-snug text-white/35">{note}</p>}
    </div>
  )
}
