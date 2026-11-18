import { useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useUIStore } from '@/stores/uiStore'
import { useLocationStore } from '@/stores/locationStore'
import { StreetPerspective } from './StreetPerspective'
import { AtmospherePerspective } from './AtmospherePerspective'
import { EarthView } from './EarthView'
import type { Perspective, SkyCondition } from '@/types'

interface EnvironmentCanvasProps {
  condition: SkyCondition
  isDay: boolean
  daylightProgress: number | null
  windSpeedKmh: number
}

const ORDER: Perspective[] = ['street', 'atmosphere', 'earth']

export function EnvironmentCanvas({ condition, isDay, daylightProgress, windSpeedKmh }: EnvironmentCanvasProps) {
  const perspective = useUIStore((s) => s.perspective)
  const setPerspective = useUIStore((s) => s.setPerspective)
  const reducedMotion = useUIStore((s) => s.reducedMotion)
  const neighborhood = useLocationStore((s) => s.current)
  const touchStart = useRef<number | null>(null)

  function onTouchStart(e: React.TouchEvent) {
    touchStart.current = e.touches[0].clientX
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStart.current === null) return
    const dx = e.changedTouches[0].clientX - touchStart.current
    touchStart.current = null
    if (Math.abs(dx) < 60) return
    const idx = ORDER.indexOf(perspective)
    if (dx < 0 && idx < ORDER.length - 1) setPerspective(ORDER[idx + 1])
    if (dx > 0 && idx > 0) setPerspective(ORDER[idx - 1])
  }

  return (
    <div
      className="absolute inset-0 overflow-hidden bg-[#141821]"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <AnimatePresence>
        <motion.div
          key={perspective}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0.05 : 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          {perspective === 'street' && (
            <StreetPerspective neighborhood={neighborhood} isDay={isDay} daylightProgress={daylightProgress} />
          )}
          {perspective === 'atmosphere' && (
            <AtmospherePerspective
              neighborhoodId={neighborhood.id}
              placeName={neighborhood.name}
              cityName={neighborhood.city}
              condition={condition}
              isDay={isDay}
              daylightProgress={daylightProgress}
              windSpeedKmh={windSpeedKmh}
              reducedMotion={reducedMotion}
            />
          )}
          {perspective === 'earth' && <EarthView neighborhood={neighborhood} />}
        </motion.div>
      </AnimatePresence>

      {/* soft top/bottom vignette so floating nav & dock stay legible over any scene */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/35 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/45 to-transparent" />
    </div>
  )
}
