import type { LocalFootage } from './localFootage'
import { r2Footage } from '@/utils/r2'
import { slugify } from '@/utils/slug'

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
 *
 * Keyed either by a curated neighborhood id (e.g. 'jordaan-amsterdam', as
 * listed in locations/data.ts) or by a plain slugified place name (e.g.
 * 'paris'). The latter lets footage for a place the user merely searched
 * for — never added to the curated NEIGHBORHOODS list — still be picked up
 * automatically, matched by `pickCityFootage`'s `placeName` fallback below.
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
  // Not a curated neighborhood (not in locations/data.ts) — matched by
  // place name instead, so searching "Paris" picks this up automatically.
  // See lookupCityFootage's placeName fallback below.
  paris: {
    default: { src: r2Footage('paris-ambiance'), credit: 'Filmed by the project author' },
  },
}

/** Looks up curated footage by curated id first, falling back to a slugified place name (for searched, non-curated places). */
function lookupCityFootage(neighborhoodId: string, placeName?: string): CityFootageVariants | undefined {
  return CITY_FOOTAGE[neighborhoodId] ?? (placeName ? CITY_FOOTAGE[slugify(placeName)] : undefined)
}

/** Picks the closest-matching variant for this neighborhood, or undefined if it has no curated footage at all. */
export function pickCityFootage(
  neighborhoodId: string,
  isDay: boolean,
  daylightProgress: number | null,
  placeName?: string,
): LocalFootage | undefined {
  const city = lookupCityFootage(neighborhoodId, placeName)
  if (!city) return undefined
  if (!isDay && city.night) return city.night
  const goldenHour = daylightProgress !== null && (daylightProgress < 0.08 || daylightProgress > 0.88)
  if (goldenHour && city.sunset) return city.sunset
  if (isDay && daylightProgress !== null && daylightProgress < MORNING_WINDOW && city.morning) return city.morning
  return city.default
}

/** The city's own rain footage, if it has one — used instead of the generic rain clip. */
export function getCityRainFootage(neighborhoodId: string, placeName?: string): LocalFootage | undefined {
  return lookupCityFootage(neighborhoodId, placeName)?.rain
}

/**
 * The city's own real night footage, if it has one. At night, this takes
 * priority over the generic rain clip (unlike daytime rain, a quiet night
 * ambiance clip still reads as true during light rain) — so a neighborhood
 * with no dedicated rain clip doesn't fall back to a generic, unrecognizable
 * rainy city at night.
 */
export function getCityNightFootage(neighborhoodId: string, placeName?: string): LocalFootage | undefined {
  return lookupCityFootage(neighborhoodId, placeName)?.night
}

/**
 * The city's own baseline/default clip, if it has one — the last-resort
 * real-footage fallback during storm/snow/fog (or rain, below any more
 * specific variant), so a city with real footage but no dedicated clip for
 * the current condition still shows ITS OWN footage (with the weather
 * particle overlay layered on top, same as any other Atmosphere footage)
 * rather than an unrelated generic city.
 */
export function getCityDefaultFootage(neighborhoodId: string, placeName?: string): LocalFootage | undefined {
  return lookupCityFootage(neighborhoodId, placeName)?.default
}
