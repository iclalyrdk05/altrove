import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { X, UserCheck, UserX, UserPlus, Check, Search } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { useFriendsStore } from '@/stores/friendsStore'
import { Scrim } from '@/components/shared/GlassPanel'
import { Avatar } from '@/components/shared/Avatar'
import { clsx } from '@/utils/clsx'
import { FriendCard } from './FriendCard'

export function FriendsOverlay() {
  const open = useUIStore((s) => s.friendsOverlayOpen)
  const setOpen = useUIStore((s) => s.setFriendsOverlayOpen)
  const friends = useFriendsStore((s) => s.friends)
  const requests = useFriendsStore((s) => s.requests)
  const recommended = useFriendsStore((s) => s.recommended)
  const discoverable = useFriendsStore((s) => s.discoverable)
  const sentRequestIds = useFriendsStore((s) => s.sentRequestIds)
  const acceptRequest = useFriendsStore((s) => s.acceptRequest)
  const declineRequest = useFriendsStore((s) => s.declineRequest)
  const sendFriendRequest = useFriendsStore((s) => s.sendFriendRequest)
  const [tab, setTab] = useState<'friends' | 'requests' | 'add'>('friends')
  const [query, setQuery] = useState('')

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase()
    const pool = q ? discoverable.filter((p) => p.name.toLowerCase().includes(q)) : discoverable
    const friendIds = new Set(friends.map((f) => f.id))
    return pool.filter((p) => !friendIds.has(p.id))
  }, [discoverable, friends, query])

  return (
    <AnimatePresence>
      {open && (
        <>
          <Scrim onClick={() => setOpen(false)} />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            className="glass-surface fixed left-1/2 top-1/2 z-40 flex h-[640px] w-[92%] max-w-[480px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[28px] shadow-[0_30px_90px_rgba(0,0,0,0.5)]"
          >
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <p className="text-[15px] font-semibold text-white">Friends</p>
              <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="flex gap-1 px-4 pt-3">
              {(
                [
                  { id: 'friends', label: 'Friends' },
                  { id: 'requests', label: `Requests${requests.length ? ` (${requests.length})` : ''}` },
                  { id: 'add', label: 'Add Friends' },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={clsx(
                    'rounded-full px-3 py-1 text-[11.5px] font-medium transition-colors',
                    tab === t.id ? 'bg-white/18 text-white' : 'text-white/45 hover:text-white/70',
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto p-4">
              {tab === 'friends' &&
                (friends.length === 0 ? (
                  <EmptyState text="No friends yet." />
                ) : (
                  friends.map((f) => <FriendCard key={f.id} friend={f} />)
                ))}

              {tab === 'requests' && (
                <>
                  {requests.length === 0 ? (
                    <EmptyState text="No pending friend requests." />
                  ) : (
                    requests.map((r) => (
                      <div key={r.id} className="flex items-center gap-3 rounded-2xl bg-white/5 p-3.5">
                        <Avatar seed={r.id} emoji={r.avatar} size={40} />
                        <p className="flex-1 text-[13.5px] font-medium text-white">{r.name}</p>
                        <button
                          onClick={() => acceptRequest(r.id)}
                          className="flex items-center gap-1 rounded-full bg-linen px-2.5 py-1.5 text-[11.5px] font-semibold text-wine hover:bg-white"
                          style={{ color: '#6c1c37' }}
                        >
                          <UserCheck size={13} />
                          Accept
                        </button>
                        <button
                          onClick={() => declineRequest(r.id)}
                          className="flex items-center gap-1 rounded-full bg-white/8 px-2.5 py-1.5 text-[11.5px] text-white/55 hover:bg-white/15"
                        >
                          <UserX size={13} />
                        </button>
                      </div>
                    ))
                  )}

                  <p className="pb-1 pt-3 text-[11px] font-medium tracking-[0.04em] text-white/35">
                    Friends of Friends
                  </p>
                  {recommended.map((r) => {
                    const sent = sentRequestIds.includes(r.id)
                    return (
                      <div key={r.id} className="flex items-center gap-3 rounded-2xl bg-white/5 p-3.5">
                        <Avatar seed={r.id} emoji={r.avatar} size={40} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13.5px] font-medium text-white">{r.name}</p>
                          <p className="truncate text-[11px] text-white/40">via {r.mutualFriendName}</p>
                        </div>
                        <button
                          onClick={() => sendFriendRequest(r.id)}
                          disabled={sent}
                          className={clsx(
                            'flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[11.5px] font-medium transition-colors',
                            sent ? 'bg-white/8 text-white/40' : 'bg-white/12 text-white/80 hover:bg-white/20',
                          )}
                        >
                          {sent ? <Check size={13} /> : <UserPlus size={13} />}
                          {sent ? 'Requested' : 'Add'}
                        </button>
                      </div>
                    )
                  })}
                </>
              )}

              {tab === 'add' && (
                <>
                  <div className="sticky top-0 z-10 -mx-4 -mt-4 bg-black/0 px-4 pb-2 pt-0">
                    <div className="flex items-center gap-2 rounded-full bg-white/8 px-3 py-2">
                      <Search size={14} className="shrink-0 text-white/40" />
                      <input
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search people by name…"
                        className="w-full bg-transparent text-[13px] text-white placeholder:text-white/35 focus:outline-none"
                      />
                    </div>
                  </div>

                  {searchResults.length === 0 ? (
                    <EmptyState text={query ? 'No one found with that name.' : 'No one left to add.'} />
                  ) : (
                    searchResults.map((p) => {
                      const sent = sentRequestIds.includes(p.id)
                      return (
                        <div key={p.id} className="flex items-center gap-3 rounded-2xl bg-white/5 p-3.5">
                          <Avatar seed={p.id} emoji={p.avatar} size={40} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13.5px] font-medium text-white">{p.name}</p>
                            {p.bio && <p className="truncate text-[11px] text-white/40">{p.bio}</p>}
                          </div>
                          <button
                            onClick={() => sendFriendRequest(p.id)}
                            disabled={sent}
                            className={clsx(
                              'flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1.5 text-[11.5px] font-medium transition-colors',
                              sent ? 'bg-white/8 text-white/40' : 'bg-white/12 text-white/80 hover:bg-white/20',
                            )}
                          >
                            {sent ? <Check size={13} /> : <UserPlus size={13} />}
                            {sent ? 'Requested' : 'Add'}
                          </button>
                        </div>
                      )
                    })
                  )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function EmptyState({ text }: { text: string }) {
  return <p className="py-10 text-center text-[13px] text-white/40">{text}</p>
}
