/**
 * A deterministic, curated human portrait for a given seed (friend id, moment
 * author id, etc.) — same seed always returns the same face. Uses a small
 * hand-picked set of real portrait photos instead of a placeholder service,
 * since the generic faces those return don't read as real people.
 */

const WOMEN_PHOTOS = [
  '/avatars/woman-1.webp',
  '/avatars/woman-2.webp',
  '/avatars/woman-3.png',
  '/avatars/woman-4.webp',
  '/avatars/woman-5.webp',
  '/avatars/woman-6.webp',
  '/avatars/woman-7.webp',
  '/avatars/woman-8.webp',
  '/avatars/woman-9.webp',
]

const MEN_PHOTOS = [
  '/avatars/man-1.png',
  '/avatars/man-2.webp',
  '/avatars/man-3.webp',
  '/avatars/man-4.webp',
  '/avatars/man-5.webp',
  '/avatars/man-6.webp',
]

const ALL_PHOTOS = [...WOMEN_PHOTOS, ...MEN_PHOTOS]

/**
 * Known gender for the recurring, named cast (friends, friend requests, and
 * the hand-authored demo moments) so they get a photo matching their name,
 * keyed by the same id/seed Avatar is actually called with. Everything else
 * (the large ambient pool of simulated moment authors) falls back to the
 * full mixed set below — those are brief, background flavor text, not worth
 * hand-matching one by one.
 */
const GENDER_HINTS: Record<string, 'f' | 'm'> = {
  'f-1': 'f', // Aylin Demir
  'f-2': 'm', // Noah Bergström
  'f-3': 'f', // Giulia Conti
  'f-4': 'm', // Kenji Watanabe
  'f-5': 'f', // Lotte van Dijk
  'r-1': 'm', // Marco Bianchi
  'm-1': 'f', // Deniz A.
  'm-2': 'f', // Elif K.
  'm-3': 'm', // Mert Y.
  'm-5': 'm', // Jordan M.
  'm-7': 'f', // Sanne V.
}

function hashString(seed: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

export function avatarPhotoUrl(seed: string): string {
  const pool = GENDER_HINTS[seed] === 'f' ? WOMEN_PHOTOS : GENDER_HINTS[seed] === 'm' ? MEN_PHOTOS : ALL_PHOTOS
  return pool[hashString(seed) % pool.length]
}
