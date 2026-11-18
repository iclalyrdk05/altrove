import { create } from 'zustand'
import { DEMO_MOMENTS } from '@/features/community/data'
import type { Moment } from '@/types'

/** Moments expire after this long, Instagram-Stories-style — applies to seed and simulated content alike. */
export const MOMENT_LIFETIME_MS = 24 * 60 * 60 * 1000

export function isMomentActive(moment: Moment, now = Date.now()): boolean {
  return now - new Date(moment.createdAt).getTime() < MOMENT_LIFETIME_MS
}

interface CommunityState {
  moments: Moment[]
  latestMomentId: string | null
  lastSeenMomentId: string | null
  /** Per-moment "viewed on the map" tracking — distinct from lastSeenMomentId, which only gates the dock's unread dot. */
  seenMomentIds: Record<string, true>

  addMoment: (m: Omit<Moment, 'id' | 'createdAt' | 'isDemo'>) => void
  momentsFor: (neighborhoodId: string) => Moment[]
  markSeen: (neighborhoodId: string) => void
  markMomentSeen: (id: string) => void
}

export const useCommunityStore = create<CommunityState>((set, get) => ({
  moments: DEMO_MOMENTS,
  latestMomentId: null,
  lastSeenMomentId: DEMO_MOMENTS[0]?.id ?? null,
  seenMomentIds: {},

  addMoment: (m) => {
    const id = `local-${Date.now()}`
    set((state) => ({
      // Prune anything already expired while we're touching the array, so it
      // doesn't grow forever and the "newest first" ordering stays meaningful.
      moments: [{ ...m, id, createdAt: new Date().toISOString(), isDemo: true }, ...state.moments.filter((existing) => isMomentActive(existing))],
      latestMomentId: id,
    }))
  },
  momentsFor: (neighborhoodId) => get().moments.filter((m) => m.neighborhoodId === neighborhoodId && isMomentActive(m)),
  markSeen: (neighborhoodId) => {
    const top = get().moments.find((m) => m.neighborhoodId === neighborhoodId && isMomentActive(m))
    if (top) set({ lastSeenMomentId: top.id })
  },
  markMomentSeen: (id) => set((state) => (state.seenMomentIds[id] ? {} : { seenMomentIds: { ...state.seenMomentIds, [id]: true } })),
}))
