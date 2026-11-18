import { create } from 'zustand'
import type { Perspective } from '@/types'

export type DockPanelId = 'time' | 'diff' | 'weather' | 'activity' | 'sound' | null

interface UIState {
  perspective: Perspective
  dockPanel: DockPanelId
  locationOverlayOpen: boolean
  friendsOverlayOpen: boolean
  profileOverlayOpen: boolean
  communityOverlayOpen: boolean
  /** Friend id whose profile overlay is open, or null if closed. */
  friendProfileId: string | null
  reducedMotion: boolean
  /** Live-measured distance (px) from the viewport bottom to the top of the dock bar itself — lets nav dots and the moment toast sit a fixed gap above the dock regardless of its real rendered height/safe-area on the viewer's actual device. */
  dockTopOffset: number

  setPerspective: (p: Perspective) => void
  openDockPanel: (p: DockPanelId) => void
  toggleDockPanel: (p: Exclude<DockPanelId, null>) => void
  setLocationOverlayOpen: (v: boolean) => void
  setFriendsOverlayOpen: (v: boolean) => void
  setProfileOverlayOpen: (v: boolean) => void
  setCommunityOverlayOpen: (v: boolean) => void
  setFriendProfileId: (id: string | null) => void
  closeAllOverlays: () => void
  setReducedMotion: (v: boolean) => void
  setDockTopOffset: (v: number) => void
}

export const useUIStore = create<UIState>((set, get) => ({
  perspective: 'street',
  dockPanel: null,
  locationOverlayOpen: false,
  friendsOverlayOpen: false,
  profileOverlayOpen: false,
  communityOverlayOpen: false,
  friendProfileId: null,
  reducedMotion: typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false,
  dockTopOffset: 90,

  setPerspective: (p) => set({ perspective: p }),
  setDockTopOffset: (v: number) => set({ dockTopOffset: v }),
  openDockPanel: (p) => set({ dockPanel: p }),
  toggleDockPanel: (p) => set({ dockPanel: get().dockPanel === p ? null : p }),
  setLocationOverlayOpen: (v) => set({ locationOverlayOpen: v, dockPanel: null }),
  setFriendsOverlayOpen: (v) => set({ friendsOverlayOpen: v, dockPanel: null }),
  setProfileOverlayOpen: (v) => set({ profileOverlayOpen: v, dockPanel: null }),
  setCommunityOverlayOpen: (v) => set({ communityOverlayOpen: v, dockPanel: null }),
  setFriendProfileId: (id) => set({ friendProfileId: id }),
  closeAllOverlays: () =>
    set({
      locationOverlayOpen: false,
      friendsOverlayOpen: false,
      profileOverlayOpen: false,
      communityOverlayOpen: false,
      friendProfileId: null,
      dockPanel: null,
    }),
  setReducedMotion: (v) => set({ reducedMotion: v }),
}))
