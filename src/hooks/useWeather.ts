import { useEffect, useRef, useState } from 'react'
import { fetchWeather, WeatherFetchError } from '@/providers/weather'
import type { WeatherData } from '@/types'

interface WeatherHookState {
  data: WeatherData | null
  loading: boolean
  error: string | null
}

export function useWeather(lat: number, lon: number) {
  const [state, setState] = useState<WeatherHookState>({ data: null, loading: true, error: null })
  const cache = useRef<Map<string, WeatherData>>(new Map())

  useEffect(() => {
    const key = `${lat.toFixed(3)},${lon.toFixed(3)}`
    const cached = cache.current.get(key)
    if (cached) {
      setState({ data: cached, loading: false, error: null })
    } else {
      setState({ data: null, loading: true, error: null })
    }

    const controller = new AbortController()
    fetchWeather(lat, lon, controller.signal)
      .then((data) => {
        cache.current.set(key, data)
        setState({ data, loading: false, error: null })
      })
      .catch((err) => {
        if (controller.signal.aborted) return
        const message = err instanceof WeatherFetchError ? err.message : 'Weather unavailable'
        setState((s) => ({ data: s.data, loading: false, error: message }))
      })

    return () => controller.abort()
  }, [lat, lon])

  return state
}
