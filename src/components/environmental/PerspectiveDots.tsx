import { useUIStore } from '@/stores/uiStore'
import type { Perspective } from '@/types'
import { clsx } from '@/utils/clsx'

const ORDER: { id: Perspective; label: string }[] = [
  { id: 'street', label: 'Street' },
  { id: 'atmosphere', label: 'Atmosphere' },
  { id: 'earth', label: 'Earth' },
]

/** Visual gap (px) between this nav's bottom edge and the dock bar's own top edge. */
const DOCK_GAP = 16

export function PerspectiveDots() {
  const perspective = useUIStore((s) => s.perspective)
  const setPerspective = useUIStore((s) => s.setPerspective)
  const dockTopOffset = useUIStore((s) => s.dockTopOffset)
  const active = ORDER.find((o) => o.id === perspective)!

  return (
    <div
      className="pointer-events-auto absolute left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1.5"
      style={{ bottom: dockTopOffset + DOCK_GAP }}
    >
      <div className="flex items-center gap-2.5">
        {ORDER.map((o) => (
          <button
            key={o.id}
            aria-label={`Switch to ${o.label} view`}
            aria-current={o.id === perspective}
            onClick={() => setPerspective(o.id)}
            className="p-1.5"
          >
            <span
              className={clsx(
                'block rounded-full transition-all duration-300',
                o.id === perspective ? 'h-1.5 w-5 bg-white/90' : 'h-1.5 w-1.5 bg-white/40 hover:bg-white/60',
              )}
            />
          </button>
        ))}
      </div>
      <span className="text-[11px] font-medium tracking-[0.06em] text-white/55 text-shadow-soft">
        {active.label}
      </span>
    </div>
  )
}
