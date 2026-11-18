import type { Moment } from '@/types'
import { SIMULATED_MOMENT_POOL } from './simulatedMoments'

/** Every neighborhood should already feel lived-in the moment you open it. */
const TARGET_SEED_COUNT = 6

/**
 * Hand-authored demonstration posts — the ones with a real photo/audio
 * attachment or a friend tie. Clearly-labeled sample content, not real
 * contributions from active users — see `isDemo` on each Moment.
 */
const HAND_AUTHORED_MOMENTS: Moment[] = [
  {
    id: 'm-1',
    neighborhoodId: 'kadikoy-istanbul',
    authorName: 'Deniz A.',
    authorAvatar: '🌊',
    note: 'The streets are quiet after the rain. Ferry horns carrying further than usual tonight.',
    tag: 'Light Rain',
    createdAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    visibility: 'public',
    isDemo: true,
  },
  {
    id: 'm-2',
    neighborhoodId: 'kadikoy-istanbul',
    authorName: 'Elif K.',
    authorAvatar: '🫖',
    note: 'Everyone is sitting outside today, even with the drizzle. The tea gardens never really close.',
    tag: 'Overcast',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    visibility: 'public',
    isDemo: true,
  },
  {
    id: 'm-3',
    neighborhoodId: 'kadikoy-istanbul',
    authorName: 'Mert Y.',
    authorAvatar: '📚',
    note: 'The light looked beautiful this afternoon — that particular pink the sky gets before a storm.',
    tag: 'Golden Hour',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    visibility: 'public',
    isDemo: true,
  },
  {
    id: 'm-4',
    neighborhoodId: 'kadikoy-istanbul',
    authorId: 'f-1',
    authorName: 'Aylin Demir',
    authorAvatar: '🌙',
    note: 'The flower stalls near the market are spilling into the street again — recorded the usual market noise for you.',
    audioUrl: '/moment-audio/istanbul-street.mov',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    visibility: 'public',
    isDemo: true,
  },
  {
    id: 'm-5',
    neighborhoodId: 'greenwich-village-nyc',
    authorName: 'Jordan M.',
    authorAvatar: '🎷',
    note: 'Jazz coming up from the basement clubs again. Feels like the Village never changes.',
    tag: 'Clear',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    visibility: 'public',
    isDemo: true,
  },
  {
    id: 'm-6',
    neighborhoodId: 'trastevere-rome',
    authorId: 'f-3',
    authorName: 'Giulia Conti',
    authorAvatar: '🍋',
    note: 'Laundry lines across the alley catching the last bit of sun.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString(),
    visibility: 'public',
    isDemo: true,
  },
  {
    id: 'm-7',
    neighborhoodId: 'jordaan-amsterdam',
    authorName: 'Sanne V.',
    authorAvatar: '🚲',
    note: 'Canal mist this morning — could barely see the opposite bank for an hour.',
    tag: 'Fog',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    visibility: 'public',
    isDemo: true,
  },
]

/**
 * Tops each neighborhood up to TARGET_SEED_COUNT using its flavor pool, with
 * timestamps staggered over the last ~20 hours so the fill-ins read as
 * already having accumulated rather than all posted in the same instant.
 * Leaves a few pool entries untouched per neighborhood so useMomentSimulator
 * still has genuinely new ones to drip-feed in later (see its "seed-" prefix
 * handling), instead of immediately repeating what's already on screen.
 */
function buildSeedMoments(): Moment[] {
  const byNeighborhood = new Map<string, Moment[]>()
  for (const m of HAND_AUTHORED_MOMENTS) {
    const list = byNeighborhood.get(m.neighborhoodId) ?? []
    list.push(m)
    byNeighborhood.set(m.neighborhoodId, list)
  }

  const neighborhoodIds = new Set([...byNeighborhood.keys(), ...Object.keys(SIMULATED_MOMENT_POOL)])
  const generated: Moment[] = []

  for (const neighborhoodId of neighborhoodIds) {
    const existing = byNeighborhood.get(neighborhoodId) ?? []
    const pool = SIMULATED_MOMENT_POOL[neighborhoodId] ?? []
    const needed = Math.min(Math.max(0, TARGET_SEED_COUNT - existing.length), pool.length)

    for (let i = 0; i < needed; i++) {
      const seed = pool[i]
      const hoursAgo = 1 + i * (20 / needed)
      generated.push({
        id: `seed-${neighborhoodId}-${seed.id}`,
        neighborhoodId,
        authorId: seed.authorId,
        authorName: seed.authorName,
        authorAvatar: seed.authorAvatar,
        note: seed.note,
        tag: seed.tag,
        imageUrl: seed.imageUrl,
        audioUrl: seed.audioUrl,
        createdAt: new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString(),
        visibility: 'public',
        isDemo: true,
      })
    }
  }

  return [...HAND_AUTHORED_MOMENTS, ...generated].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

export const DEMO_MOMENTS: Moment[] = buildSeedMoments()
