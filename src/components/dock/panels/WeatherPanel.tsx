import { Droplets, Wind, Gauge, Eye, Sunrise, Sunset, Navigation } from 'lucide-react'
import { conditionIcon } from '@/features/weather/icon'
import { formatTemperature, formatWind, windDirectionLabel } from '@/utils/units'
import { formatTimeShort } from '@/utils/time'
import { useUserStore } from '@/stores/userStore'
import type { Neighborhood, WeatherData } from '@/types'

interface WeatherPanelProps {
  neighborhood: Neighborhood
  weather: WeatherData | null
  loading: boolean
  error: string | null
}

export function WeatherPanel({ neighborhood, weather, loading, error }: WeatherPanelProps) {
  const preferences = useUserStore((s) => s.preferences)

  if (error && !weather) {
    return (
      <div className="w-[320px] p-5 text-center">
        <p className="text-[13px] text-white/60">Weather temporarily unavailable.</p>
        <p className="mt-1 text-[11px] text-white/35">{error}</p>
      </div>
    )
  }

  if (loading && !weather) {
    return (
      <div className="w-[320px] p-5 text-center text-[13px] text-white/50">Loading weather for {neighborhood.name}…</div>
    )
  }

  if (!weather) return null

  const maxPrecip = Math.max(1, ...weather.hourly.map((h) => h.precipitationProbability))

  return (
    <div className="w-[340px] p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12px] font-medium tracking-[0.04em] text-white/45">Weather</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-[40px] font-semibold leading-none text-white">
              {formatTemperature(weather.temperatureC, preferences.temperatureUnit)}
            </span>
          </div>
          <p className="text-[13px] text-white/60">{weather.conditionLabel}</p>
          <p className="text-[11px] text-white/35">
            Feels like {formatTemperature(weather.apparentTemperatureC, preferences.temperatureUnit)}
          </p>
        </div>
        <div className="text-olive">{conditionIcon(weather.condition, weather.isDay, 36)}</div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <Stat icon={<Droplets size={14} />} label="Humidity" value={`${weather.humidity}%`} />
        <Stat
          icon={<Wind size={14} />}
          label="Wind"
          value={`${formatWind(weather.windSpeedKmh, preferences.windUnit)}`}
          sub={windDirectionLabel(weather.windDirectionDeg)}
        />
        <Stat icon={<Gauge size={14} />} label="Pressure" value={`${Math.round(weather.pressureHpa)} hPa`} />
        <Stat
          icon={<Eye size={14} />}
          label="Visibility"
          value={weather.visibilityKm !== null ? `${weather.visibilityKm.toFixed(1)} km` : 'N/A'}
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-[12px] text-white/60">
        <div className="flex items-center gap-1.5">
          <Sunrise size={13} className="text-olive" />
          {weather.sunrise ? formatTimeShort(new Date(weather.sunrise), neighborhood.timezone) : '—'}
        </div>
        <div className="flex items-center gap-1.5">
          <Navigation size={13} style={{ transform: `rotate(${weather.windDirectionDeg}deg)` }} className="text-white/40" />
          {Math.round(weather.windDirectionDeg)}°
        </div>
        <div className="flex items-center gap-1.5">
          <Sunset size={13} className="text-rose" />
          {weather.sunset ? formatTimeShort(new Date(weather.sunset), neighborhood.timezone) : '—'}
        </div>
      </div>

      {weather.hourly.length > 0 && (
        <div className="mt-4">
          <p className="mb-1.5 text-[11px] font-medium tracking-[0.03em] text-white/35">Next hours</p>
          <div className="flex items-end gap-2.5">
            {weather.hourly.slice(0, 6).map((h) => (
              <div key={h.time} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex h-10 w-full items-end justify-center">
                  <div
                    className="w-1.5 rounded-full bg-blush/70"
                    style={{ height: `${Math.max(8, (h.precipitationProbability / maxPrecip) * 36)}px` }}
                  />
                </div>
                <span className="text-[10px] text-white/45">
                  {new Intl.DateTimeFormat('en-US', { hour: 'numeric', timeZone: neighborhood.timezone }).format(new Date(h.time))}
                </span>
                <span className="text-[11px] font-medium text-white/70">{Math.round(h.temperatureC)}°</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-white/5 px-2.5 py-2">
      <span className="text-white/45">{icon}</span>
      <div className="leading-tight">
        <p className="text-[10px] text-white/40">{label}</p>
        <p className="text-[13px] font-medium text-white/85">
          {value} {sub && <span className="text-white/40">{sub}</span>}
        </p>
      </div>
    </div>
  )
}
