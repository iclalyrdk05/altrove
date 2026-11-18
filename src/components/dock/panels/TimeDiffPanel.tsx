import { useUserStore } from '@/stores/userStore'
import { formatTimeShort, getTimeDifference } from '@/utils/time'
import { clsx } from '@/utils/clsx'
import type { Neighborhood } from '@/types'

interface TimeDiffPanelProps {
  neighborhood: Neighborhood
  now: Date
}

const QUICK_REFS = [
  { label: 'My Location', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone },
  { label: 'New York', timezone: 'America/New_York' },
  { label: 'London', timezone: 'Europe/London' },
  { label: 'Tokyo', timezone: 'Asia/Tokyo' },
]

export function TimeDiffPanel({ neighborhood, now }: TimeDiffPanelProps) {
  const preferences = useUserStore((s) => s.preferences)
  const setPreferences = useUserStore((s) => s.setPreferences)
  const diff = getTimeDifference(now, neighborhood.timezone, preferences.referenceTimezone)

  return (
    <div className="w-[320px] p-5">
      <p className="text-[12px] font-medium tracking-[0.04em] text-white/45">Time Difference</p>

      <div className="mt-3 flex items-center justify-between rounded-2xl bg-white/5 p-3">
        <div>
          <p className="text-[11px] text-white/45">{neighborhood.name}</p>
          <p className="text-[20px] font-semibold text-white">{formatTimeShort(now, neighborhood.timezone)}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-white/45">{preferences.referenceLabel}</p>
          <p className="text-[20px] font-semibold text-white">{formatTimeShort(now, preferences.referenceTimezone)}</p>
        </div>
      </div>

      <p className="mt-3 text-[13px] leading-snug text-white/70">
        {neighborhood.name} is{' '}
        <span className="font-medium text-white">
          {diff.label === 'Same time' ? 'in sync with' : `${diff.label.replace('+', '')} ${diff.label.startsWith('-') ? 'behind' : 'ahead of'}`}
        </span>{' '}
        {preferences.referenceLabel}
        {diff.dayRelation !== 'same day' && <> — {diff.dayRelation}</>}.
      </p>

      <p className="mt-4 text-[12px] font-medium tracking-[0.04em] text-white/40">Reference location</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {QUICK_REFS.map((ref) => (
          <button
            key={ref.timezone}
            onClick={() => setPreferences({ referenceTimezone: ref.timezone, referenceLabel: ref.label })}
            className={clsx(
              'rounded-full px-3 py-1.5 text-[12px] transition-colors',
              preferences.referenceTimezone === ref.timezone
                ? 'bg-white/25 text-white'
                : 'bg-white/8 text-white/60 hover:bg-white/15',
            )}
          >
            {ref.label}
          </button>
        ))}
      </div>
    </div>
  )
}
