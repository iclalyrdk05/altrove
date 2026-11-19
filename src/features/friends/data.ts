import type { Friend } from '@/types'

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

/**
 * A broader directory of people searchable from the "Add Friends" tab —
 * distinct from DEMO_FRIENDS so a search can surface someone not already
 * connected in any way. In a connected deployment this would be a
 * server-side user search instead of a fixed local list.
 */
export const DEMO_DISCOVERABLE: Pick<Friend, 'id' | 'name' | 'avatar' | 'bio'>[] = [
  { id: 'd-1', name: 'Priya Sharma', avatar: '🪔', bio: 'Based in Istanbul for a semester abroad.' },
  { id: 'd-2', name: 'Lucas Ferreira', avatar: '⚽', bio: 'Splits time between Rome and São Paulo.' },
  { id: 'd-3', name: 'Mei Lin', avatar: '🍵', bio: 'Tokyo native, usually posting from Shibuya.' },
  { id: 'd-4', name: 'Sven Andersson', avatar: '🛶', bio: 'Amsterdam-based, loves the canals at dawn.' },
  { id: 'd-5', name: 'Fatima Al-Sayed', avatar: '🌿', bio: 'New York transplant, still exploring the Village.' },
  { id: 'd-6', name: 'Diego Morales', avatar: '🎺', bio: 'Travels often, currently somewhere in Europe.' },
  { id: 'd-7', name: 'Ingrid Olsen', avatar: '❄️', bio: 'Visiting Amsterdam for the winter.' },
  { id: 'd-8', name: 'Yusuf Kaya', avatar: '🧿', bio: 'Grew up in Üsküdar, still visits every summer.' },
  { id: 'd-9', name: 'Chloé Dubois', avatar: '🥐', bio: 'Paris-based photographer.' },
  { id: 'd-10', name: 'Omar Haddad', avatar: '🕌', bio: 'Keeps a running list of every city he’s slept in.' },
  { id: 'd-11', name: 'Eva Lindqvist', avatar: '🧵', bio: 'Textile designer, friend of Noah Bergström.' },
  { id: 'd-12', name: 'Tomás Rivera', avatar: '🌵', bio: 'Friend of Giulia Conti, usually traveling.' },
  { id: 'd-13', name: 'Haruka Ito', avatar: '🎋', bio: 'Friend of Kenji Watanabe, based near Tokyo.' },
]
