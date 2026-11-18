const R2_BASE = (import.meta.env.VITE_R2_PUBLIC_URL as string | undefined)?.replace(/\/$/, '')

/**
 * Builds a public R2 URL for a footage slug (e.g. "amsterdam-street-1" ->
 * ".../amsterdam-street-1.mp4"). Returns an empty string when the R2 base
 * URL isn't configured, which the <video> element treats as a load failure
 * and falls back gracefully, same as a missing local file would.
 */
export function r2Footage(slug: string): string {
  if (!R2_BASE) return ''
  return `${R2_BASE}/${slug}.mp4`
}
