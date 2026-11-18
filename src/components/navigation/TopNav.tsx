import { ChevronDown, Users, User } from 'lucide-react'
import { useLocationStore } from '@/stores/locationStore'
import { useUIStore } from '@/stores/uiStore'
import { IconButton } from '@/components/shared/IconButton'
import altroveLogo from '@/assets/altrove-logo.png'

export function TopNav() {
  const current = useLocationStore((s) => s.current)
  const visitingFriendId = useLocationStore((s) => s.visitingFriendId)
  const setLocationOverlayOpen = useUIStore((s) => s.setLocationOverlayOpen)
  const setFriendsOverlayOpen = useUIStore((s) => s.setFriendsOverlayOpen)
  const setProfileOverlayOpen = useUIStore((s) => s.setProfileOverlayOpen)

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-4 px-5 pt-[max(18px,env(safe-area-inset-top))] sm:px-8">
      <div className="pointer-events-auto flex items-center gap-3">
        <button
          onClick={() => setLocationOverlayOpen(true)}
          className="glass-surface-soft flex items-center gap-1.5 rounded-full py-1.5 pl-3 pr-2.5 text-[13px] font-medium text-white/90 transition-colors hover:bg-white/15"
        >
          <span>
            {current.name}, {current.city}, {current.country}
          </span>
          <ChevronDown size={14} strokeWidth={2.2} className="text-white/60" />
        </button>
        {visitingFriendId && (
          <span className="hidden rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/60 sm:inline-block">
            Visiting a shared neighborhood
          </span>
        )}
      </div>

      <div className="pointer-events-none absolute left-1/2 top-4 hidden -translate-x-1/2 md:block">
        <img
          src={altroveLogo}
          alt="Altrove"
          className="h-12 w-auto [filter:drop-shadow(0_0_10px_rgba(255,255,255,0.35))_drop-shadow(0_0_22px_rgba(255,255,255,0.2))_drop-shadow(0_0_36px_rgba(255,255,255,0.12))]"
        />
      </div>

      <div className="pointer-events-auto flex items-center gap-2">
        <IconButton label="Friends" onClick={() => setFriendsOverlayOpen(true)}>
          <Users size={16} strokeWidth={2} />
        </IconButton>
        <IconButton label="Profile" onClick={() => setProfileOverlayOpen(true)}>
          <User size={16} strokeWidth={2} />
        </IconButton>
      </div>
    </div>
  )
}
