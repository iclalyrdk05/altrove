import { pickCityFootage, getCityRainFootage, getCityNightFootage } from './cityFootage'
import type { SkyCondition } from '@/types'

export interface LocalFootage {
  src: string
  credit: string
}

/**
 * Real, licensed video clips bundled with the app (public/footage) — no
 * account or API key needed, unlike the Pexels path. Sourced from Wikimedia
 * Commons under CC0/CC-BY/CC-BY-SA; each clip's required attribution is
 * carried alongside it and shown in the Atmosphere view.
 */
const CLIPS = {
  rain: { src: '/footage/rain-night.webm', credit: 'slavikfi / Wikimedia Commons, CC0' },
  storm: { src: '/footage/storm.webm', credit: 'n0ssc (sterwing) / Wikimedia Commons, CC BY 3.0' },
  snow: { src: '/footage/snow.webm', credit: 'Cody Logan / Wikimedia Commons, CC BY 3.0' },
  fog: { src: '/footage/fog.webm', credit: 'Maximilian Schönherr / Wikimedia Commons, CC BY-SA 4.0' },
  cloudy: { src: '/footage/cloudy-day.webm', credit: 'Johann Mynhardt / Wikimedia Commons, CC BY 2.0' },
  sunnyDay: { src: '/footage/sunny-day.webm', credit: 'Johann Mynhardt / Wikimedia Commons, CC BY 2.0' },
  sunset: { src: '/footage/sunset.webm', credit: 'mockmoon2000 / Wikimedia Commons, CC BY 3.0' },
  clearNight: { src: '/footage/clear-night.webm', credit: '"Editor" / Wikimedia Commons, CC BY 3.0' },
} as const satisfies Record<string, LocalFootage>

export function getLocalFootage(
  neighborhoodId: string,
  condition: SkyCondition,
  isDay: boolean,
  daylightProgress: number | null,
  placeName?: string,
): LocalFootage {
  const goldenHour = daylightProgress !== null && (daylightProgress < 0.08 || daylightProgress > 0.88)

  // Real precipitation/visibility effects are generic by nature — a rain or
  // snow clip doesn't need to be "that city" to read as true. Everything
  // else (clear, sunny, cloudy, golden hour) is exactly where a generic
  // clip risks looking unmistakably wrong for the place, so prefer the
  // city-specific clip there whenever one exists.
  const isSkyCondition = condition !== 'storm' && condition !== 'rain' && condition !== 'snow' && condition !== 'fog'
  if (isSkyCondition) {
    const city = pickCityFootage(neighborhoodId, isDay, daylightProgress, placeName)
    if (city) return city
  }

  switch (condition) {
    case 'storm':
      return CLIPS.storm
    case 'rain':
      return (
        (!isDay ? getCityNightFootage(neighborhoodId, placeName) : undefined) ??
        getCityRainFootage(neighborhoodId, placeName) ??
        CLIPS.rain
      )
    case 'snow':
      return CLIPS.snow
    case 'fog':
      return CLIPS.fog
    case 'cloudy':
    case 'partly-cloudy':
      return CLIPS.cloudy
    default:
      if (goldenHour) return CLIPS.sunset
      return isDay ? CLIPS.sunnyDay : CLIPS.clearNight
  }
}
