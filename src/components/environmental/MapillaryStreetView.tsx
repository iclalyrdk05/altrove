import { useEffect, useRef, useState } from 'react'
import { Viewer } from 'mapillary-js'
import 'mapillary-js/dist/mapillary.css'
import { Footprints } from 'lucide-react'

interface MapillaryStreetViewProps {
  imageId: string
  accessToken: string
  neighborhoodName: string
}

/**
 * Real, walkable street-level imagery via Mapillary — the camera moves
 * between actual captured panoramas along a street (the "sequence"),
 * with direction arrows the viewer hovers/clicks to advance, exactly the
 * walk-the-street interaction Google Street View offers.
 */
export function MapillaryStreetView({ imageId, accessToken, neighborhoodName }: MapillaryStreetViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<Viewer | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return
    setError(null)
    setLoaded(false)

    const viewer = new Viewer({
      container: containerRef.current,
      accessToken,
      imageId,
      component: {
        cover: false,
        bearing: true,
        zoom: true,
      },
    })
    viewerRef.current = viewer

    viewer.on('image', () => setLoaded(true))
    viewer.on('navigable', (e) => {
      if (!e.navigable) setError('Lost connection to street-level imagery.')
    })

    return () => {
      viewerRef.current = null
      viewer.remove()
    }
  }, [imageId, accessToken])

  return (
    <div className="relative h-full w-full bg-[#0c1119]">
      <div ref={containerRef} className="h-full w-full" />

      {!loaded && !error && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#0c1119]">
          <div className="glass-surface-soft rounded-full px-4 py-2 text-[12px] text-white/70">
            Walking into {neighborhoodName}…
          </div>
        </div>
      )}

      {error && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#10151f]">
          <div className="glass-surface rounded-2xl px-5 py-4 text-center text-[13px] text-white/75">
            {error}
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute left-1/2 top-[76px] flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/25 px-3 py-1 text-[10px] font-medium tracking-wide text-white/70 backdrop-blur-sm">
        <Footprints size={11} />
        Real street-level imagery · click the arrows to walk · © Mapillary contributors
      </div>
    </div>
  )
}
