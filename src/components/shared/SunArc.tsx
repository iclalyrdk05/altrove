interface SunArcProps {
  progress: number | null // 0..1 across daylight, null if night
  isDay: boolean
  width?: number
  height?: number
}

export function SunArc({ progress, isDay, width = 220, height = 90 }: SunArcProps) {
  const pad = 14
  const r = (width - pad * 2) / 2
  const cx = width / 2
  const cy = height - 6

  const p = progress ?? 0
  const angle = Math.PI - p * Math.PI
  const sunX = cx + r * Math.cos(angle)
  const sunY = cy - r * Math.sin(angle)

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none">
      <path
        d={`M ${pad} ${cy} A ${r} ${r} 0 0 1 ${width - pad} ${cy}`}
        stroke="rgba(255,255,255,0.22)"
        strokeWidth={1.5}
        strokeDasharray="2 5"
        strokeLinecap="round"
      />
      {isDay && (
        <path
          d={`M ${pad} ${cy} A ${r} ${r} 0 0 1 ${sunX} ${sunY}`}
          stroke="rgba(205,186,123,0.85)"
          strokeWidth={2}
          strokeLinecap="round"
        />
      )}
      <circle cx={pad} cy={cy} r={2} fill="rgba(255,255,255,0.45)" />
      <circle cx={width - pad} cy={cy} r={2} fill="rgba(255,255,255,0.45)" />
      {isDay ? (
        <circle cx={sunX} cy={sunY} r={6} fill="#cdba7b" style={{ filter: 'drop-shadow(0 0 6px rgba(205,186,123,0.8))' }} />
      ) : (
        <circle cx={cx} cy={cy + 4} r={5} fill="#79889b" opacity={0.7} />
      )}
    </svg>
  )
}
