import { useMemo } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { X, MapPin, Bookmark, Users as UsersIcon, Sparkles } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { useUserStore } from '@/stores/userStore'
import { useLocationStore } from '@/stores/locationStore'
import { useFriendsStore } from '@/stores/friendsStore'
import { useCommunityStore } from '@/stores/communityStore'
import { Scrim } from '@/components/shared/GlassPanel'
import { Avatar } from '@/components/shared/Avatar'
import { clsx } from '@/utils/clsx'

export function ProfileOverlay() {
  const open = useUIStore((s) => s.profileOverlayOpen)
  const setOpen = useUIStore((s) => s.setProfileOverlayOpen)
  const profile = useUserStore()
  const saved = useLocationStore((s) => s.saved)
  const friends = useFriendsStore((s) => s.friends)
  const allMoments = useCommunityStore((s) => s.moments)
  const moments = useMemo(() => allMoments.filter((m) => m.authorName === 'You'), [allMoments])
  const reducedMotion = useUIStore((s) => s.reducedMotion)
  const setReducedMotion = useUIStore((s) => s.setReducedMotion)

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
            className="glass-surface fixed left-1/2 top-1/2 z-40 flex h-[680px] w-[92%] max-w-[480px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[28px] shadow-[0_30px_90px_rgba(0,0,0,0.5)]"
          >
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <p className="text-[15px] font-semibold text-white">Profile</p>
              <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex items-center gap-3">
                <Avatar seed="you" emoji={profile.avatar} size={56} />
                <div>
                  <p className="text-[16px] font-semibold text-white">{profile.displayName}</p>
                  <p className="text-[12px] text-white/45">{profile.isAuthenticated ? 'Signed in' : 'Guest / demo mode'}</p>
                </div>
              </div>
              <p className="mt-3 text-[13px] leading-snug text-white/60">{profile.bio}</p>

              {!profile.isAuthenticated && (
                <button
                  onClick={() => useUserStore.setState({ isAuthenticated: true, displayName: 'You' })}
                  className="mt-3 w-full rounded-full bg-linen py-2.5 text-[13px] font-semibold text-wine hover:bg-white"
                  style={{ color: '#6c1c37' }}
                >
                  Sign In (connect a backend to enable)
                </button>
              )}

              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                <Stat icon={<Bookmark size={14} />} value={saved.length} label="Saved" />
                <Stat icon={<UsersIcon size={14} />} value={friends.length} label="Friends" />
                <Stat icon={<Sparkles size={14} />} value={moments.length} label="Moments" />
              </div>

              <Section title="Preferences">
                <PreferenceRow
                  label="Temperature Unit"
                  options={['C', 'F']}
                  value={profile.preferences.temperatureUnit}
                  onChange={(v) => profile.setPreferences({ temperatureUnit: v as 'C' | 'F' })}
                />
                <PreferenceRow
                  label="Wind Unit"
                  options={['kmh', 'mph']}
                  value={profile.preferences.windUnit}
                  onChange={(v) => profile.setPreferences({ windUnit: v as 'kmh' | 'mph' })}
                />
                <div className="flex items-center justify-between py-2">
                  <span className="text-[12.5px] text-white/60">Reduced Motion</span>
                  <button
                    onClick={() => setReducedMotion(!reducedMotion)}
                    className={clsx('h-5 w-9 rounded-full p-0.5 transition-colors', reducedMotion ? 'bg-rose/80' : 'bg-white/15')}
                  >
                    <span className={clsx('block h-4 w-4 rounded-full bg-white transition-transform', reducedMotion && 'translate-x-4')} />
                  </button>
                </div>
                <div className="flex items-center justify-between py-2 text-[12.5px] text-white/60">
                  <span>Reference Location</span>
                  <span className="flex items-center gap-1 text-white/85">
                    <MapPin size={12} />
                    {profile.preferences.referenceLabel}
                  </span>
                </div>
              </Section>

              <Section title="Privacy">
                <p className="text-[11.5px] leading-snug text-white/45">
                  Location sharing with friends is off by default and enforced per-friend when a backend is
                  connected. This demo build stores friend data locally and does not transmit your location anywhere.
                </p>
              </Section>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="rounded-2xl bg-white/5 py-3">
      <div className="flex items-center justify-center gap-1.5 text-white/85">
        {icon}
        <span className="text-[16px] font-semibold">{value}</span>
      </div>
      <p className="mt-0.5 text-[10.5px] text-white/40">{label}</p>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <p className="mb-2 text-[12px] font-medium tracking-[0.04em] text-white/35">{title}</p>
      <div className="space-y-1.5">{children}</div>
    </div>
  )
}

function PreferenceRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: string[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-[12.5px] text-white/60">{label}</span>
      <div className="flex gap-1">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={clsx(
              'rounded-full px-2.5 py-1 text-[11px] transition-colors',
              value === o ? 'bg-white/25 text-white' : 'bg-white/8 text-white/50',
            )}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  )
}
