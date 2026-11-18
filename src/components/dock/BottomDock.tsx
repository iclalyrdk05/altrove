import { useEffect, useMemo, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Volume2, VolumeX, Sparkles } from 'lucide-react'
import { useClock } from '@/hooks/useClock'
import { useWeather } from '@/hooks/useWeather'
import { useLocationStore } from '@/stores/locationStore'
import { useUIStore, type DockPanelId } from '@/stores/uiStore'
import { useAudioStore } from '@/stores/audioStore'
import { useUserStore } from '@/stores/userStore'
import { useCommunityStore, isMomentActive } from '@/stores/communityStore'
import { getSunTimes, formatTimeShort, getTimeDifference } from '@/utils/time'
import { formatTemperature, relativeTimeFrom } from '@/utils/units'
import { simulateActivity } from '@/features/activity/simulate'
import { conditionIcon } from '@/features/weather/icon'
import { GlassPanel } from '@/components/shared/GlassPanel'
import { clsx } from '@/utils/clsx'
import { useOutsideClose } from '@/hooks/useOutsideClose'

import { TimePanel } from './panels/TimePanel'
import { TimeDiffPanel } from './panels/TimeDiffPanel'
import { WeatherPanel } from './panels/WeatherPanel'
import { ActivityPanel } from './panels/ActivityPanel'
import { SoundPanel } from './panels/SoundPanel'

export function BottomDock() {
  const neighborhood = useLocationStore((s) => s.current)
  const now = useClock()
  const { data: weather, loading, error } = useWeather(neighborhood.lat, neighborhood.lon)
  const dockPanel = useUIStore((s) => s.dockPanel)
  const toggleDockPanel = useUIStore((s) => s.toggleDockPanel)
  const setCommunityOverlayOpen = useUIStore((s) => s.setCommunityOverlayOpen)
  const audio = useAudioStore()
  const preferences = useUserStore((s) => s.preferences)
  const allMoments = useCommunityStore((s) => s.moments)
  const lastSeenMomentId = useCommunityStore((s) => s.lastSeenMomentId)
  const moments = useMemo(
    () => allMoments.filter((m) => m.neighborhoodId === neighborhood.id && isMomentActive(m)),
    [allMoments, neighborhood.id],
  )
  const hasUnseenMoment = moments.length > 0 && moments[0].id !== lastSeenMomentId
  const momentsValue = moments.length > 0 ? `${relativeTimeFrom(moments[0].createdAt)}` : 'Quiet'

  const sunTimes = useMemo(() => getSunTimes(now, neighborhood.lat, neighborhood.lon), [now, neighborhood.lat, neighborhood.lon])
  const localHour = Number(
    new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: false, timeZone: neighborhood.timezone }).format(now),
  )
  const activity = useMemo(() => simulateActivity(neighborhood.id, localHour), [neighborhood.id, localHour])
  const diff = getTimeDifference(now, neighborhood.timezone, preferences.referenceTimezone)

  const panelRef = useRef<HTMLDivElement>(null)
  const openDockPanel = useUIStore((s) => s.openDockPanel)
  useOutsideClose(panelRef, () => openDockPanel(null), dockPanel !== null)

  const barRef = useRef<HTMLDivElement>(null)
  const setDockTopOffset = useUIStore((s) => s.setDockTopOffset)
  useEffect(() => {
    const el = barRef.current
    if (!el) return
    const measure = () => setDockTopOffset(window.innerHeight - el.getBoundingClientRect().top)
    measure()
    // The bar animates in with a transform (y: 24 -> 0) on mount, which
    // ResizeObserver doesn't react to — re-measure once it settles so nav
    // dots/toast lock onto the resting position, not the mid-animation one.
    const settleId = setTimeout(measure, 650)
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener('resize', measure)
    return () => {
      clearTimeout(settleId)
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [setDockTopOffset])

  const soundOn = audio.radio.on || audio.street.on || audio.weather.on
  const activeChannels = [audio.radio.on, audio.street.on, audio.weather.on].filter(Boolean).length

  async function handleSoundClick() {
    await audio.unlock()
    toggleDockPanel('sound')
  }

  function select(id: Exclude<DockPanelId, null>) {
    toggleDockPanel(id)
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col items-center pb-[max(20px,env(safe-area-inset-bottom))]">
      <AnimatePresence>
        {dockPanel && (
          <div ref={panelRef} className="pointer-events-auto mb-3">
            <GlassPanel>
              {dockPanel === 'time' && <TimePanel neighborhood={neighborhood} now={now} sunTimes={sunTimes} />}
              {dockPanel === 'diff' && <TimeDiffPanel neighborhood={neighborhood} now={now} />}
              {dockPanel === 'weather' && <WeatherPanel neighborhood={neighborhood} weather={weather} loading={loading} error={error} />}
              {dockPanel === 'activity' && <ActivityPanel activity={activity} />}
              {dockPanel === 'sound' && <SoundPanel neighborhood={neighborhood} weather={weather} activityLevel={activity.level} />}
            </GlassPanel>
          </div>
        )}
      </AnimatePresence>

      <motion.div
        ref={barRef}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="glass-surface pointer-events-auto flex w-[94%] max-w-[980px] items-center justify-between gap-1 overflow-x-auto rounded-[32px] px-3 py-2.5 shadow-[0_25px_70px_rgba(0,0,0,0.4)] sm:gap-0 sm:px-4"
      >
        <DockGroup
          active={dockPanel === 'time'}
          label="Local Time"
          value={formatTimeShort(now, neighborhood.timezone)}
          onClick={() => select('time')}
        />
        <Divider />
        <DockGroup
          active={dockPanel === 'diff'}
          label="Time Difference"
          value={diff.label === 'Same time' ? 'Same time' : diff.label}
          onClick={() => select('diff')}
        />
        <Divider />
        <DockGroup
          active={dockPanel === 'weather'}
          label="Weather"
          value={weather ? `${formatTemperature(weather.temperatureC, preferences.temperatureUnit)} · ${weather.conditionLabel}` : error ? 'Unavailable' : '…'}
          icon={weather ? conditionIcon(weather.condition, weather.isDay, 14) : undefined}
          onClick={() => select('weather')}
        />
        <Divider />
        <DockGroup
          active={dockPanel === 'activity'}
          label="Activity"
          value={activity.level === 'unavailable' ? 'Unavailable' : activity.level.replace('-', ' ')}
          onClick={() => select('activity')}
          capitalize
        />
        <Divider />
        <DockGroup
          active={false}
          label="Moments"
          value={momentsValue}
          icon={<Sparkles size={13} />}
          onClick={() => setCommunityOverlayOpen(true)}
          badge={hasUnseenMoment}
        />
        <Divider />
        <DockGroup
          active={dockPanel === 'sound'}
          label="Sound"
          value={soundOn ? `${activeChannels} channel${activeChannels === 1 ? '' : 's'}` : 'Off'}
          icon={soundOn ? <Volume2 size={13} /> : <VolumeX size={13} />}
          onClick={handleSoundClick}
        />
      </motion.div>
    </div>
  )
}

function Divider() {
  return <span className="mx-1 hidden h-9 w-px shrink-0 bg-white/10 sm:block" />
}

function DockGroup({
  label,
  value,
  icon,
  onClick,
  active,
  capitalize,
  badge,
}: {
  label: string
  value: string
  icon?: React.ReactNode
  onClick: () => void
  active: boolean
  capitalize?: boolean
  badge?: boolean
}) {
  return (
    <button
      data-dock-trigger
      onClick={onClick}
      className={clsx(
        'relative flex min-w-[84px] flex-1 flex-col items-center gap-0.5 rounded-2xl px-2.5 py-1.5 text-center transition-colors sm:min-w-[96px]',
        active ? 'bg-white/15' : 'hover:bg-white/8',
      )}
    >
      {badge && (
        <span className="absolute right-3 top-1 h-2 w-2 rounded-full bg-rose shadow-[0_0_0_2px_rgba(255,255,255,0.35)]" />
      )}
      <span className="text-[10.5px] font-medium tracking-[0.02em] text-white/40">{label}</span>
      <span className={clsx('flex items-center gap-1 text-[13px] font-medium text-white/92', capitalize && 'capitalize')}>
        {icon}
        {value}
      </span>
    </button>
  )
}
