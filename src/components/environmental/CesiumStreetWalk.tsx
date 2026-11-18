import { useEffect, useRef, useState } from 'react'
import { Footprints } from 'lucide-react'
import type { Neighborhood } from '@/types'

interface CesiumStreetWalkProps {
  neighborhood: Neighborhood
  accessToken: string
}

const EYE_HEIGHT_M = 1.7
const WALK_SPEED_MPS = 4
const LOOK_SPEED_RAD_PER_S = 1.4

const MOVE_KEYS = new Set(['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'q', 'e'])

/**
 * Free-roam 3D walkthrough using Cesium's free (ion) global terrain + OSM
 * Buildings — real 3D massing and street layout everywhere, but NOT
 * Google's proprietary photorealistic photogrammetry: building walls here
 * are extruded footprints with flat/satellite shading, not photo-textured.
 * That's the honest fidelity tradeoff of the free tier vs. a billed
 * Google Photorealistic 3D Tiles key.
 */
export function CesiumStreetWalk({ neighborhood, accessToken }: CesiumStreetWalkProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    let cancelled = false
    let cleanupFns: Array<() => void> = []

    setStatus('loading')
    setErrorMessage(null)

    import('cesium').then(async (Cesium) => {
      if (cancelled || !containerRef.current) return

      Cesium.Ion.defaultAccessToken = accessToken

      let viewer: InstanceType<typeof Cesium.Viewer>
      try {
        viewer = new Cesium.Viewer(containerRef.current, {
          terrain: Cesium.Terrain.fromWorldTerrain(),
          baseLayerPicker: false,
          timeline: false,
          animation: false,
          geocoder: false,
          homeButton: false,
          sceneModePicker: false,
          navigationHelpButton: false,
          fullscreenButton: false,
          infoBox: false,
          selectionIndicator: false,
        })
      } catch {
        if (!cancelled) {
          setStatus('error')
          setErrorMessage('This browser could not start the 3D walkthrough (WebGL required).')
        }
        return
      }

      viewer.scene.globe.depthTestAgainstTerrain = true

      try {
        const buildings = await Cesium.createOsmBuildingsAsync()
        if (cancelled) {
          viewer.destroy()
          return
        }
        viewer.scene.primitives.add(buildings)
      } catch {
        // Buildings are an enhancement, not a requirement — terrain-only walk still works.
      }

      const lon = neighborhood.lon
      const lat = neighborhood.lat
      let groundHeight = 0
      try {
        const [sampled] = await Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, [
          Cesium.Cartographic.fromDegrees(lon, lat),
        ])
        groundHeight = sampled.height ?? 0
      } catch {
        // fall back to sea level if sampling fails
      }

      if (cancelled) {
        viewer.destroy()
        return
      }

      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(lon, lat, groundHeight + EYE_HEIGHT_M),
        orientation: { heading: 0, pitch: 0, roll: 0 },
      })

      const pressed = new Set<string>()
      function onKeyDown(e: KeyboardEvent) {
        const key = e.key.toLowerCase()
        if (MOVE_KEYS.has(key)) {
          pressed.add(key)
          e.preventDefault()
        }
      }
      function onKeyUp(e: KeyboardEvent) {
        pressed.delete(e.key.toLowerCase())
      }
      window.addEventListener('keydown', onKeyDown)
      window.addEventListener('keyup', onKeyUp)
      cleanupFns.push(() => window.removeEventListener('keydown', onKeyDown))
      cleanupFns.push(() => window.removeEventListener('keyup', onKeyUp))

      let lastFrameMs = performance.now()
      const onTick = () => {
        const nowMs = performance.now()
        const dt = Math.min(0.1, (nowMs - lastFrameMs) / 1000)
        lastFrameMs = nowMs
        const step = WALK_SPEED_MPS * dt
        const turn = LOOK_SPEED_RAD_PER_S * dt

        if (pressed.has('w') || pressed.has('arrowup')) viewer.camera.moveForward(step)
        if (pressed.has('s') || pressed.has('arrowdown')) viewer.camera.moveBackward(step)
        if (pressed.has('a')) viewer.camera.moveLeft(step)
        if (pressed.has('d')) viewer.camera.moveRight(step)
        if (pressed.has('q') || pressed.has('arrowleft')) viewer.camera.lookLeft(turn)
        if (pressed.has('e') || pressed.has('arrowright')) viewer.camera.lookRight(turn)

        // keep the camera walking along the ground instead of floating or clipping
        if (viewer.scene.sampleHeightSupported) {
          try {
            const cartographic = Cesium.Cartographic.fromCartesian(viewer.camera.position)
            const sampled = viewer.scene.sampleHeight(cartographic)
            if (sampled !== undefined) {
              viewer.camera.position = Cesium.Cartesian3.fromRadians(
                cartographic.longitude,
                cartographic.latitude,
                sampled + EYE_HEIGHT_M,
              )
            }
          } catch {
            // surface not ready under the camera yet — skip this frame's clamp
          }
        }
      }
      viewer.clock.onTick.addEventListener(onTick)
      cleanupFns.push(() => viewer.clock.onTick.removeEventListener(onTick))

      cleanupFns.push(() => viewer.destroy())
      setStatus('ready')
    }).catch(() => {
      if (!cancelled) {
        setStatus('error')
        setErrorMessage('The 3D walkthrough failed to load.')
      }
    })

    return () => {
      cancelled = true
      cleanupFns.forEach((fn) => fn())
      cleanupFns = []
    }
  }, [neighborhood.id, neighborhood.lat, neighborhood.lon, accessToken])

  return (
    <div className="relative h-full w-full bg-[#0c1119]">
      <div ref={containerRef} className="h-full w-full" />

      {status === 'loading' && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#0c1119]">
          <div className="glass-surface-soft rounded-full px-4 py-2 text-[12px] text-white/70">
            Loading the 3D walkthrough of {neighborhood.name}…
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#10151f]">
          <div className="glass-surface rounded-2xl px-5 py-4 text-center text-[13px] text-white/75">
            {errorMessage}
          </div>
        </div>
      )}

      {status === 'ready' && (
        <div className="pointer-events-none absolute left-1/2 top-[76px] flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/25 px-3 py-1 text-[10px] font-medium tracking-wide text-white/70 backdrop-blur-sm">
          <Footprints size={11} />
          Experimental 3D walkthrough (free tier) · WASD/arrows to walk · drag to look
        </div>
      )}
    </div>
  )
}
