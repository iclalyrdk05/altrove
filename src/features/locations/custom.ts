import type { GeocodeResult } from '@/providers/weather'
import { STREET_AMBIENCE_LIBRARY } from './data'
import type { Neighborhood } from '@/types'

/** Builds a working Neighborhood record for a place found via search that isn't in the curated set. */
export function neighborhoodFromGeocode(result: GeocodeResult): Neighborhood {
  const hue = Math.abs(Math.round((result.lat * 7 + result.lon * 13) % 360))
  return {
    id: `geo-${result.id}`,
    name: result.name,
    city: result.admin1 ?? result.name,
    country: result.country,
    lat: result.lat,
    lon: result.lon,
    timezone: result.timezone || 'UTC',
    blurb: `A place at ${result.lat.toFixed(2)}, ${result.lon.toFixed(2)} — street imagery and local radio may be limited here.`,
    hue,
    radioStations: [],
    streetAmbience: STREET_AMBIENCE_LIBRARY,
    defaultStreetAmbience: 'quiet-neighborhood',
  }
}
