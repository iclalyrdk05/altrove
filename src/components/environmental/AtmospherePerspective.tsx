import { useState, useEffect } from 'react'
import { useAtmosphereFootage } from '@/hooks/useAtmosphereFootage'
import { getLocalFootage } from '@/features/atmosphere/localFootage'
import { pickCityFootage } from '@/features/atmosphere/cityFootage'
import { AtmosphereFootageView } from './AtmosphereFootageView'
import { AtmosphereView } from './AtmosphereView'
import type { SkyCondition } from '@/types'

interface AtmospherePerspectiveProps {
  neighborhoodId: string
  /** The searched/curated place's own name (e.g. "Paris") — used to match footage for a place that was only ever searched, not added to the curated neighborhood list. */
  placeName: string
  cityName: string
  condition: SkyCondition
  isDay: boolean
  daylightProgress: number | null
  windSpeedKmh: number
  reducedMotion: boolean
}

const PRECIPITATION_CONDITIONS: SkyCondition[] = ['storm', 'rain', 'snow', 'fog']

/**
 * Real footage always wins over the illustrated scene, in priority order:
 *  1. A curated, verified real video of THIS neighborhood's own city
 *     (Wikimedia Commons) — used whenever the sky itself isn't the story
 *     (not rain/snow/storm/fog), so Atmosphere never shows something
 *     unmistakably wrong for the place, like mountains standing in for NYC.
 *  2. Pexels, if a key is configured — a dynamic, unverified search match,
 *     only reached when step 1 has no curated clip for this neighborhood.
 *  3. A bundled generic real video clip matching the current condition
 *     (rain/snow/storm/fog genuinely don't need to be "that city" to read
 *     as true) — ships with the app, zero setup.
 *  4. The illustrated CSS/canvas scene, only if a <video> genuinely can't
 *     play in this browser.
 */
export function AtmospherePerspective({
  neighborhoodId,
  placeName,
  cityName,
  condition,
  isDay,
  daylightProgress,
  windSpeedKmh,
  reducedMotion,
}: AtmospherePerspectiveProps) {
  const isSkyCondition = !PRECIPITATION_CONDITIONS.includes(condition)
  const cityFootage = isSkyCondition ? pickCityFootage(neighborhoodId, isDay, daylightProgress, placeName) : undefined

  const pexels = useAtmosphereFootage(cityName, condition, isDay, daylightProgress)
  const local = getLocalFootage(neighborhoodId, condition, isDay, daylightProgress, placeName)
  const [cityFootageFailed, setCityFootageFailed] = useState(false)
  const [localFailed, setLocalFailed] = useState(false)

  useEffect(() => {
    setCityFootageFailed(false)
  }, [cityFootage?.src])

  useEffect(() => {
    setLocalFailed(false)
  }, [local.src])

  if (cityFootage && !cityFootageFailed) {
    return (
      <AtmosphereFootageView
        videoUrl={cityFootage.src}
        condition={condition}
        isDay={isDay}
        daylightProgress={daylightProgress}
        windSpeedKmh={windSpeedKmh}
        reducedMotion={reducedMotion}
        onError={() => setCityFootageFailed(true)}
      />
    )
  }

  if (!cityFootage && pexels.status === 'found' && pexels.videoUrl) {
    return (
      <AtmosphereFootageView
        videoUrl={pexels.videoUrl}
        condition={condition}
        isDay={isDay}
        daylightProgress={daylightProgress}
        windSpeedKmh={windSpeedKmh}
        reducedMotion={reducedMotion}
      />
    )
  }

  if (!localFailed) {
    return (
      <AtmosphereFootageView
        videoUrl={local.src}
        condition={condition}
        isDay={isDay}
        daylightProgress={daylightProgress}
        windSpeedKmh={windSpeedKmh}
        reducedMotion={reducedMotion}
        onError={() => setLocalFailed(true)}
      />
    )
  }

  return (
    <AtmosphereView
      condition={condition}
      isDay={isDay}
      daylightProgress={daylightProgress}
      windSpeedKmh={windSpeedKmh}
      reducedMotion={reducedMotion}
    />
  )
}
