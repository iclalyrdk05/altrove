const GRAPH_URL = 'https://graph.mapillary.com/images'

export function getMapillaryToken(): string | null {
  const token = import.meta.env.VITE_MAPILLARY_TOKEN as string | undefined
  return token && token.trim().length > 0 ? token.trim() : null
}

export class MapillaryError extends Error {}

/**
 * Finds the nearest captured image to a point, searching outward in a few
 * radius steps since coverage is uneven city to city. Returns null (not an
 * error) when nothing is found nearby — that's an expected, common case.
 */
export async function findNearestImage(
  lat: number,
  lon: number,
  token: string,
  signal?: AbortSignal,
): Promise<string | null> {
  const radiiMeters = [150, 400, 1000]

  for (const radius of radiiMeters) {
    const dLat = radius / 111_320
    const dLon = radius / (111_320 * Math.cos((lat * Math.PI) / 180))
    const bbox = [lon - dLon, lat - dLat, lon + dLon, lat + dLat].join(',')

    const params = new URLSearchParams({
      access_token: token,
      fields: 'id,computed_geometry',
      bbox,
      limit: '1',
    })

    let res: Response
    try {
      res = await fetch(`${GRAPH_URL}?${params.toString()}`, { signal })
    } catch {
      throw new MapillaryError('Mapillary service unreachable')
    }
    if (res.status === 401 || res.status === 400) {
      throw new MapillaryError('Mapillary access token is invalid')
    }
    if (!res.ok) throw new MapillaryError(`Mapillary returned ${res.status}`)

    const json = await res.json()
    const first = json?.data?.[0]
    if (first?.id) return String(first.id)
  }

  return null
}
