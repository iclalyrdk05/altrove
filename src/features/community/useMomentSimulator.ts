import { useEffect, useRef } from 'react'
import { useCommunityStore } from '@/stores/communityStore'
import { useLocationStore } from '@/stores/locationStore'
import { SIMULATED_MOMENT_POOL } from './simulatedMoments'

const MIN_DELAY_MS = 40_000
const MAX_DELAY_MS = 100_000

/**
 * Drip-feeds one simulated Moment at a time into the currently-open
 * neighborhood, at a randomized interval — this is what makes the Moments
 * feed feel like an ambient, living stream instead of static seed data.
 * Resets its pool of unused flavor posts whenever the neighborhood changes.
 */
export function useMomentSimulator() {
  const neighborhoodId = useLocationStore((s) => s.current.id)
  const addMoment = useCommunityStore((s) => s.addMoment)
  const usedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    // Seed moments are inserted as `seed-<neighborhoodId>-<poolId>` (see
    // data.ts) — treat those pool ids as already-used so the first drips
    // after opening a neighborhood are genuinely new, not an instant repeat
    // of what's already on screen.
    const seedPrefix = `seed-${neighborhoodId}-`
    usedRef.current = new Set(
      useCommunityStore
        .getState()
        .moments.filter((m) => m.neighborhoodId === neighborhoodId && m.id.startsWith(seedPrefix))
        .map((m) => m.id.slice(seedPrefix.length)),
    )
    let timeoutId: ReturnType<typeof setTimeout>

    function scheduleNext() {
      const delay = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS)
      timeoutId = setTimeout(() => {
        const pool = SIMULATED_MOMENT_POOL[neighborhoodId]
        if (pool && pool.length > 0) {
          const unused = pool.filter((p) => !usedRef.current.has(p.id))
          if (unused.length === 0) usedRef.current.clear()
          const candidates = unused.length > 0 ? unused : pool
          const pick = candidates[Math.floor(Math.random() * candidates.length)]
          usedRef.current.add(pick.id)
          addMoment({
            neighborhoodId,
            authorId: pick.authorId,
            authorName: pick.authorName,
            authorAvatar: pick.authorAvatar,
            note: pick.note,
            tag: pick.tag,
            imageUrl: pick.imageUrl,
            audioUrl: pick.audioUrl,
            visibility: 'public',
          })
        }
        scheduleNext()
      }, delay)
    }

    scheduleNext()
    return () => clearTimeout(timeoutId)
  }, [neighborhoodId, addMoment])
}
