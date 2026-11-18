import { Suspense, lazy, useEffect, useState } from 'react'
import { getMapillaryToken } from '@/providers/mapillary'
import { getCesiumIonToken } from '@/providers/cesiumToken'
import { useMapillaryCoverage } from '@/hooks/useMapillaryCoverage'
import { getStreetWalkFootage } from '@/features/street/realWalkFootage'
import { StreetFootageView } from './StreetFootageView'
import { StreetView } from './StreetView'
import type { Neighborhood } from '@/types'

// Both mapillary-js and cesium are sizeable WebGL dependencies — load each
// only on the path that actually needs it, not on every Street view.
const MapillaryStreetView = lazy(() => import('./MapillaryStreetView').then((m) => ({ default: m.MapillaryStreetView })))
const CesiumStreetWalk = lazy(() => import('./CesiumStreetWalk').then((m) => ({ default: m.CesiumStreetWalk })))

interface StreetPerspectiveProps {
  neighborhood: Neighborhood
  isDay: boolean
  daylightProgress: number | null
}

function LoadingState({ text }: { text: string }) {
  return (
    <div className="relative flex h-full w-full items-center justify-center bg-[#0c1119]">
      <div className="glass-surface-soft rounded-full px-4 py-2 text-[12px] text-white/70">{text}</div>
    </div>
  )
}

/**
 * Street-level view, in priority order:
 *  1. A real, eye-level walking/street video for this exact neighborhood,
 *     where one has been sourced (quiet, continuous — the YouTube
 *     "walking tour" genre, not an interactive photo or 3D reconstruction).
 *  2. Mapillary real photo panoramas, where coverage exists (sharp stills,
 *     navigable, but patchy coverage and not a continuous video).
 *  3. A free-roam Cesium 3D walkthrough (lower visual fidelity, but
 *     near-global coverage).
 *  4. The original illustrated scene, so Street is never a dead view.
 * Each tier is only attempted if available/configured; none is required.
 * The real tilted street map lives in the Earth perspective instead (see
 * EarthView) — Street stays dedicated to eye-level/photographic imagery.
 */
export function StreetPerspective({ neighborhood, isDay, daylightProgress }: StreetPerspectiveProps) {
  const mapillaryToken = getMapillaryToken()
  const cesiumToken = getCesiumIonToken()
  const coverage = useMapillaryCoverage(neighborhood.lat, neighborhood.lon)
  const walkFootage = getStreetWalkFootage(neighborhood.id, isDay, daylightProgress)
  const [walkFootageFailed, setWalkFootageFailed] = useState(false)

  useEffect(() => {
    setWalkFootageFailed(false)
  }, [neighborhood.id, walkFootage?.src])

  if (walkFootage && !walkFootageFailed) {
    return (
      <StreetFootageView
        footage={walkFootage}
        neighborhoodName={neighborhood.name}
        onError={() => setWalkFootageFailed(true)}
      />
    )
  }

  if (mapillaryToken && coverage.status === 'loading') {
    return <LoadingState text={`Looking for street-level imagery near ${neighborhood.name}…`} />
  }

  if (mapillaryToken && coverage.status === 'found' && coverage.imageId) {
    return (
      <Suspense fallback={<LoadingState text={`Walking into ${neighborhood.name}…`} />}>
        <MapillaryStreetView imageId={coverage.imageId} accessToken={mapillaryToken} neighborhoodName={neighborhood.name} />
      </Suspense>
    )
  }

  if (cesiumToken) {
    return (
      <Suspense fallback={<LoadingState text={`Loading the 3D walkthrough of ${neighborhood.name}…`} />}>
        <CesiumStreetWalk neighborhood={neighborhood} accessToken={cesiumToken} />
      </Suspense>
    )
  }

  // No tokens configured, or Mapillary came back empty with no Cesium fallback —
  // land on the illustrated scene so Street is never a dead view.
  return (
    <StreetView
      neighborhood={neighborhood}
      isDay={isDay}
      fallbackReason={mapillaryToken ? (coverage.message ?? undefined) : undefined}
    />
  )
}
