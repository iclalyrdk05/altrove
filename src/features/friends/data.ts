import type { Friend, RecommendedFriend } from '@/types'

/**
 * Demonstration friends. In a connected deployment these would be real
 * authenticated relationships with server-enforced sharing permissions —
 * here they illustrate the intended interaction with clearly fictional people.
 */
export const DEMO_FRIENDS: Friend[] = [
  {
    id: 'f-1',
    name: 'Aylin Demir',
    avatar: '🌙',
    bio: 'Studying in Rotterdam, homesick for the Bosphorus.',
    shareStatus: 'all-friends',
    sharedNeighborhoodId: 'kadikoy-istanbul',
    shareExpiresAt: null,
  },
  {
    id: 'f-2',
    name: 'Noah Bergström',
    avatar: '🎨',
    bio: 'Freelance illustrator, currently in the Village for a residency.',
    shareStatus: 'selected-friends',
    sharedNeighborhoodId: 'greenwich-village-nyc',
    shareExpiresAt: null,
  },
  {
    id: 'f-3',
    name: 'Giulia Conti',
    avatar: '🍋',
    shareStatus: 'manual',
    sharedNeighborhoodId: 'trastevere-rome',
    shareExpiresAt: null,
  },
  {
    id: 'f-4',
    name: 'Kenji Watanabe',
    avatar: '🌸',
    bio: 'Shares his neighborhood only occasionally.',
    shareStatus: 'time-limited',
    sharedNeighborhoodId: 'shibuya-tokyo',
    shareExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString(),
  },
  {
    id: 'f-5',
    name: 'Lotte van Dijk',
    avatar: '🚲',
    bio: 'Keeps her location private for now.',
    shareStatus: 'none',
    sharedNeighborhoodId: null,
    shareExpiresAt: null,
  },
]

export const DEMO_FRIEND_REQUESTS: Pick<Friend, 'id' | 'name' | 'avatar'>[] = [
  { id: 'r-1', name: 'Marco Bianchi', avatar: '⛵' },
]

/** Friends-of-friends suggested under Requests, so the graph can grow past direct invites. */
export const DEMO_RECOMMENDED: RecommendedFriend[] = [
  { id: 'rec-1', name: 'Eva Lindqvist', avatar: '🧵', mutualFriendName: 'Noah Bergström' },
  { id: 'rec-2', name: 'Tomás Rivera', avatar: '🌵', mutualFriendName: 'Giulia Conti' },
  { id: 'rec-3', name: 'Haruka Ito', avatar: '🎋', mutualFriendName: 'Kenji Watanabe' },
]
