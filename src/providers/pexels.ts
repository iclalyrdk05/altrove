export function getPexelsApiKey(): string | null {
  const key = import.meta.env.VITE_PEXELS_API_KEY as string | undefined
  return key && key.trim().length > 0 ? key.trim() : null
}

export class PexelsError extends Error {}

interface PexelsVideoFile {
  quality: string
  width: number
  height: number
  file_type: string
  link: string
}

interface PexelsVideo {
  id: number
  width: number
  height: number
  url: string
  video_files: PexelsVideoFile[]
}

function pickBestFile(files: PexelsVideoFile[]): string | null {
  const candidates = files
    .filter((f) => f.file_type === 'video/mp4' && f.width >= f.height) // landscape only
    .sort((a, b) => Math.abs(a.width - 1600) - Math.abs(b.width - 1600)) // closest to a sensible background-video size
  return candidates[0]?.link ?? null
}

/** Searches Pexels for a landscape video matching the query; returns a direct mp4 URL or null if nothing suitable was found. */
export async function searchAtmosphereVideo(query: string, apiKey: string, signal?: AbortSignal): Promise<string | null> {
  const params = new URLSearchParams({
    query,
    orientation: 'landscape',
    size: 'medium',
    per_page: '6',
  })

  let res: Response
  try {
    res = await fetch(`https://api.pexels.com/videos/search?${params.toString()}`, {
      headers: { Authorization: apiKey },
      signal,
    })
  } catch {
    throw new PexelsError('Pexels service unreachable')
  }
  if (res.status === 401) throw new PexelsError('Pexels API key is invalid')
  if (!res.ok) throw new PexelsError(`Pexels returned ${res.status}`)

  const json = await res.json()
  const videos: PexelsVideo[] = json?.videos ?? []
  for (const video of videos) {
    const link = pickBestFile(video.video_files ?? [])
    if (link) return link
  }
  return null
}
