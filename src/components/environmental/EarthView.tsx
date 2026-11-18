import { useEffect, useMemo, useRef, useState } from 'react'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { RotateCcw } from 'lucide-react'
import { useCommunityStore, isMomentActive } from '@/stores/communityStore'
import { useAudioStore } from '@/stores/audioStore'
import { avatarPhotoUrl } from '@/features/community/avatarPhoto'
import { relativeTimeFrom } from '@/utils/units'
import type { Moment, Neighborhood } from '@/types'

interface EarthViewProps {
  neighborhood: Neighborhood
}

const DEFAULT_CAMERA = { zoom: 15.4, pitch: 58, bearing: -18 }

/**
 * FNV-1a — picked over a naive rolling multiply-add specifically because
 * sequential ids (m-1, m-2, m-3…) are near-identical strings, and a weak
 * hash maps near-identical inputs to near-identical outputs, which is what
 * clustered every moment on top of the neighborhood pin before. FNV-1a's
 * per-character XOR+multiply avalanches enough that a one-character id
 * difference still lands on a well-separated angle/radius.
 */
function hashString(id: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** Deterministic scatter around the neighborhood center, spread wide enough to read as "around the area" rather than one tight knot on the pin. */
function jitterFor(id: string, lat: number): { dLat: number; dLon: number } {
  const h = hashString(id)
  const angle = (h % 360) * (Math.PI / 180)
  const radiusMeters = 150 + ((h >>> 9) % 450)
  const dLat = (radiusMeters * Math.cos(angle)) / 111_320
  const dLon = (radiusMeters * Math.sin(angle)) / (111_320 * Math.cos((lat * Math.PI) / 180))
  return { dLat, dLon }
}

/**
 * A real, detailed map of the neighborhood — actual OpenStreetMap data
 * (roads, buildings, parks, water) rendered tilted and in 3D, so each
 * neighborhood reads by its own real layout rather than a generic globe.
 * No API key or billing account required: OpenFreeMap hosts these vector
 * tiles for free, unlike Google/Mapbox satellite imagery.
 *
 * Recent community Moments from this neighborhood are scattered around the
 * center as small avatar markers — Moments are meant to feel like a layer
 * on the place itself, not just a list buried in an overlay.
 */
export function EarthView({ neighborhood }: EarthViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markerRef = useRef<maplibregl.Marker | null>(null)
  const momentMarkersRef = useRef<maplibregl.Marker[]>([])
  // Keyed on moment id so the "seen" effect below can restyle markers in
  // place without ever removing/re-adding them — see that effect's comment.
  const momentNodesRef = useRef<Map<string, { wrap: HTMLDivElement; inner: HTMLButtonElement }>>(new Map())
  // Moment ids whose popup audio is currently ducking the ambient channels — see the popup 'open' handler below.
  const duckingMomentIdsRef = useRef<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  const allMoments = useCommunityStore((s) => s.moments)
  const seenMomentIds = useCommunityStore((s) => s.seenMomentIds)
  const markMomentSeen = useCommunityStore((s) => s.markMomentSeen)
  const moments = useMemo(
    () => allMoments.filter((m) => m.neighborhoodId === neighborhood.id && isMomentActive(m)).slice(0, 12),
    [allMoments, neighborhood.id],
  )

  useEffect(() => {
    if (!containerRef.current) return
    setError(null)
    setLoaded(false)

    let map: maplibregl.Map
    try {
      map = new maplibregl.Map({
        container: containerRef.current,
        style: 'https://tiles.openfreemap.org/styles/liberty',
        center: [neighborhood.lon, neighborhood.lat],
        zoom: DEFAULT_CAMERA.zoom,
        pitch: DEFAULT_CAMERA.pitch,
        bearing: DEFAULT_CAMERA.bearing,
        attributionControl: { compact: true },
        dragRotate: true,
        touchZoomRotate: true,
      })
    } catch {
      setError('Earth view failed to initialize in this browser.')
      return
    }

    mapRef.current = map
    const marker = new maplibregl.Marker({ color: '#c75b56' })
      .setLngLat([neighborhood.lon, neighborhood.lat])
      .addTo(map)
    markerRef.current = marker

    map.on('load', () => setLoaded(true))
    map.on('error', (e: { error?: { message?: string } }) => {
      if (/tile|source|style/i.test(String(e?.error?.message))) {
        setError('The map is temporarily unavailable.')
      }
    })

    return () => {
      marker.remove()
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
  }, [neighborhood.id, neighborhood.lat, neighborhood.lon])

  // Moment markers are managed separately so a new simulated Moment arriving
  // doesn't tear down and rebuild the whole map underneath it.
  //
  // IMPORTANT: the element passed to `new maplibregl.Marker({element})` is
  // positioned by MapLibre itself via an inline `transform` it updates every
  // frame. A CSS transition/hover-scale on that exact node fights that inline
  // transform and is what caused the click "glitch" — the icon would visibly
  // lag/jump because the browser tried to animate between MapLibre's own
  // position updates. The fix: that outer node stays untouched (no classes,
  // no transitions) and all visual styling/animation lives on an inner child.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    momentMarkersRef.current.forEach((m) => m.remove())
    momentNodesRef.current.clear()
    momentMarkersRef.current = moments.map((moment) => {
      const { dLat, dLon } = jitterFor(moment.id, neighborhood.lat)
      const seen = !!seenMomentIds[moment.id]

      const wrap = document.createElement('div')
      wrap.style.cursor = 'pointer'

      const inner = document.createElement('button')
      inner.setAttribute('aria-label', `Moment from ${moment.authorName}`)
      wrap.appendChild(inner)
      applyMarkerLook(inner, moment, seen)
      momentNodesRef.current.set(moment.id, { wrap, inner })

      const popup = new maplibregl.Popup({
        offset: seen ? 12 : 20,
        closeButton: false,
        maxWidth: '230px',
        className: 'moment-popup',
      }).setHTML(momentPopupHtml(moment))

      inner.addEventListener('click', () => markMomentSeen(moment.id))

      // Ducks Local Radio / Street / Weather while this popup's audio
      // plays, same as the Moments list — the audio tag only exists once
      // the popup DOM is actually mounted, hence wiring it on 'open'.
      if (moment.audioUrl) {
        popup.on('open', () => {
          const audioEl = popup.getElement()?.querySelector('audio')
          if (!audioEl) return
          audioEl.addEventListener('play', () => {
            if (duckingMomentIdsRef.current.has(moment.id)) return
            duckingMomentIdsRef.current.add(moment.id)
            useAudioStore.getState().requestDuck()
          })
          const release = () => {
            if (!duckingMomentIdsRef.current.has(moment.id)) return
            duckingMomentIdsRef.current.delete(moment.id)
            useAudioStore.getState().releaseDuck()
          }
          audioEl.addEventListener('pause', release)
          audioEl.addEventListener('ended', release)
        })
      }

      return new maplibregl.Marker({ element: wrap })
        .setLngLat([neighborhood.lon + dLon, neighborhood.lat + dLat])
        .setPopup(popup)
        .addTo(map)
    })

    return () => {
      momentMarkersRef.current.forEach((m) => m.remove())
      momentMarkersRef.current = []
      momentNodesRef.current.clear()
      // Markers (and any open popup audio inside them) are being torn out
      // of the DOM, which doesn't reliably fire the audio element's own
      // pause event — release anything still ducking on their behalf.
      duckingMomentIdsRef.current.forEach(() => useAudioStore.getState().releaseDuck())
      duckingMomentIdsRef.current.clear()
    }
  }, [moments, neighborhood.id, neighborhood.lat, neighborhood.lon, loaded, markMomentSeen])

  // Restyles already-placed markers in place when their seen state changes,
  // instead of removing/re-adding them (which would reintroduce the glitch).
  useEffect(() => {
    momentNodesRef.current.forEach(({ inner }, id) => {
      const moment = moments.find((m) => m.id === id)
      if (moment) applyMarkerLook(inner, moment, !!seenMomentIds[id])
    })
  }, [seenMomentIds, moments])

  function resetView() {
    mapRef.current?.flyTo({
      center: [neighborhood.lon, neighborhood.lat],
      zoom: DEFAULT_CAMERA.zoom,
      pitch: DEFAULT_CAMERA.pitch,
      bearing: DEFAULT_CAMERA.bearing,
      duration: 900,
    })
  }

  return (
    <div className="relative h-full w-full bg-[#0c1119]">
      <div ref={containerRef} className="h-full w-full" />

      {!loaded && !error && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="glass-surface-soft rounded-full px-4 py-2 text-[12px] text-white/70">
            Positioning over {neighborhood.name}…
          </div>
        </div>
      )}

      {error && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#10151f]">
          <div className="glass-surface rounded-2xl px-5 py-4 text-center text-[13px] text-white/75">
            {error}
            <div className="mt-1 text-[11px] text-white/45">Street and Atmosphere remain available.</div>
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute left-1/2 top-[76px] -translate-x-1/2 rounded-full bg-black/25 px-3 py-1 text-[10px] font-medium tracking-wide text-white/70 backdrop-blur-sm">
        Real map · drag to orbit · scroll to zoom
        {moments.length > 0 && ` · ${moments.length} moment${moments.length === 1 ? '' : 's'} nearby`}
      </div>

      <button
        onClick={resetView}
        className="glass-surface-soft absolute bottom-6 right-6 flex h-9 w-9 items-center justify-center rounded-full text-white/80 hover:text-white"
        aria-label="Reset view"
        title="Reset view"
      >
        <RotateCcw size={15} />
      </button>
    </div>
  )
}

/** Mutates an existing marker's inner button in place — full avatar photo when unseen, a plain dot once viewed. */
function applyMarkerLook(inner: HTMLButtonElement, moment: Moment, seen: boolean) {
  if (seen) {
    inner.className =
      'block h-2.5 w-2.5 rounded-full border border-white/60 bg-white/75 shadow-[0_0_0_4px_rgba(0,0,0,0.25)] transition-transform hover:scale-125'
    inner.style.backgroundImage = ''
  } else {
    inner.className =
      'block h-9 w-9 overflow-hidden rounded-full border-2 bg-[#2a1f22] shadow-[0_4px_16px_rgba(0,0,0,0.5)] transition-transform hover:scale-110'
    inner.style.borderColor = 'rgba(230,197,202,0.65)'
    inner.style.backgroundImage = `url(${avatarPhotoUrl(moment.authorId ?? moment.id)})`
    inner.style.backgroundSize = 'cover'
    inner.style.backgroundPosition = 'center'
  }
}

function momentPopupHtml(moment: Moment) {
  const note = escapeHtml(moment.note)
  const name = escapeHtml(moment.authorName)
  const time = escapeHtml(relativeTimeFrom(moment.createdAt))
  const photo = avatarPhotoUrl(moment.authorId ?? moment.id)
  const image = moment.imageUrl
    ? `<img src="${escapeHtml(moment.imageUrl)}" style="margin-top:8px;width:100%;max-height:120px;object-fit:cover;border-radius:10px;display:block;" />`
    : ''
  const audio = moment.audioUrl
    ? `<audio controls src="${escapeHtml(moment.audioUrl)}" style="margin-top:8px;width:100%;height:28px;display:block;"></audio>`
    : ''
  return `
    <div style="font-family:inherit;display:flex;gap:8px;">
      <img src="${photo}" style="width:30px;height:30px;border-radius:50%;object-fit:cover;flex-shrink:0;" />
      <div style="min-width:0;">
        <p style="margin:0;font-size:12.5px;font-weight:600;color:#f3e9ea;">${name} <span style="font-weight:400;color:rgba(230,197,202,0.6);">· ${time}</span></p>
        <p style="margin:4px 0 0;font-size:12px;line-height:1.4;color:rgba(255,255,255,0.78);">${note}</p>
        ${image}${audio}
      </div>
    </div>
  `
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
}
