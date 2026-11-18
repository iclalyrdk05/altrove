export interface SimulatedMomentSeed {
  id: string
  /** Matches a Friend.id when this flavor post should count as coming from a friend. */
  authorId?: string
  authorName: string
  authorAvatar: string
  note: string
  tag?: string
  imageUrl?: string
  audioUrl?: string
}

/**
 * A pool of flavor posts per neighborhood. Used two ways:
 *  1. communityStore seeds a handful of these (see data.ts) with staggered
 *     past timestamps, so every neighborhood already feels lived-in the
 *     moment you open it instead of starting empty.
 *  2. useMomentSimulator drip-feeds the rest in one at a time while that
 *     neighborhood stays open, so the feed keeps growing over time too.
 * Still clearly demo content (isDemo is set by communityStore on insert).
 */
export const SIMULATED_MOMENT_POOL: Record<string, SimulatedMomentSeed[]> = {
  'kadikoy-istanbul': [
    { id: 's-kad-1', authorName: 'Burak T.', authorAvatar: '⚓', note: 'The 8:15 ferry just pulled in, full as always.' },
    { id: 's-kad-2', authorName: 'Ayşe D.', authorAvatar: '🐟', note: 'Fish market smells like someone just got a fresh catch of lüfer in.' },
    { id: 's-kad-3', authorName: 'Can Ö.', authorAvatar: '☕', note: 'Queue for the simit stand is out the door again.' },
    { id: 's-kad-4', authorName: 'Zeynep A.', authorAvatar: '🐈', note: 'The street cats have claimed the fish market steps for their afternoon nap.' },
    { id: 's-kad-5', authorName: 'Hakan B.', authorAvatar: '🕌', note: 'Call to prayer overlapping with the seagulls near the pier.' },
    { id: 's-kad-6', authorName: 'Pelin S.', authorAvatar: '🌰', note: 'Street vendor roasting chestnuts on Moda Caddesi, smoke drifting over the tram tracks.' },
    { id: 's-kad-7', authorName: 'Deniz Ş.', authorAvatar: '💿', note: "Antique record shop has new crates out, someone's already flipping through them." },
    { id: 's-kad-8', authorName: 'Oğuz K.', authorAvatar: '🎲', note: 'Backgammon tiles clacking from the tea garden tables all afternoon.' },
  ],
  'greenwich-village-nyc': [
    {
      id: 's-gv-1',
      authorId: 'f-2',
      authorName: 'Noah Bergström',
      authorAvatar: '🎨',
      note: "Caught the city just waking up this morning — streets still quiet before the rush, no soundtrack needed.",
      audioUrl: '/moment-audio/newyork-street.mov',
    },
    { id: 's-gv-2', authorName: 'Theo R.', authorAvatar: '📖', note: 'The used bookstore on the corner has its cart out again tonight.' },
    { id: 's-gv-3', authorName: 'Priya N.', authorAvatar: '🥐', note: 'Line for the bakery wrapped around the block this morning.' },
    { id: 's-gv-4', authorName: 'Sam K.', authorAvatar: '🐕', note: 'Dog run is packed — must be the first warm evening in weeks.' },
    { id: 's-gv-5', authorName: 'Maya L.', authorAvatar: '📓', note: 'NYU students spilling out of the library steps at midnight.' },
    { id: 's-gv-6', authorName: 'Eli F.', authorAvatar: '🎻', note: 'Violinist busking outside the subway entrance again, same spot as always.' },
    { id: 's-gv-7', authorName: 'Rosa H.', authorAvatar: '🎤', note: 'Comedy club line wrapping down the block for the late show.' },
    { id: 's-gv-8', authorName: 'Jude C.', authorAvatar: '📀', note: "Someone's stoop sale has half the block's old vinyl out on folding tables." },
  ],
  'trastevere-rome': [
    { id: 's-tr-1', authorName: 'Lorenzo B.', authorAvatar: '🍷', note: 'Someone brought an accordion out to the piazza again.' },
    { id: 's-tr-2', authorName: 'Francesca M.', authorAvatar: '🛵', note: 'Scooters double-parked three deep on Via del Moro, as usual.' },
    { id: 's-tr-3', authorName: 'Marco V.', authorAvatar: '🧺', note: 'Laundry day — the whole alley is strung with sheets.' },
    { id: 's-tr-4', authorName: 'Chiara P.', authorAvatar: '🐈‍⬛', note: 'The gelato line is already out the door before noon.' },
    { id: 's-tr-5', authorName: 'Paolo G.', authorAvatar: '🔔', note: 'Church bells from Santa Maria just rang out over the piazza.' },
    { id: 's-tr-6', authorName: 'Ilaria R.', authorAvatar: '🐱', note: 'Cats sunning themselves on the old fountain steps again.' },
    { id: 's-tr-7', authorName: 'Dario M.', authorAvatar: '🍝', note: "Trattoria owner is out front arguing cheerfully with a delivery driver." },
    { id: 's-tr-8', authorName: 'Beatrice S.', authorAvatar: '🎸', note: "Someone's playing guitar under the bridge, echo carries up the alley." },
  ],
  'jordaan-amsterdam': [
    { id: 's-jo-1', authorName: 'Bram H.', authorAvatar: '🚲', note: 'Bike bell chorus at the Bloemgracht crossing, as always at rush hour.' },
    { id: 's-jo-2', authorName: 'Fleur K.', authorAvatar: '🧀', note: 'The cheese shop just put out a new wheel — smell carries down the block.' },
    { id: 's-jo-3', authorName: 'Daan W.', authorAvatar: '🪴', note: 'Someone is repainting their houseboat again, bright green this time.' },
    { id: 's-jo-4', authorName: 'Noor S.', authorAvatar: '📚', note: 'Boekenmarkt stalls are out along the canal this afternoon.' },
    { id: 's-jo-5', authorName: 'Tess B.', authorAvatar: '🎶', note: 'Street organ grinding out a tune near the Noordermarkt.' },
    { id: 's-jo-6', authorName: 'Milan K.', authorAvatar: '☔', note: 'Rain just started — everyone ducking under café awnings, bikes and all.' },
    { id: 's-jo-7', authorName: 'Anneke V.', authorAvatar: '🌷', note: 'Flower stall restocking tulips again, whole corner smells like it.' },
    { id: 's-jo-8', authorName: 'Joost R.', authorAvatar: '🚤', note: 'Canal boat tour just passed, tourists waving at everyone on the bridge.' },
  ],
  'shibuya-tokyo': [
    {
      id: 's-sh-1',
      authorId: 'f-4',
      authorName: 'Kenji Watanabe',
      authorAvatar: '🌸',
      note: 'Crossing just cleared a wave of a few hundred people — never gets old.',
    },
    { id: 's-sh-2', authorName: 'Yui M.', authorAvatar: '🎮', note: 'Arcade on the corner is lit up even brighter than the signs outside.' },
    { id: 's-sh-3', authorName: 'Sora T.', authorAvatar: '🍜', note: 'Ramen counter has a line stretching past the vending machines.' },
    { id: 's-sh-4', authorName: 'Rin A.', authorAvatar: '🐾', note: 'Someone brought their shiba to the park — small crowd gathered immediately.' },
    { id: 's-sh-5', authorName: 'Haruto N.', authorAvatar: '🎰', note: 'Pachinko parlor lights flickering even brighter after sunset.' },
    { id: 's-sh-6', authorName: 'Emi K.', authorAvatar: '🍡', note: 'Convenience store line wrapping around for the new seasonal snack.' },
    { id: 's-sh-7', authorName: 'Rika O.', authorAvatar: '📸', note: 'Street fashion crew doing a photoshoot right on the crossing again.' },
    { id: 's-sh-8', authorName: 'Sota I.', authorAvatar: '🍢', note: 'Izakaya smoke and grill smell drifting out into the alley.' },
  ],
  'kreuzberg-berlin': [
    { id: 's-kr-1', authorName: 'Lukas F.', authorAvatar: '🎨', note: 'New mural going up on the courtyard wall, still wet.' },
    { id: 's-kr-2', authorName: 'Mira S.', authorAvatar: '🥙', note: 'Line at the döner stand wrapped past the kiosk again tonight.' },
    { id: 's-kr-3', authorName: 'Jonas P.', authorAvatar: '🚲', note: 'Canal path is full of evening cyclists, lights blinking in both directions.' },
    { id: 's-kr-4', authorName: 'Emma L.', authorAvatar: '🎵', note: 'Bassline drifting up from a courtyard party a few blocks over.' },
    { id: 's-kr-5', authorName: 'Nora W.', authorAvatar: '🧺', note: 'Flea market stalls going up early at Maybachufer.' },
    { id: 's-kr-6', authorName: 'Finn T.', authorAvatar: '🔊', note: "Techno bassline still going from last night's afterparty somewhere nearby." },
    { id: 's-kr-7', authorName: 'Selim O.', authorAvatar: '🧆', note: 'Falafel stand has a line out onto the sidewalk again.' },
    { id: 's-kr-8', authorName: 'Greta H.', authorAvatar: '🍅', note: "Someone's balcony garden is spilling tomatoes over the railing." },
  ],
  'cihangir-istanbul': [
    { id: 's-ci-1', authorName: 'Selin Ak.', authorAvatar: '🐈', note: 'Cats sprawled across every café chair on the hill again.' },
    { id: 's-ci-2', authorName: 'Barış Ü.', authorAvatar: '💿', note: 'Antique dealer just put out a crate of old vinyl on the sidewalk.' },
    { id: 's-ci-3', authorName: 'Ece T.', authorAvatar: '🌇', note: 'View from the stairs catches the Bosphorus lighting up gold right now.' },
    { id: 's-ci-4', authorName: 'Toprak Y.', authorAvatar: '📚', note: 'Neighborhood bookshop has its cart of used paperbacks out front again.' },
    { id: 's-ci-5', authorName: 'Nazlı F.', authorAvatar: '🌿', note: "Someone's balcony garden is overflowing onto the street railing." },
    { id: 's-ci-6', authorName: 'Kerem D.', authorAvatar: '☕', note: "Café on the corner just started grinding beans, smell's everywhere." },
    { id: 's-ci-7', authorName: 'Aslı M.', authorAvatar: '🐾', note: "Old apartment building's cats gathering on the stairwell landing again." },
    { id: 's-ci-8', authorName: 'Cem Y.', authorAvatar: '🌃', note: 'Rooftop bar just opened for the evening, string lights going up.' },
  ],
  'uskudar-istanbul': [
    { id: 's-us-1', authorName: 'Murat S.', authorAvatar: '⛴️', note: 'Ferry horn just echoed across to the European side.' },
    { id: 's-us-2', authorName: 'Hatice Y.', authorAvatar: '🕌', note: 'Call to prayer carrying clean across the water this evening.' },
    { id: 's-us-3', authorName: 'Emre K.', authorAvatar: '🎣', note: 'Fishermen lined up along the waterfront railing at dusk.' },
    { id: 's-us-4', authorName: 'Derya A.', authorAvatar: '🫖', note: 'Tea garden by the pier is packed, every table facing the water.' },
    { id: 's-us-5', authorName: 'Onur B.', authorAvatar: '🕊️', note: 'Seagulls circling the old pier again, louder than the traffic.' },
    { id: 's-us-6', authorName: 'Sibel R.', authorAvatar: '✨', note: 'Lights from Dolmabahçe just came on across the strait.' },
    { id: 's-us-7', authorName: 'Gül T.', authorAvatar: '🥯', note: "Simit seller's cart rattling past the ferry terminal." },
    { id: 's-us-8', authorName: 'Tarık Ç.', authorAvatar: '🏛️', note: 'Old wooden yalı catching the last light before sunset.' },
  ],
  'upper-west-side-nyc': [
    { id: 's-uws-1', authorName: 'Grace P.', authorAvatar: '🏃', note: 'Joggers lined up along the Hudson path as the sun comes up.' },
    { id: 's-uws-2', authorName: 'Daniel R.', authorAvatar: '🥯', note: 'Line at the bagel counter already out the door this morning.' },
    { id: 's-uws-3', authorName: 'Priya S.', authorAvatar: '🦕', note: 'Museum steps full of school groups again today.' },
    { id: 's-uws-4', authorName: 'Owen M.', authorAvatar: '🐕', note: 'Dog walkers converging at the Central Park entrance, a dozen leashes deep.' },
    { id: 's-uws-5', authorName: 'Lena K.', authorAvatar: '🌷', note: 'Doorman chatting with the flower delivery guy on the stoop.' },
    { id: 's-uws-6', authorName: 'Theo J.', authorAvatar: '🎷', note: 'Saxophone drifting up from the subway entrance on Broadway.' },
    { id: 's-uws-7', authorName: 'Nina B.', authorAvatar: '🥬', note: 'Farmers market setting up tables along the side street.' },
    { id: 's-uws-8', authorName: 'Max D.', authorAvatar: '🛴', note: 'Kids racing scooters down the brownstone stoops after school.' },
  ],
}
