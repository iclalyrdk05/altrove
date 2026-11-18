import { useEffect, useMemo } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft } from 'lucide-react'
import { TopNav } from '@/components/navigation/TopNav'
import { EnvironmentCanvas } from '@/components/environmental/EnvironmentCanvas'
import { PerspectiveDots } from '@/components/environmental/PerspectiveDots'
import { BottomDock } from '@/components/dock/BottomDock'
import { LocationOverlay } from '@/components/overlays/LocationOverlay'
import { ProfileOverlay } from '@/components/overlays/ProfileOverlay'
import { FriendsOverlay } from '@/components/friends/FriendsOverlay'
import { FriendProfileOverlay } from '@/components/friends/FriendProfileOverlay'
import { CommunityOverlay } from '@/components/community/CommunityOverlay'
import { MomentToast } from '@/components/community/MomentToast'
import { useMomentSimulator } from '@/features/community/useMomentSimulator'
import { useLocationStore } from '@/stores/locationStore'
import { useUIStore } from '@/stores/uiStore'
import { useWeather } from '@/hooks/useWeather'
import { useClock } from '@/hooks/useClock'
import { getSunTimes } from '@/utils/time'

function App() {
  const neighborhood = useLocationStore((s) => s.current)
  const previous = useLocationStore((s) => s.previous)
  const returnToPrevious = useLocationStore((s) => s.returnToPrevious)
  const setReducedMotion = useUIStore((s) => s.setReducedMotion)
  useMomentSimulator()

  const now = useClock()
  const { data: weather } = useWeather(neighborhood.lat, neighborhood.lon)
  const sunTimes = useMemo(() => getSunTimes(now, neighborhood.lat, neighborhood.lon), [now, neighborhood.lat, neighborhood.lon])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = () => setReducedMotion(mq.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [setReducedMotion])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') useUIStore.getState().closeAllOverlays()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden">
      <EnvironmentCanvas
        condition={weather?.condition ?? 'clear'}
        isDay={sunTimes.isDay}
        daylightProgress={sunTimes.daylightProgress}
        windSpeedKmh={weather?.windSpeedKmh ?? 6}
      />

      <TopNav />
      <PerspectiveDots />
      <BottomDock />

      <AnimatePresence>
        {previous && (
          <motion.button
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            onClick={returnToPrevious}
            className="glass-surface-soft pointer-events-auto absolute left-1/2 top-[66px] z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-medium text-white/85 hover:bg-white/15"
          >
            <ArrowLeft size={13} />
            Return to {previous.label.replace("'s neighborhood", '')}
          </motion.button>
        )}
      </AnimatePresence>

      <LocationOverlay />
      <FriendsOverlay />
      <FriendProfileOverlay />
      <ProfileOverlay />
      <CommunityOverlay />
      <MomentToast />
    </div>
  )
}

export default App
