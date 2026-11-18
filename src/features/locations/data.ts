import type { AmbienceOption, Neighborhood } from '@/types'

export const STREET_AMBIENCE_LIBRARY: AmbienceOption[] = [
  { id: 'urban-street', label: 'Urban Street', description: 'Traffic hum, overlapping voices, footsteps on pavement.' },
  { id: 'quiet-neighborhood', label: 'Quiet Neighborhood', description: 'A soft room-tone hum, distant voices, the occasional car.' },
  { id: 'market', label: 'Market', description: 'Overlapping chatter, crates, a bell now and then.' },
  { id: 'cafe', label: 'Café Ambience', description: 'Espresso machines, low conversation, a spoon on porcelain.' },
  { id: 'waterfront', label: 'Waterfront', description: 'Lapping water against the quay, voices, a passing car.' },
]

export const WEATHER_SOUND_LIBRARY: AmbienceOption[] = [
  { id: 'light-rain', label: 'Light Rain', description: 'A fine, steady rain on stone and leaves.' },
  { id: 'heavy-rain', label: 'Heavy Rain', description: 'Full, enveloping rainfall.' },
  { id: 'wind', label: 'Wind', description: 'Open, moving air.' },
  { id: 'thunder', label: 'Thunder', description: 'Distant rolling thunder beneath rain.' },
  { id: 'clear-outdoor', label: 'Clear Outdoor', description: 'Still air, faint ambient room tone.' },
  { id: 'snow', label: 'Snow / Winter', description: 'Muffled, soft, cold stillness.' },
  { id: 'birds', label: 'Birdsong', description: 'Clear daytime sky, birds nearby.' },
  { id: 'night', label: 'Clear Night', description: 'Still, dark, the odd cricket.' },
]

export const NEIGHBORHOODS: Neighborhood[] = [
  {
    id: 'kadikoy-istanbul',
    name: 'Kadıköy',
    city: 'Istanbul',
    country: 'Turkey',
    lat: 40.9906,
    lon: 29.0274,
    timezone: 'Europe/Istanbul',
    blurb: 'A ferry-side neighborhood on the Asian shore, where the Bosphorus meets old market streets.',
    hue: 18,
    imageryYear: 2024,
    radioStations: [
      { id: 'power-turk', name: 'Power Türk FM', genre: 'Turkish Pop', streamUrl: 'https://listen.powerapp.com.tr/powerturk/mpeg/icecast.audio' },
    ],
    streetAmbience: STREET_AMBIENCE_LIBRARY,
    defaultStreetAmbience: 'waterfront',
  },
  {
    id: 'greenwich-village-nyc',
    name: 'Greenwich Village',
    city: 'New York',
    country: 'United States',
    lat: 40.7336,
    lon: -74.0027,
    timezone: 'America/New_York',
    blurb: 'Tree-lined West Village blocks, brownstones, and late-night jazz rooms.',
    hue: 210,
    imageryYear: 2023,
    radioStations: [
      { id: '181fm-heart', name: '181.FM The Heart', genre: 'Slow Love Songs, Commercial-Free', streamUrl: 'https://listen.181fm.com/181-heart_128k.mp3' },
    ],
    streetAmbience: STREET_AMBIENCE_LIBRARY,
    defaultStreetAmbience: 'urban-street',
  },
  {
    id: 'trastevere-rome',
    name: 'Trastevere',
    city: 'Rome',
    country: 'Italy',
    lat: 41.8898,
    lon: 12.4696,
    timezone: 'Europe/Rome',
    blurb: 'Cobblestone alleys across the Tiber, ochre walls, trattorias spilling onto the street.',
    hue: 28,
    imageryYear: 2023,
    radioStations: [
      { id: 'radio-armisa', name: 'Radio Armisa', genre: 'Italian Pop & Folk', streamUrl: 'https://onair.armisa.it/listen/armisa/radio.mp3' },
    ],
    streetAmbience: STREET_AMBIENCE_LIBRARY,
    defaultStreetAmbience: 'cafe',
  },
  {
    id: 'jordaan-amsterdam',
    name: 'Jordaan',
    city: 'Amsterdam',
    country: 'Netherlands',
    lat: 52.3745,
    lon: 4.8807,
    timezone: 'Europe/Amsterdam',
    blurb: 'Narrow canal streets, bicycles, gabled houses reflected in still water.',
    hue: 200,
    imageryYear: 2022,
    radioStations: [
      { id: 'radio-538', name: 'Radio 538', genre: 'Dutch Top 40', streamUrl: 'https://playerservices.streamtheworld.com/api/livestream-redirect/RADIO538.mp3' },
    ],
    streetAmbience: STREET_AMBIENCE_LIBRARY,
    defaultStreetAmbience: 'quiet-neighborhood',
  },
  {
    id: 'shibuya-tokyo',
    name: 'Shibuya',
    city: 'Tokyo',
    country: 'Japan',
    lat: 35.6598,
    lon: 139.7006,
    timezone: 'Asia/Tokyo',
    blurb: 'Neon crossings and quiet backstreets within minutes of each other.',
    hue: 265,
    imageryYear: 2024,
    radioStations: [
      // Most Tokyo broadcasters stream only through Radiko, which blocks
      // listeners outside Japan. City Poppers isn't a terrestrial Tokyo
      // station, but it's a real, independently run internet station built
      // entirely around Japanese city pop — the genre that is, musically,
      // Shibuya and Tokyo's late-night neon streets.
      { id: 'city-poppers', name: 'City Poppers', genre: 'Japanese City Pop', streamUrl: 'https://stream.zeno.fm/ricmeoweux2uv' },
    ],
    streetAmbience: STREET_AMBIENCE_LIBRARY,
    defaultStreetAmbience: 'urban-street',
  },
  {
    id: 'cihangir-istanbul',
    name: 'Cihangir',
    city: 'Istanbul',
    country: 'Turkey',
    lat: 41.0345,
    lon: 28.9833,
    timezone: 'Europe/Istanbul',
    blurb: 'A hillside neighborhood above the Bosphorus, all cat cafés, secondhand bookshops, and balconies angled toward the water.',
    hue: 345,
    imageryYear: 2026,
    radioStations: [
      { id: 'power-turk', name: 'Power Türk FM', genre: 'Turkish Pop', streamUrl: 'https://listen.powerapp.com.tr/powerturk/mpeg/icecast.audio' },
    ],
    streetAmbience: STREET_AMBIENCE_LIBRARY,
    defaultStreetAmbience: 'cafe',
  },
  {
    id: 'uskudar-istanbul',
    name: 'Üsküdar',
    city: 'Istanbul',
    country: 'Turkey',
    lat: 41.0214,
    lon: 29.0161,
    timezone: 'Europe/Istanbul',
    blurb: "The Asian shore's old ferry district, where minarets line the Bosphorus and the call to prayer carries across the water to Europe.",
    hue: 198,
    imageryYear: 2026,
    radioStations: [
      { id: 'power-turk', name: 'Power Türk FM', genre: 'Turkish Pop', streamUrl: 'https://listen.powerapp.com.tr/powerturk/mpeg/icecast.audio' },
    ],
    streetAmbience: STREET_AMBIENCE_LIBRARY,
    defaultStreetAmbience: 'waterfront',
  },
  {
    id: 'upper-west-side-nyc',
    name: 'Upper West Side',
    city: 'New York',
    country: 'United States',
    lat: 40.787,
    lon: -73.9754,
    timezone: 'America/New_York',
    blurb: "Broad avenues between Central Park and the Hudson, brownstones, bagel counters, and the Natural History Museum's shadow.",
    hue: 222,
    imageryYear: 2026,
    radioStations: [
      { id: '181fm-heart', name: '181.FM The Heart', genre: 'Slow Love Songs, Commercial-Free', streamUrl: 'https://listen.181fm.com/181-heart_128k.mp3' },
    ],
    streetAmbience: STREET_AMBIENCE_LIBRARY,
    defaultStreetAmbience: 'quiet-neighborhood',
  },
  {
    id: 'kreuzberg-berlin',
    name: 'Kreuzberg',
    city: 'Berlin',
    country: 'Germany',
    lat: 52.4996,
    lon: 13.4033,
    timezone: 'Europe/Berlin',
    blurb: 'Canal-side parks, street art, and a neighborhood that never fully sleeps.',
    hue: 235,
    imageryYear: 2023,
    radioStations: [
      { id: 'spreeradio', name: "105'5 Spreeradio", genre: 'Berlin Hits', streamUrl: 'https://stream.spreeradio.de/spree-live/mp3-192/radio-browser.info/' },
    ],
    streetAmbience: STREET_AMBIENCE_LIBRARY,
    defaultStreetAmbience: 'quiet-neighborhood',
  },
]

export const DEFAULT_NEIGHBORHOOD = NEIGHBORHOODS.find((n) => n.id === 'greenwich-village-nyc')!

export function findNeighborhood(id: string): Neighborhood | undefined {
  return NEIGHBORHOODS.find((n) => n.id === id)
}
