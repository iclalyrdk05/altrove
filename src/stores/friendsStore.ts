import { create } from 'zustand'
import { DEMO_FRIENDS, DEMO_FRIEND_REQUESTS, DEMO_RECOMMENDED } from '@/features/friends/data'
import type { Friend } from '@/types'

interface FriendsState {
  friends: Friend[]
  requests: typeof DEMO_FRIEND_REQUESTS
  recommended: typeof DEMO_RECOMMENDED
  /** Recommended-friend ids a request has already been sent to this session. */
  sentRequestIds: string[]
  acceptRequest: (id: string) => void
  declineRequest: (id: string) => void
  sendFriendRequest: (id: string) => void
  removeFriend: (id: string) => void
  blockFriend: (id: string) => void
}

export const useFriendsStore = create<FriendsState>((set) => ({
  friends: DEMO_FRIENDS,
  requests: DEMO_FRIEND_REQUESTS,
  recommended: DEMO_RECOMMENDED,
  sentRequestIds: [],

  acceptRequest: (id) =>
    set((state) => {
      const req = state.requests.find((r) => r.id === id)
      if (!req) return {}
      const newFriend: Friend = {
        id: req.id,
        name: req.name,
        avatar: req.avatar,
        shareStatus: 'none',
        sharedNeighborhoodId: null,
        shareExpiresAt: null,
      }
      return {
        friends: [...state.friends, newFriend],
        requests: state.requests.filter((r) => r.id !== id),
      }
    }),

  declineRequest: (id) => set((state) => ({ requests: state.requests.filter((r) => r.id !== id) })),

  sendFriendRequest: (id) =>
    set((state) => (state.sentRequestIds.includes(id) ? {} : { sentRequestIds: [...state.sentRequestIds, id] })),

  removeFriend: (id) => set((state) => ({ friends: state.friends.filter((f) => f.id !== id) })),
  blockFriend: (id) => set((state) => ({ friends: state.friends.filter((f) => f.id !== id) })),
}))
