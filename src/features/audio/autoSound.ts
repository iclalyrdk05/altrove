import { getRealStreetSound } from './realStreetSound'
import type { StreetDensity } from '@/providers/audioEngine'
import type { ActivityLevel, Neighborhood, SkyCondition } from '@/types'

/** How often street-level voice/car events should fire for a given activity level. */
export function streetDensityFromActivity(level: ActivityLevel): StreetDensity {
  switch (level) {
    case 'very-busy':
      return 'very-busy'
    case 'busy':
      return 'busy'
    case 'moderate':
      return 'moderate'
    case 'light':
      return 'light'
    case 'quiet':
    case 'unavailable':
    default:
      return 'quiet'
  }
}

/**
 * There is no user choice of ambience anymore — the street sound is simply
 * whatever the area's current activity level implies, so it matches what
 * the dock already says about the neighborhood instead of offering a menu.
 *
 * Where a real field recording of this exact city exists (currently Kadıköy
 * / Istanbul), it's used instead of the synthesized bed — the `id` returned
 * is a plain `http(s)` URL in that case, which the audio engine recognizes
 * and loops as real audio rather than treating as a synth preset name.
 */
export function autoStreetAmbience(level: ActivityLevel, neighborhood: Neighborhood): { id: string; label: string } {
  const isBusy = level === 'busy' || level === 'very-busy'
  const real = getRealStreetSound(neighborhood.id, isBusy)
  if (real) return { id: real.url, label: `${real.label} — ${real.credit}` }

  switch (level) {
    case 'very-busy':
      return { id: 'urban-street', label: 'Busy streets — traffic and crowds' }
    case 'busy':
      return { id: 'market', label: 'Busy streets — voices and vendors' }
    case 'moderate':
      return { id: neighborhood.defaultStreetAmbience, label: `${neighborhood.name} at a normal pace` }
    case 'light':
      return { id: 'quiet-neighborhood', label: 'Light activity — a quiet street' }
    case 'quiet':
    case 'unavailable':
    default:
      return { id: 'quiet-city', label: 'Quiet — distant voices, the odd car passing' }
  }
}

/**
 * Same idea for weather sound: it's just whatever the sky is actually
 * doing right now, derived from the real condition + day/night + rain
 * amount, not a picklist.
 */
export function autoWeatherSound(
  condition: SkyCondition,
  isDay: boolean,
  precipitationMm: number,
): { id: string; label: string } {
  switch (condition) {
    case 'storm':
      return { id: 'thunder', label: 'Thunder' }
    case 'rain':
      return precipitationMm >= 1.5 ? { id: 'heavy-rain', label: 'Heavy rain' } : { id: 'light-rain', label: 'Light rain' }
    case 'snow':
      return { id: 'snow', label: 'Snow' }
    case 'fog':
      return { id: 'wind', label: 'Still, foggy air' }
    case 'cloudy':
    case 'partly-cloudy':
      return { id: 'wind', label: 'A light breeze' }
    case 'sunny':
    case 'clear':
      return isDay ? { id: 'birds', label: 'Birdsong' } : { id: 'night', label: 'A quiet, clear night' }
    default:
      return { id: 'clear-outdoor', label: 'Open air' }
  }
}
