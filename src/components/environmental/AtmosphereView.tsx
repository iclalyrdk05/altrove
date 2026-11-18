import { getAtmospherePalette } from '@/features/atmosphere/palette'
import { WeatherParticlesCanvas } from './WeatherParticlesCanvas'
import type { SkyCondition } from '@/types'

interface AtmosphereViewProps {
  condition: SkyCondition
  isDay: boolean
  daylightProgress: number | null
  windSpeedKmh: number
  reducedMotion: boolean
}

export function AtmosphereView({ condition, isDay, daylightProgress, windSpeedKmh, reducedMotion }: AtmosphereViewProps) {
  const palette = getAtmospherePalette(condition, isDay, daylightProgress)

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div
        className="absolute inset-0 transition-[background] duration-[1200ms]"
        style={{
          background: `linear-gradient(180deg, ${palette.sky[0]} 0%, ${palette.sky[1]} 52%, ${palette.sky[2]} 100%)`,
        }}
      />

      {palette.starAlpha > 0 && (
        <div
          className="absolute inset-0"
          style={{
            opacity: palette.starAlpha,
            backgroundImage:
              'radial-gradient(1.5px 1.5px at 20% 30%, white, transparent), radial-gradient(1.5px 1.5px at 65% 15%, white, transparent), radial-gradient(1px 1px at 80% 45%, white, transparent), radial-gradient(1px 1px at 40% 60%, white, transparent), radial-gradient(1.5px 1.5px at 90% 25%, white, transparent), radial-gradient(1px 1px at 10% 70%, white, transparent)',
          }}
        />
      )}

      <div
        className="absolute inset-x-0 top-1/3 h-1/3 rounded-full blur-3xl"
        style={{
          background: `radial-gradient(ellipse at center, ${palette.glow}55, transparent 70%)`,
        }}
      />

      {!reducedMotion && (
        <>
          <div
            className="absolute -left-20 top-16 h-40 w-[70%] rounded-full blur-3xl animate-[drift_60s_linear_infinite]"
            style={{ background: `rgba(255,255,255,${palette.cloudOpacity * 0.5})` }}
          />
          <div
            className="absolute -left-40 top-40 h-32 w-[60%] rounded-full blur-3xl animate-[drift_90s_linear_infinite]"
            style={{ background: `rgba(255,255,255,${palette.cloudOpacity * 0.35})` }}
          />
        </>
      )}

      {palette.fog > 0 && (
        <div
          className="absolute inset-x-0 bottom-0 h-2/3"
          style={{
            background: `linear-gradient(180deg, transparent, rgba(190,195,200,${palette.fog}))`,
          }}
        />
      )}

      <WeatherParticlesCanvas particles={palette.particles} windSpeedKmh={windSpeedKmh} reducedMotion={reducedMotion} />

      <style>{`
        @keyframes drift {
          from { transform: translateX(0); }
          to { transform: translateX(40vw); }
        }
      `}</style>
    </div>
  )
}
