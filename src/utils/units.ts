export function formatTemperature(celsius: number, unit: 'C' | 'F') {
  const value = unit === 'F' ? celsius * 1.8 + 32 : celsius
  return `${Math.round(value)}°${unit}`
}

export function formatWind(kmh: number, unit: 'kmh' | 'mph') {
  const value = unit === 'mph' ? kmh * 0.621371 : kmh
  return `${Math.round(value)} ${unit === 'mph' ? 'mph' : 'km/h'}`
}

export function windDirectionLabel(deg: number) {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  return dirs[Math.round(deg / 22.5) % 16]
}

export function relativeTimeFrom(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.round(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  return `${days}d ago`
}
