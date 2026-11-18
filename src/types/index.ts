export type Perspective = 'street' | 'atmosphere' | 'earth'

export type SkyCondition =
  | 'clear'
  | 'sunny'
  | 'partly-cloudy'
  | 'cloudy'
  | 'fog'
  | 'rain'
  | 'storm'
  | 'snow'

export interface StreetSceneLayer {
  /** relative depth, 0 = nearest */
  depth: number
  kind: 'skyline' | 'water' | 'buildings' | 'rail' | 'lights' | 'foreground'
}

export interface Neighborhood {
  id: string
  name: string
  city: string
  country: string
  lat: number
  lon: number
  timezone: string
  blurb: string
  /** Hue used to tint generated street/atmosphere scenery */
  hue: number
  /** Known imagery capture year, for honesty about Street-style view */
  imageryYear?: number
  radioStations: RadioStation[]
  streetAmbience: AmbienceOption[]
  defaultStreetAmbience: string
}

export interface RadioStation {
  id: string
  name: string
  genre: string
  streamUrl: string
}

export interface AmbienceOption {
  id: string
  label: string
  description: string
}

export interface WeatherData {
  temperatureC: number
  apparentTemperatureC: number
  condition: SkyCondition
  conditionLabel: string
  humidity: number
  windSpeedKmh: number
  windDirectionDeg: number
  pressureHpa: number
  visibilityKm: number | null
  precipitationMm: number
  cloudCoverPct: number
  isDay: boolean
  sunrise: string
  sunset: string
  hourly: HourlyPoint[]
  fetchedAt: string
}

export interface HourlyPoint {
  time: string
  temperatureC: number
  precipitationProbability: number
  condition: SkyCondition
}

export type ActivityLevel = 'quiet' | 'light' | 'moderate' | 'busy' | 'very-busy' | 'unavailable'

export interface ActivityInfo {
  level: ActivityLevel
  trend: 'rising' | 'falling' | 'steady' | null
  source: string
  updatedAt: string
  isSimulated: boolean
}

export interface Moment {
  id: string
  neighborhoodId: string
  /** Matches a Friend.id when this Moment's author is one of the viewer's friends. */
  authorId?: string
  authorName: string
  authorAvatar: string
  note: string
  imageUrl?: string
  audioUrl?: string
  tag?: string
  createdAt: string
  visibility: 'public' | 'friends'
  isDemo: boolean
}

export interface Friend {
  id: string
  name: string
  avatar: string
  bio?: string
  shareStatus: 'none' | 'manual' | 'selected-friends' | 'all-friends' | 'time-limited'
  sharedNeighborhoodId: string | null
  shareExpiresAt: string | null
}

/** A friend-of-a-friend suggestion, surfaced under Requests so the friend graph can grow past direct invites. */
export interface RecommendedFriend {
  id: string
  name: string
  avatar: string
  /** Name of the mutual friend this suggestion came through. */
  mutualFriendName: string
}

export interface AudioChannelState {
  on: boolean
  volume: number
}

export interface RadioChannelState extends AudioChannelState {
  stationId: string | null
  status: 'idle' | 'loading' | 'playing' | 'error'
}

export interface AmbienceChannelState extends AudioChannelState {
  optionId: string | null
  status: 'idle' | 'playing' | 'error'
}

export interface UserPreferences {
  temperatureUnit: 'C' | 'F'
  windUnit: 'kmh' | 'mph'
  reducedMotion: boolean
  referenceTimezone: string
  referenceLabel: string
}

export interface UserProfile {
  displayName: string
  avatar: string
  bio: string
  isAuthenticated: boolean
  preferences: UserPreferences
}
