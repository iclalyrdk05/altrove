import { useEffect, useState } from 'react'
import type { StreetFootage } from '@/features/street/realWalkFootage'

interface StreetFootageViewProps {
  footage: StreetFootage
  neighborhoodName: string
  onError: () => void
}

/** A real, eye-level walking/street video for this neighborhood — quiet, continuous, no interaction required. */
export function StreetFootageView({ footage, neighborhoodName, onError }: StreetFootageViewProps) {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(false)
  }, [footage.src])

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0c1119]">
      <video
        key={footage.src}
        className="absolute inset-0 h-full w-full object-cover"
        src={footage.src}
        autoPlay
        muted
        loop
        playsInline
        onCanPlay={() => setLoaded(true)}
        onError={onError}
      />

      <div className="pointer-events-none absolute inset-0 bg-black/15" />

      {!loaded && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#0c1119]">
          <div className="glass-surface-soft rounded-full px-4 py-2 text-[12px] text-white/70">
            Loading a street-level walk through {neighborhoodName}…
          </div>
        </div>
      )}
    </div>
  )
}
