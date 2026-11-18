import { Sunrise, Sunset } from 'lucide-react'
import { SunArc } from '@/components/shared/SunArc'
import { formatDateInZone, formatTimeShort, getTimeZoneAbbreviation } from '@/utils/time'
import type { SunTimes } from '@/utils/time'
import type { Neighborhood } from '@/types'

interface TimePanelProps {
  neighborhood: Neighborhood
  now: Date
  sunTimes: SunTimes
}

export function TimePanel({ neighborhood, now, sunTimes }: TimePanelProps) {
  return (
    <div className="w-[320px] p-5">
      <p className="text-[12px] font-medium tracking-[0.04em] text-white/45">Local Time</p>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-[40px] font-semibold leading-none tracking-tight text-white">
          {formatTimeShort(now, neighborhood.timezone)}
        </span>
        <span className="text-[13px] text-white/55">{getTimeZoneAbbreviation(now, neighborhood.timezone)}</span>
      </div>
      <p className="mt-1 text-[13px] text-white/60">{formatDateInZone(now, neighborhood.timezone)}</p>
      <p className="text-[12px] text-white/40">{sunTimes.isDay ? 'Daytime' : 'Nighttime'} in {neighborhood.name}</p>

      <div className="mt-4 flex items-center justify-center">
        <SunArc progress={sunTimes.daylightProgress} isDay={sunTimes.isDay} width={280} height={100} />
      </div>

      <div className="mt-2 flex items-center justify-between text-[12px] text-white/65">
        <div className="flex items-center gap-1.5">
          <Sunrise size={14} className="text-olive" />
          <span>{sunTimes.sunrise ? formatTimeShort(sunTimes.sunrise, neighborhood.timezone) : '—'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Sunset size={14} className="text-rose" />
          <span>{sunTimes.sunset ? formatTimeShort(sunTimes.sunset, neighborhood.timezone) : '—'}</span>
        </div>
      </div>
    </div>
  )
}
