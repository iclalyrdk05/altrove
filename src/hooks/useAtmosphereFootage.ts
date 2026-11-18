import { useEffect, useState } from 'react'
import { getPexelsApiKey, searchAtmosphereVideo, PexelsError } from '@/providers/pexels'
import { buildFootageQueries } from '@/features/atmosphere/footageQuery'
import type { SkyCondition } from '@/types'

interface FootageState {
  status: 'disabled' | 'loading' | 'found' | 'not-found' | 'error'
  videoUrl: string | null
}

// Shared across every mount of the Atmosphere view for the session — the
// same (city, condition, time-of-day) combination shouldn't re-hit the API
// every time the user flips back to this perspective.
const cache = new Map<string, string | null>()

export function useAtmosphereFootage(cityName: string, condition: SkyCondition, isDay: boolean, daylightProgress: number | null) {
  const apiKey = getPexelsApiKey()
  const cacheKey = `${cityName}|${condition}|${isDay}|${daylightProgress !== null && (daylightProgress < 0.08 || daylightProgress > 0.88) ? 'golden' : 'normal'}`

  const [state, setState] = useState<FootageState>(() => {
    if (!apiKey) return { status: 'disabled', videoUrl: null }
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey)!
      return { status: cached ? 'found' : 'not-found', videoUrl: cached }
    }
    return { status: 'loading', videoUrl: null }
  })

  useEffect(() => {
    if (!apiKey) {
      setState({ status: 'disabled', videoUrl: null })
      return
    }
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey)!
      setState({ status: cached ? 'found' : 'not-found', videoUrl: cached })
      return
    }

    setState({ status: 'loading', videoUrl: null })
    const controller = new AbortController()
    const queries = buildFootageQueries(condition, isDay, daylightProgress, cityName)

    async function run() {
      for (const query of queries) {
        try {
          const url = await searchAtmosphereVideo(query, apiKey!, controller.signal)
          if (url) return url
        } catch (err) {
          if (controller.signal.aborted) throw err
          if (err instanceof PexelsError) throw err
        }
      }
      return null
    }

    run()
      .then((url) => {
        if (controller.signal.aborted) return
        cache.set(cacheKey, url)
        setState({ status: url ? 'found' : 'not-found', videoUrl: url })
      })
      .catch(() => {
        if (controller.signal.aborted) return
        setState({ status: 'error', videoUrl: null })
      })

    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey])

  return state
}
