import { AnimatePresence, motion } from 'motion/react'
import { X, Compass, MessageCircle, UserMinus, ShieldOff } from 'lucide-react'
import { findNeighborhood } from '@/features/locations/data'
import { useClock } from '@/hooks/useClock'
import { useWeather } from '@/hooks/useWeather'
import { useLocationStore } from '@/stores/locationStore'
import { useFriendsStore } from '@/stores/friendsStore'
import { useUIStore } from '@/stores/uiStore'
import { formatTimeShort } from '@/utils/time'
import { formatTemperature } from '@/utils/units'
import { conditionIcon } from '@/features/weather/icon'
import { Scrim } from '@/components/shared/GlassPanel'
import { Avatar } from '@/components/shared/Avatar'

const SHARE_LABEL: Record<string, string> = {
  none: 'Not sharing a location',
  manual: 'Shares a selected neighborhood',
  'selected-friends': 'Shares with selected friends',
  'all-friends': 'Shares with all friends',
  'time-limited': 'Sharing temporarily',
}

/** A friend's own profile card — presence, bio, and where they are, separate from the compact row in the Friends list. */
export function FriendProfileOverlay() {
  const friendId = useUIStore((s) => s.friendProfileId)
  const setFriendProfileId = useUIStore((s) => s.setFriendProfileId)
  const setFriendsOverlayOpen = useUIStore((s) => s.setFriendsOverlayOpen)
  const friends = useFriendsStore((s) => s.friends)
  const removeFriend = useFriendsStore((s) => s.removeFriend)
  const blockFriend = useFriendsStore((s) => s.blockFriend)
  const visitFriendLocation = useLocationStore((s) => s.visitFriendLocation)
  const now = useClock()

  const friend = friends.find((f) => f.id === friendId) ?? null
  const neighborhood = friend?.sharedNeighborhoodId ? findNeighborhood(friend.sharedNeighborhoodId) : undefined
  const { data: weather } = useWeather(neighborhood?.lat ?? 0, neighborhood?.lon ?? 0)
  const canVisit = !!friend && friend.shareStatus !== 'none' && !!neighborhood

  function close() {
    setFriendProfileId(null)
  }

  function visit() {
    if (!friend || !neighborhood) return
    visitFriendLocation(neighborhood, `${friend.name}'s neighborhood`, friend.id)
    setFriendProfileId(null)
    setFriendsOverlayOpen(false)
  }

  return (
    <AnimatePresence>
      {friend && (
        <>
          <Scrim onClick={close} elevated />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            className="glass-surface fixed left-1/2 top-1/2 z-50 flex w-[92%] max-w-[420px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[28px] shadow-[0_30px_90px_rgba(0,0,0,0.5)]"
          >
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <p className="text-[15px] font-semibold text-white">Profile</p>
              <button onClick={close} className="text-white/40 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              <div className="flex items-center gap-3.5">
                <Avatar seed={friend.id} emoji={friend.avatar} size={64} />
                <p className="truncate text-[17px] font-semibold text-white">{friend.name}</p>
              </div>

              {friend.bio && <p className="mt-4 text-[13px] leading-snug text-white/65">{friend.bio}</p>}

              <div className="mt-4 rounded-2xl bg-white/5 p-3.5 text-[12.5px] text-white/60">
                {neighborhood ? (
                  <div className="flex items-center justify-between">
                    <span>
                      {neighborhood.name}, {neighborhood.city}
                    </span>
                    <span className="flex items-center gap-2 text-white/80">
                      <span>{formatTimeShort(now, neighborhood.timezone)}</span>
                      {weather && (
                        <span className="flex items-center gap-1">
                          {conditionIcon(weather.condition, weather.isDay, 12)}
                          {formatTemperature(weather.temperatureC, 'C')}
                        </span>
                      )}
                    </span>
                  </div>
                ) : (
                  SHARE_LABEL[friend.shareStatus]
                )}
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={visit}
                  disabled={!canVisit}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-linen py-2.5 text-[13px] font-semibold text-wine hover:bg-white disabled:opacity-30"
                  style={{ color: '#6c1c37' }}
                >
                  <Compass size={14} />
                  Visit
                </button>
                <button className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-white/8 py-2.5 text-[13px] text-white/70 hover:bg-white/15">
                  <MessageCircle size={14} />
                  Message
                </button>
              </div>
              {!canVisit && (
                <p className="mt-2 text-[10.5px] text-white/30">
                  {friend.name} hasn't authorized a location share, so their atmosphere isn't available to visit.
                </p>
              )}

              <div className="mt-5 flex items-center justify-center gap-4 border-t border-white/8 pt-3.5">
                <button
                  onClick={() => {
                    removeFriend(friend.id)
                    close()
                  }}
                  className="flex items-center gap-1 text-[11px] text-white/30 hover:text-white/55"
                >
                  <UserMinus size={11} />
                  Remove friend
                </button>
                <button
                  onClick={() => {
                    blockFriend(friend.id)
                    close()
                  }}
                  className="flex items-center gap-1 text-[11px] text-white/30 hover:text-white/55"
                >
                  <ShieldOff size={11} />
                  Block
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
