import type { ActivityInfo, ActivityLevel } from '@/types'

const LEVELS: ActivityLevel[] = ['quiet', 'light', 'moderate', 'busy', 'very-busy']

/**
 * No live crowd-density provider is connected in this build, so activity is
 * deterministically simulated from local hour-of-day + a per-neighborhood seed.
 * This is clearly surfaced to the user as simulated, per spec §10.3 — it is
 * not derived from weather and does not pretend to be a live feed.
 */
export function simulateActivity(neighborhoodId: string, localHour: number): ActivityInfo {
  let seed = 0
  for (let i = 0; i < neighborhoodId.length; i++) seed = (seed * 31 + neighborhoodId.charCodeAt(i)) % 997

  // base curve: quiet overnight, rising through the day, peak early evening
  const curve = [0, 0, 0, 0, 0, 1, 1, 2, 2, 2, 2, 3, 3, 2, 2, 2, 3, 4, 4, 3, 2, 1, 1, 0]
  const base = curve[localHour % 24]
  const variance = seed % 3 === 0 ? 1 : 0
  const index = Math.max(0, Math.min(LEVELS.length - 1, base + variance - (seed % 2)))

  const prevIndex = Math.max(0, Math.min(LEVELS.length - 1, curve[(localHour + 23) % 24] + variance))
  const trend = index > prevIndex ? 'rising' : index < prevIndex ? 'falling' : 'steady'

  return {
    level: LEVELS[index],
    trend,
    source: 'Simulated for demonstration',
    updatedAt: new Date().toISOString(),
    isSimulated: true,
  }
}
