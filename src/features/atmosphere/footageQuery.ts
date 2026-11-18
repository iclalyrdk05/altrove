import type { SkyCondition } from '@/types'

/**
 * Builds an ordered list of search queries for real stock footage matching
 * the current condition + time of day — most specific (city-flavored) first,
 * falling back to a generic version so a lesser-known city still finds
 * something. The caller tries each in turn until one returns a result.
 */
export function buildFootageQueries(
  condition: SkyCondition,
  isDay: boolean,
  daylightProgress: number | null,
  cityName: string,
): string[] {
  const goldenHour = daylightProgress !== null && (daylightProgress < 0.08 || daylightProgress > 0.88)

  let generic: string
  if (condition === 'storm') {
    generic = 'thunderstorm lightning sky'
  } else if (condition === 'rain') {
    generic = isDay ? 'rain window city street' : 'rain night city street'
  } else if (condition === 'snow') {
    generic = 'snow falling city street'
  } else if (condition === 'fog') {
    generic = 'foggy city morning'
  } else if (condition === 'cloudy' || condition === 'partly-cloudy') {
    generic = 'overcast sky city rooftop'
  } else if (goldenHour) {
    generic = isDay ? 'sunrise city skyline' : 'sunset city skyline'
  } else if (isDay) {
    generic = 'sunny city rooftop view'
  } else {
    generic = 'night city skyline lights'
  }

  return [`${cityName} ${generic}`, generic]
}
