import { create } from 'zustand'
import type { UserProfile } from '@/types'

interface UserState extends UserProfile {
  setPreferences: (p: Partial<UserProfile['preferences']>) => void
  setBio: (bio: string) => void
  setDisplayName: (name: string) => void
}

export const useUserStore = create<UserState>((set) => ({
  displayName: 'Guest',
  avatar: '🧭',
  bio: 'Exploring neighborhoods from afar.',
  isAuthenticated: false,
  preferences: {
    temperatureUnit: 'C',
    windUnit: 'kmh',
    reducedMotion: false,
    referenceTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    referenceLabel: 'My Location',
  },
  setPreferences: (p) => set((state) => ({ preferences: { ...state.preferences, ...p } })),
  setBio: (bio) => set({ bio }),
  setDisplayName: (displayName) => set({ displayName }),
}))
