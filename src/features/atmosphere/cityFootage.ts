import type { LocalFootage } from './localFootage'
import { r2Footage } from '@/utils/r2'

export interface CityFootageVariants {
  /** Used whenever no closer night/sunset/morning/rain match applies. Optional: a city with only e.g. a night clip falls through to the generic/local footage the rest of the day instead of showing night footage at noon. */
  default?: LocalFootage
  night?: LocalFootage
  sunset?: LocalFootage
  /** Shown during the early part of the day (roughly the first third of daylight) when this city's footage was actually filmed in the morning. */
  morning?: LocalFootage
  /** Shown instead of the generic rain clip when this city's own footage was actually filmed in rain. */
  rain?: LocalFootage
}

/** How far into the daylight window (0 = sunrise, 1 = sunset) still counts as "morning". */
const MORNING_WINDOW = 0.35

/**
 * City-specific real footage — used instead of the generic condition clip
 * whenever the sky itself isn't the story (no rain/snow/storm/fog). Keeps
 * Atmosphere from showing something unmistakably wrong for the place, like
 * mountains standing in for New York.
 *
 * Only listed where a strong, clearly-recognizable, properly licensed match
 * was actually found — neighborhoods not listed here keep the generic
 * condition-based clip rather than a forced, unconvincing "close enough" one.
 */
export const CITY_FOOTAGE: Record<string, CityFootageVariants> = {
  'kadikoy-istanbul': {
    default: { src: '/footage/kadikoy-ambiance.webm', credit: 'Filmed by the project author' },
    sunset: { src: r2Footage('istanbul-ambiance-clear-sunset'), credit: 'Filmed by the project author' },
    night: { src: r2Footage('istanbul-kadikoy-ambiance-night'), credit: 'Filmed by the project author' },
  },
  'greenwich-village-nyc': {
    default: { src: r2Footage('greenwich-ambiance-morning'), credit: 'Filmed by the project author' },
    rain: { src: '/footage/greenwich-ambiance.webm', credit: 'Filmed by the project author' },
  },
  'trastevere-rome': {
    default: { src: '/footage/trastevere-ambiance.webm', credit: 'Filmed by the project author' },
  },
  'uskudar-istanbul': {
    default: { src: r2Footage('istanbul-bogaz-ambiance'), credit: 'Filmed by the project author' },
  },
  'upper-west-side-nyc': {
    default: { src: r2Footage('upper-west-side-ambiance-morning'), credit: 'Filmed by the project author' },
  },
  'jordaan-amsterdam': {
    // No separate plain-daytime clip was filmed — the morning footage doubles
    // as the default for the rest of the day too, same as Greenwich/UWS above.
    default: { src: r2Footage('amsterdam-ambiance-morning'), credit: 'Filmed by the project author' },
    morning: { src: r2Footage('amsterdam-ambiance-morning'), credit: 'Filmed by the project author' },
    night: { src: r2Footage('amsterdam-ambiance-night'), credit: 'Filmed by the project author' },
  },
  'cihangir-istanbul': {
    // Only night footage was filmed here — daytime falls through to the
    // generic/local Atmosphere fallback instead of showing night footage at noon.
    night: { src: r2Footage('istanbul-cihangir-ambiance-night'), credit: 'Filmed by the project author' },
  },
}

/** Picks the closest-matching variant for this neighborhood, or undefined if it has no curated footage at all. */
export function pickCityFootage(
  neighborhoodId: string,
  isDay: boolean,
  daylightProgress: number | null,
): LocalFootage | undefined {
  const city = CITY_FOOTAGE[neighborhoodId]
  if (!city) return undefined
  if (!isDay && city.night) return city.night
  const goldenHour = daylightProgress !== null && (daylightProgress < 0.08 || daylightProgress > 0.88)
  if (goldenHour && city.sunset) return city.sunset
  if (isDay && daylightProgress !== null && daylightProgress < MORNING_WINDOW && city.morning) return city.morning
  return city.default
}

/** The city's own rain footage, if it has one — used instead of the generic rain clip. */
export function getCityRainFootage(neighborhoodId: string): LocalFootage | undefined {
  return CITY_FOOTAGE[neighborhoodId]?.rain
}

/**
 * The city's own real night footage, if it has one. At night, this takes
 * priority over the generic rain clip (unlike daytime rain, a quiet night
 * ambiance clip still reads as true during light rain) — so a neighborhood
 * with no dedicated rain clip doesn't fall back to a generic, unrecognizable
 * rainy city at night.
 */
export function getCityNightFootage(neighborhoodId: string): LocalFootage | undefined {
  return CITY_FOOTAGE[neighborhoodId]?.night
}
