import { useRef, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import type { Neighborhood } from '@/types'

interface StreetViewProps {
  neighborhood: Neighborhood
  isDay: boolean
  /** Why we fell back to this illustrated scene instead of real imagery, if applicable. */
  fallbackReason?: string
}

const LAYER_WIDTH = 220 // percent of container width

export function StreetView({ neighborhood, isDay, fallbackReason }: StreetViewProps) {
  const [pan, setPan] = useState(0) // 0..100, percent offset
  const dragRef = useRef<{ startX: number; startPan: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const hue = neighborhood.hue

  function clampPan(v: number) {
    const max = LAYER_WIDTH - 100
    return Math.max(0, Math.min(max, v))
  }

  function onPointerDown(e: React.PointerEvent) {
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    dragRef.current = { startX: e.clientX, startPan: pan }
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragRef.current || !containerRef.current) return
    const dx = e.clientX - dragRef.current.startX
    const widthPx = containerRef.current.offsetWidth
    const deltaPercent = (dx / widthPx) * 100
    setPan(clampPan(dragRef.current.startPan - deltaPercent))
  }
  function onPointerUp() {
    dragRef.current = null
  }

  const sky = isDay
    ? `linear-gradient(180deg, hsl(${hue + 20} 55% 62%) 0%, hsl(${hue} 45% 72%) 45%, hsl(${hue - 10} 60% 82%) 100%)`
    : `linear-gradient(180deg, hsl(${hue + 30} 40% 14%) 0%, hsl(${hue + 10} 35% 20%) 55%, hsl(${hue} 30% 28%) 100%)`

  const buildingColorFar = isDay ? `hsl(${hue} 24% 52%)` : `hsl(${hue} 28% 13%)`
  const buildingColorNear = isDay ? `hsl(${hue - 10} 22% 34%)` : `hsl(${hue - 5} 24% 8%)`
  // water reads as water (blue) even under a warm sky — small per-city jitter, not a hue blend
  // (blending two far-apart hues linearly crosses through green, which looked wrong)
  const waterHue = 200 + (hue % 20)
  const waterColor = isDay ? `hsl(${waterHue} 48% 50%)` : `hsl(${waterHue} 38% 14%)`

  return (
    <div className="relative h-full w-full overflow-hidden" style={{ background: sky }}>
      <div
        ref={containerRef}
        className="relative h-full w-full cursor-grab touch-none select-none active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {/* far skyline layer, parallax factor 0.5 */}
        <svg
          className="absolute bottom-[34%] h-[30%]"
          style={{ width: `${LAYER_WIDTH}%`, left: `${-pan * 0.5}%` }}
          viewBox="0 0 2000 300"
          preserveAspectRatio="none"
        >
          {Array.from({ length: 40 }).map((_, i) => {
            const w = 30 + ((i * 37) % 60)
            const h = 60 + ((i * 53) % 180)
            const x = i * 52
            return <rect key={i} x={x} y={300 - h} width={w} height={h} fill={buildingColorFar} opacity={0.75} />
          })}
        </svg>

        {/* near buildings layer, parallax factor 1 */}
        <svg
          className="absolute bottom-[30%] h-[42%]"
          style={{ width: `${LAYER_WIDTH}%`, left: `${-pan}%` }}
          viewBox="0 0 2000 420"
          preserveAspectRatio="none"
        >
          {Array.from({ length: 26 }).map((_, i) => {
            const w = 60 + ((i * 67) % 110)
            const h = 120 + ((i * 97) % 260)
            const x = i * 84
            return (
              <g key={i}>
                <rect x={x} y={420 - h} width={w} height={h} fill={buildingColorNear} />
                {!isDay &&
                  Array.from({ length: Math.floor(h / 28) }).map((_, wy) =>
                    Array.from({ length: Math.max(1, Math.floor(w / 22)) }).map((_, wx) => {
                      const lit = (i + wy + wx) % 5 !== 0
                      if (!lit) return null
                      return (
                        <rect
                          key={`${wy}-${wx}`}
                          x={x + 8 + wx * 22}
                          y={420 - h + 10 + wy * 28}
                          width={6}
                          height={9}
                          fill="#eea654"
                          opacity={0.5 + ((i + wy) % 3) * 0.15}
                        />
                      )
                    }),
                  )}
              </g>
            )
          })}
        </svg>

        {/* water band with reflection */}
        <div className="absolute inset-x-0 bottom-0 h-[30%]" style={{ background: waterColor }}>
          <div
            className="h-full w-full opacity-30"
            style={{
              backgroundImage:
                'repeating-linear-gradient(90deg, rgba(255,255,255,0.25) 0 2px, transparent 2px 40px)',
              transform: `translateX(${-pan * 1.3}%)`,
            }}
          />
        </div>

        {/* foreground railing, parallax factor 1.4 for closeness */}
        <svg
          className="absolute bottom-0 h-[14%] opacity-90"
          style={{ width: `${LAYER_WIDTH}%`, left: `${-pan * 1.4}%` }}
          viewBox="0 0 2000 80"
          preserveAspectRatio="none"
        >
          <rect x="0" y="60" width="2000" height="6" fill="#20242b" />
          {Array.from({ length: 60 }).map((_, i) => (
            <rect key={i} x={i * 34} y="30" width="6" height="36" fill="#20242b" />
          ))}
        </svg>
      </div>

      <div className="pointer-events-none absolute left-1/2 top-[76px] -translate-x-1/2 rounded-full bg-black/25 px-3 py-1 text-center text-[10px] font-medium tracking-wide text-white/70 backdrop-blur-sm">
        {fallbackReason ? `${fallbackReason} Showing an illustrative scene.` : 'Illustrative street scene · drag to look around'}
      </div>

      <button
        onClick={() => setPan(0)}
        className="glass-surface-soft absolute bottom-6 right-6 flex h-9 w-9 items-center justify-center rounded-full text-white/80 hover:text-white"
        aria-label="Reset view"
        title="Reset view"
      >
        <RotateCcw size={15} />
      </button>
    </div>
  )
}
