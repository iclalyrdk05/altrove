import { useEffect, useRef, useState } from 'react'
import { getAtmospherePalette } from '@/features/atmosphere/palette'
import { WeatherParticlesCanvas } from './WeatherParticlesCanvas'
import type { SkyCondition } from '@/types'

interface AtmosphereFootageViewProps {
  videoUrl: string
  condition: SkyCondition
  isDay: boolean
  daylightProgress: number | null
  windSpeedKmh: number
  reducedMotion: boolean
  onError?: () => void
}

/** Real video footage standing in for the illustrated Atmosphere scene, with the same weather particle overlay layered on top. */
export function AtmosphereFootageView({
  videoUrl,
  condition,
  isDay,
  daylightProgress,
  windSpeedKmh,
  reducedMotion,
  onError,
}: AtmosphereFootageViewProps) {
  const palette = getAtmospherePalette(condition, isDay, daylightProgress)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(false)
  }, [videoUrl])

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0c1119]">
      <video
        ref={videoRef}
        key={videoUrl}
        className="absolute inset-0 h-full w-full object-cover"
        src={videoUrl}
        autoPlay
        muted
        loop
        playsInline
        onCanPlay={() => setLoaded(true)}
        onError={onError}
      />

      {/* a light tint so the dock/nav text stays legible over any footage */}
      <div className="pointer-events-none absolute inset-0 bg-black/15" />

      {!reducedMotion && <WeatherParticlesCanvas particles={palette.particles} windSpeedKmh={windSpeedKmh} reducedMotion={reducedMotion} />}

      {!loaded && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#0c1119]">
          <div className="glass-surface-soft rounded-full px-4 py-2 text-[12px] text-white/70">Loading footage…</div>
        </div>
      )}
    </div>
  )
}
