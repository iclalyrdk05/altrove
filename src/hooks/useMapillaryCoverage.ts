import { useEffect, useState } from 'react'
import { findNearestImage, getMapillaryToken, MapillaryError } from '@/providers/mapillary'

interface CoverageState {
  status: 'disabled' | 'loading' | 'found' | 'not-found' | 'error'
  imageId: string | null
  message: string | null
}

export function useMapillaryCoverage(lat: number, lon: number) {
  const token = getMapillaryToken()
  const [state, setState] = useState<CoverageState>(() =>
    token ? { status: 'loading', imageId: null, message: null } : { status: 'disabled', imageId: null, message: null },
  )

  useEffect(() => {
    if (!token) {
      setState({ status: 'disabled', imageId: null, message: null })
      return
    }
    setState({ status: 'loading', imageId: null, message: null })
    const controller = new AbortController()
    findNearestImage(lat, lon, token, controller.signal)
      .then((imageId) => {
        if (controller.signal.aborted) return
        setState(
          imageId
            ? { status: 'found', imageId, message: null }
            : { status: 'not-found', imageId: null, message: 'No street-level imagery captured near here yet.' },
        )
      })
      .catch((err) => {
        if (controller.signal.aborted) return
        const message = err instanceof MapillaryError ? err.message : 'Street-level imagery unavailable'
        setState({ status: 'error', imageId: null, message })
      })
    return () => controller.abort()
  }, [lat, lon, token])

  return state
}
