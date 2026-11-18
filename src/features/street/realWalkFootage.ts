import { r2Footage } from '@/utils/r2'
import { slugify } from '@/utils/slug'

export interface StreetFootage {
  src: string
  credit: string
  description: string
}

export interface StreetFootageVariants {
  /** Optional — a neighborhood with only e.g. a night clip falls through to Mapillary/Cesium/illustrated during the day instead of showing night footage at noon. */
  day?: StreetFootage
  night?: StreetFootage
  /** Shown during the early part of the day (roughly the first third of daylight) when this city's footage was actually filmed in the morning. */
  morning?: StreetFootage
}

/** How far into the daylight window (0 = sunrise, 1 = sunset) still counts as "morning". */
const MORNING_WINDOW = 0.35

/**
 * Real, eye-level street/walking video per neighborhood — the actual filmed
 * genre the user asked for (like the long silent "walking tour" videos on
 * YouTube), not a photo panorama or a 3D reconstruction. Sourced from
 * Wikimedia Commons under CC licenses, or filmed by the project author.
 *
 * Only neighborhoods with a genuine, specific match are listed here; the
 * rest fall through to Mapillary / the Cesium walkthrough / the illustrated
 * scene exactly as before — we don't fake a "this neighborhood" video with
 * unrelated footage.
 *
 * Shibuya is intentionally hot-linked to Wikimedia's own CDN rather than
 * bundled — the browser streams/buffers progressively, so a multi-GB source
 * is fine to reference directly without ever downloading it in full. The
 * other neighborhoods' clips are hosted on Cloudflare R2 (via r2Footage)
 * rather than bundled into the app, for the same reason (several hundred
 * MB each).
 */
export const STREET_WALK_FOOTAGE: Record<string, StreetFootageVariants> = {
  'kadikoy-istanbul': {
    day: {
      src: '/footage/street/kadikoy-street.webm',
      credit: 'Filmed by the project author',
      description: 'Kadıköy street level, filmed on site',
    },
    night: {
      src: r2Footage('istanbul-street-night'),
      credit: 'Filmed by the project author',
      description: 'Kadıköy street level at night, filmed on site',
    },
  },
  'greenwich-village-nyc': {
    day: {
      src: '/footage/street/greenwich-village.webm',
      credit: 'Filmed by the project author',
      description: 'Greenwich Village street level, filmed on site',
    },
  },
  'trastevere-rome': {
    day: {
      src: '/footage/street/trastevere-street.webm',
      credit: 'Filmed by the project author',
      description: 'Trastevere street level, filmed on site',
    },
  },
  'shibuya-tokyo': {
    day: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Shibuya_Crossing%2C_Tokyo%2C_Japan_%28video%29.webm',
      credit: 'Basile Morin / Wikimedia Commons, CC BY-SA 4.0',
      description: 'Shibuya Crossing at street level',
    },
  },
  'kreuzberg-berlin': {
    day: {
      src: r2Footage('berlin-street-1'),
      credit: 'Filmed by the project author',
      description: 'Kreuzberg street level, filmed on site',
    },
  },
  'jordaan-amsterdam': {
    day: {
      src: r2Footage('amsterdam-street-1'),
      credit: 'Filmed by the project author',
      description: 'Jordaan street level, filmed on site',
    },
    morning: {
      src: r2Footage('amsterdam-street-morning'),
      credit: 'Filmed by the project author',
      description: 'Jordaan street level in the morning, filmed on site',
    },
  },
  'cihangir-istanbul': {
    day: {
      src: r2Footage('cihangir-street'),
      credit: 'Filmed by the project author',
      description: 'Cihangir street level, filmed on site',
    },
  },
  'uskudar-istanbul': {
    day: {
      src: r2Footage('uskudar-street'),
      credit: 'Filmed by the project author',
      description: 'Üsküdar street level, filmed on site',
    },
  },
  // Not a curated neighborhood — matched by place name, see getStreetWalkFootage's placeName fallback.
  paris: {
    night: {
      src: r2Footage('paris-street-night'),
      credit: 'Filmed by the project author',
      description: 'Paris street level at night, filmed on site',
    },
  },
}

export function getStreetWalkFootage(
  neighborhoodId: string,
  isDay: boolean,
  daylightProgress: number | null,
  placeName?: string,
): StreetFootage | undefined {
  const variants = STREET_WALK_FOOTAGE[neighborhoodId] ?? (placeName ? STREET_WALK_FOOTAGE[slugify(placeName)] : undefined)
  if (!variants) return undefined
  if (!isDay && variants.night) return variants.night
  if (isDay && daylightProgress !== null && daylightProgress < MORNING_WINDOW && variants.morning) return variants.morning
  return variants.day
}
