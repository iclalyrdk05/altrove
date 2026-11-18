import { useState } from 'react'
import { ChevronDown, Compass, MessageCircle, User } from 'lucide-react'
import { findNeighborhood } from '@/features/locations/data'
import { useClock } from '@/hooks/useClock'
import { useWeather } from '@/hooks/useWeather'
import { useLocationStore } from '@/stores/locationStore'
import { useUIStore } from '@/stores/uiStore'
import { formatTimeShort } from '@/utils/time'
import { formatTemperature } from '@/utils/units'
import { conditionIcon } from '@/features/weather/icon'
import { clsx } from '@/utils/clsx'
import { Avatar } from '@/components/shared/Avatar'
import type { Friend } from '@/types'

const SHARE_LABEL: Record<Friend['shareStatus'], string> = {
  none: 'Not sharing a location',
  manual: 'Shares a selected neighborhood',
  'selected-friends': 'Shares with selected friends',
  'all-friends': 'Shares with all friends',
  'time-limited': 'Sharing temporarily',
}

export function FriendCard({ friend }: { friend: Friend }) {
  const [expanded, setExpanded] = useState(false)
  const [showMessageNote, setShowMessageNote] = useState(false)
  const now = useClock()
  const neighborhood = friend.sharedNeighborhoodId ? findNeighborhood(friend.sharedNeighborhoodId) : undefined
  const { data: weather } = useWeather(neighborhood?.lat ?? 0, neighborhood?.lon ?? 0)
  const visitFriendLocation = useLocationStore((s) => s.visitFriendLocation)
  const setFriendsOverlayOpen = useUIStore((s) => s.setFriendsOverlayOpen)
  const setFriendProfileId = useUIStore((s) => s.setFriendProfileId)

  const canVisit = friend.shareStatus !== 'none' && !!neighborhood

  function visit() {
    if (!neighborhood) return
    visitFriendLocation(neighborhood, `${friend.name}'s neighborhood`, friend.id)
    setFriendsOverlayOpen(false)
  }

  return (
    <div className="rounded-2xl bg-white/5">
      <button onClick={() => setExpanded((v) => !v)} className="flex w-full items-center gap-3 p-3.5 text-left">
        <Avatar seed={friend.id} emoji={friend.avatar} size={40} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13.5px] font-medium text-white">{friend.name}</p>
          <p className="truncate text-[11.5px] text-white/45">
            {neighborhood ? `${neighborhood.name}, ${neighborhood.city}` : SHARE_LABEL[friend.shareStatus]}
          </p>
        </div>
        {neighborhood && (
          <div className="flex shrink-0 items-center gap-2 text-[11.5px] text-white/55">
            <span>{formatTimeShort(now, neighborhood.timezone)}</span>
            {weather && (
              <span className="flex items-center gap-1">
                {conditionIcon(weather.condition, weather.isDay, 12)}
                {formatTemperature(weather.temperatureC, 'C')}
              </span>
            )}
          </div>
        )}
        <ChevronDown size={14} className={clsx('text-white/35 transition-transform', expanded && 'rotate-180')} />
      </button>

      {expanded && (
        <div className="border-t border-white/8 px-3.5 pb-3.5 pt-3">
          {friend.bio && <p className="text-[12.5px] text-white/60">{friend.bio}</p>}
          <p className="mt-1.5 text-[11px] text-white/35">{SHARE_LABEL[friend.shareStatus]}</p>
          {friend.shareExpiresAt && (
            <p className="text-[11px] text-white/35">
              Shares until {new Date(friend.shareExpiresAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-1.5">
            <button
              onClick={visit}
              disabled={!canVisit}
              className="flex items-center gap-1.5 rounded-full bg-linen px-3 py-1.5 text-[12px] font-semibold text-wine hover:bg-white disabled:opacity-30"
              style={{ color: '#6c1c37' }}
            >
              <Compass size={13} />
              Visit
            </button>
            <button
              onClick={() => setShowMessageNote((v) => !v)}
              className="flex items-center gap-1.5 rounded-full bg-white/8 px-3 py-1.5 text-[11.5px] text-white/55 hover:bg-white/15"
            >
              <MessageCircle size={12} />
              Message
            </button>
            <button
              onClick={() => setFriendProfileId(friend.id)}
              className="flex items-center gap-1.5 rounded-full bg-white/8 px-3 py-1.5 text-[11.5px] text-white/55 hover:bg-white/15"
            >
              <User size={12} />
              Profile
            </button>
          </div>
          {showMessageNote && (
            <p className="mt-2 text-[10.5px] text-white/30">Messaging isn't connected in this demo build.</p>
          )}
          {!canVisit && (
            <p className="mt-2 text-[10.5px] text-white/30">
              {friend.name} hasn't authorized a location share, so their atmosphere isn't available to visit.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
