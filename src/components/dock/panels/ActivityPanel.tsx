import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { relativeTimeFrom } from '@/utils/units'
import { clsx } from '@/utils/clsx'
import type { ActivityInfo, ActivityLevel } from '@/types'

const SCALE: ActivityLevel[] = ['quiet', 'light', 'moderate', 'busy', 'very-busy']
const SCALE_LABEL: Record<ActivityLevel, string> = {
  quiet: 'Quiet',
  light: 'Light',
  moderate: 'Moderate',
  busy: 'Busy',
  'very-busy': 'Very Busy',
  unavailable: 'Unavailable',
}

export function ActivityPanel({ activity }: { activity: ActivityInfo }) {
  const index = SCALE.indexOf(activity.level)

  return (
    <div className="w-[300px] p-5">
      <p className="text-[12px] font-medium tracking-[0.04em] text-white/45">Area Activity</p>
      <div className="mt-2 flex items-center gap-2">
        <p className="text-[24px] font-semibold text-white">{SCALE_LABEL[activity.level]}</p>
        {activity.trend && (
          <span className="text-white/40">
            {activity.trend === 'rising' && <TrendingUp size={16} />}
            {activity.trend === 'falling' && <TrendingDown size={16} />}
            {activity.trend === 'steady' && <Minus size={16} />}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center gap-1.5">
        {SCALE.map((level, i) => (
          <div
            key={level}
            className={clsx(
              'h-1.5 flex-1 rounded-full transition-colors',
              i <= index ? 'bg-rose' : 'bg-white/10',
            )}
          />
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] text-white/35">
        <span>Quiet</span>
        <span>Very Busy</span>
      </div>

      <div className="mt-4 space-y-1.5 text-[12px] text-white/50">
        <p>Source: {activity.source}</p>
        <p>Updated {relativeTimeFrom(activity.updatedAt)}</p>
        {activity.isSimulated && (
          <p className="mt-2 rounded-lg bg-white/5 px-2.5 py-1.5 text-[11px] text-white/40">
            No live crowd-density provider is connected — this level is simulated for demonstration.
          </p>
        )}
      </div>
    </div>
  )
}
