import { create } from 'zustand'
import { DEFAULT_NEIGHBORHOOD } from '@/features/locations/data'
import type { Neighborhood } from '@/types'

interface LocationState {
  current: Neighborhood
  previous: { neighborhood: Neighborhood; label: string } | null
  recents: Neighborhood[]
  saved: Neighborhood[]
  visitingFriendId: string | null

  setLocation: (n: Neighborhood) => void
  visitFriendLocation: (n: Neighborhood, friendReturnLabel: string, friendId: string) => void
  returnToPrevious: () => void
  toggleSaved: (n: Neighborhood) => void
  isSaved: (id: string) => boolean
}

export const useLocationStore = create<LocationState>((set, get) => ({
  current: DEFAULT_NEIGHBORHOOD,
  previous: null,
  recents: [],
  saved: [],
  visitingFriendId: null,

  setLocation: (n) =>
    set((state) => {
      const recents = [n, ...state.recents.filter((r) => r.id !== n.id)].slice(0, 6)
      return { current: n, recents, visitingFriendId: null, previous: null }
    }),

  visitFriendLocation: (n, label, friendId) =>
    set((state) => ({
      previous: { neighborhood: state.current, label },
      current: n,
      visitingFriendId: friendId,
      recents: [n, ...state.recents.filter((r) => r.id !== n.id)].slice(0, 6),
    })),

  returnToPrevious: () =>
    set((state) => {
      if (!state.previous) return {}
      return { current: state.previous.neighborhood, previous: null, visitingFriendId: null }
    }),

  toggleSaved: (n) =>
    set((state) => {
      const exists = state.saved.some((s) => s.id === n.id)
      return {
        saved: exists ? state.saved.filter((s) => s.id !== n.id) : [...state.saved, n],
      }
    }),

  isSaved: (id) => get().saved.some((s) => s.id === id),
}))
