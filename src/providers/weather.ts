import type { HourlyPoint, SkyCondition, WeatherData } from '@/types'

const WMO_MAP: Record<number, { condition: SkyCondition; label: string }> = {
  0: { condition: 'clear', label: 'Clear Sky' },
  1: { condition: 'sunny', label: 'Mostly Clear' },
  2: { condition: 'partly-cloudy', label: 'Partly Cloudy' },
  3: { condition: 'cloudy', label: 'Overcast' },
  45: { condition: 'fog', label: 'Fog' },
  48: { condition: 'fog', label: 'Depositing Rime Fog' },
  51: { condition: 'rain', label: 'Light Drizzle' },
  53: { condition: 'rain', label: 'Drizzle' },
  55: { condition: 'rain', label: 'Dense Drizzle' },
  56: { condition: 'rain', label: 'Freezing Drizzle' },
  57: { condition: 'rain', label: 'Freezing Drizzle' },
  61: { condition: 'rain', label: 'Light Rain' },
  63: { condition: 'rain', label: 'Rain' },
  65: { condition: 'rain', label: 'Heavy Rain' },
  66: { condition: 'rain', label: 'Freezing Rain' },
  67: { condition: 'rain', label: 'Freezing Rain' },
  71: { condition: 'snow', label: 'Light Snow' },
  73: { condition: 'snow', label: 'Snow' },
  75: { condition: 'snow', label: 'Heavy Snow' },
  77: { condition: 'snow', label: 'Snow Grains' },
  80: { condition: 'rain', label: 'Light Showers' },
  81: { condition: 'rain', label: 'Showers' },
  82: { condition: 'rain', label: 'Violent Showers' },
  85: { condition: 'snow', label: 'Snow Showers' },
  86: { condition: 'snow', label: 'Heavy Snow Showers' },
  95: { condition: 'storm', label: 'Thunderstorm' },
  96: { condition: 'storm', label: 'Thunderstorm with Hail' },
  99: { condition: 'storm', label: 'Severe Thunderstorm' },
}

function resolveCondition(code: number) {
  return WMO_MAP[code] ?? { condition: 'cloudy' as SkyCondition, label: 'Unsettled' }
}

export class WeatherFetchError extends Error {}

export async function fetchWeather(lat: number, lon: number, signal?: AbortSignal): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current:
      'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,cloud_cover,precipitation,is_day,visibility',
    hourly: 'temperature_2m,precipitation_probability,weather_code',
    daily: 'sunrise,sunset',
    timezone: 'auto',
    forecast_days: '1',
  })

  let res: Response
  try {
    res = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`, { signal })
  } catch {
    throw new WeatherFetchError('Weather service unreachable')
  }
  if (!res.ok) throw new WeatherFetchError(`Weather service returned ${res.status}`)

  const json = await res.json()
  const current = json.current
  if (!current) throw new WeatherFetchError('Malformed weather response')

  const { condition, label } = resolveCondition(current.weather_code)

  const hourlyTimes: string[] = json.hourly?.time ?? []
  const hourlyTemps: number[] = json.hourly?.temperature_2m ?? []
  const hourlyPrecip: number[] = json.hourly?.precipitation_probability ?? []
  const hourlyCodes: number[] = json.hourly?.weather_code ?? []

  const nowIndex = hourlyTimes.findIndex((t) => new Date(t).getTime() >= Date.now())
  const startIndex = Math.max(0, nowIndex)
  const hourly: HourlyPoint[] = hourlyTimes.slice(startIndex, startIndex + 8).map((t, i) => {
    const idx = startIndex + i
    return {
      time: t,
      temperatureC: hourlyTemps[idx],
      precipitationProbability: hourlyPrecip[idx] ?? 0,
      condition: resolveCondition(hourlyCodes[idx] ?? 0).condition,
    }
  })

  return {
    temperatureC: current.temperature_2m,
    apparentTemperatureC: current.apparent_temperature,
    condition,
    conditionLabel: label,
    humidity: current.relative_humidity_2m,
    windSpeedKmh: current.wind_speed_10m,
    windDirectionDeg: current.wind_direction_10m,
    pressureHpa: current.surface_pressure,
    visibilityKm: typeof current.visibility === 'number' ? current.visibility / 1000 : null,
    precipitationMm: current.precipitation ?? 0,
    cloudCoverPct: current.cloud_cover ?? 0,
    isDay: current.is_day === 1,
    sunrise: json.daily?.sunrise?.[0] ?? '',
    sunset: json.daily?.sunset?.[0] ?? '',
    hourly,
    fetchedAt: new Date().toISOString(),
  }
}

export interface GeocodeResult {
  id: number
  name: string
  admin1?: string
  country: string
  lat: number
  lon: number
  timezone: string
}

export async function searchPlaces(query: string, signal?: AbortSignal): Promise<GeocodeResult[]> {
  if (!query.trim()) return []
  const params = new URLSearchParams({ name: query, count: '8', language: 'en', format: 'json' })
  let res: Response
  try {
    res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params.toString()}`, { signal })
  } catch {
    return []
  }
  if (!res.ok) return []
  const json = await res.json()
  const results = json.results ?? []
  return results.map((r: any) => ({
    id: r.id,
    name: r.name,
    admin1: r.admin1,
    country: r.country,
    lat: r.latitude,
    lon: r.longitude,
    timezone: r.timezone,
  }))
}
