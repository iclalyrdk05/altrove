export interface RealStreetSound {
  url: string
  credit: string
  label: string
}

/**
 * Real field recordings (Freesound.org, CC BY) used instead of the
 * procedurally synthesized street bed for neighborhoods where a genuine,
 * properly licensed recording of that actual city was found. Picked by the
 * same activity-level logic as the synthesized fallback — busy picks the
 * busier recording, everything else picks the calmer one.
 */
export const REAL_STREET_SOUND: Record<string, { busy: RealStreetSound; calm: RealStreetSound }> = {
  'kadikoy-istanbul': {
    busy: {
      url: 'https://cdn.freesound.org/previews/274/274968_1646625-hq.mp3',
      credit: 'tagirov / Freesound.org, CC BY 4.0',
      label: 'Istanbul Spice Bazaar, recorded on site',
    },
    calm: {
      url: 'https://cdn.freesound.org/previews/19/19029_5726-hq.mp3',
      credit: 'sazman / Freesound.org, CC BY 4.0',
      label: 'Ferry horns and call to prayer near Eminönü',
    },
  },
  'greenwich-village-nyc': {
    busy: {
      url: 'https://cdn.freesound.org/previews/552/552120_716433-hq.mp3',
      credit: 'quantumriver / Freesound.org, CC0',
      label: 'Busy New York City street, Times Square',
    },
    calm: {
      url: 'https://cdn.freesound.org/previews/871/871593_300738-hq.mp3',
      credit: 'brunoboselli / Freesound.org, CC0',
      label: 'Quiet night traffic, distant',
    },
  },
  'trastevere-rome': {
    busy: {
      url: 'https://cdn.freesound.org/previews/367/367694_7037-hq.mp3',
      credit: 'tim.kahn / Freesound.org, CC BY-NC 4.0',
      label: 'Via della Maddalena, near the Trevi Fountain',
    },
    calm: {
      url: 'https://cdn.freesound.org/previews/711/711025_664439-hq.mp3',
      credit: 'iscence / Freesound.org, CC0',
      label: 'Church bells and voices in Rome',
    },
  },
  'jordaan-amsterdam': {
    busy: {
      url: 'https://cdn.freesound.org/previews/316/316734_2962342-hq.mp3',
      credit: 'nebulousflynn / Freesound.org, CC BY 4.0',
      label: 'Bicycles and traffic on an Amsterdam street',
    },
    calm: {
      url: 'https://cdn.freesound.org/previews/444/444660_4213224-hq.mp3',
      credit: 'MirkaElina / Freesound.org, CC0',
      label: 'Quiet evening street, Amsterdam',
    },
  },
  'shibuya-tokyo': {
    busy: {
      url: 'https://cdn.freesound.org/previews/75/75271_384438-hq.mp3',
      credit: 'markystar / Freesound.org, CC0',
      label: 'Busy Tokyo street, evening rush hour',
    },
    calm: {
      url: 'https://cdn.freesound.org/previews/44/44616_384438-hq.mp3',
      credit: 'markystar / Freesound.org, CC0',
      label: 'Quiet residential Tokyo intersection, late at night',
    },
  },
  'kreuzberg-berlin': {
    busy: {
      url: 'https://cdn.freesound.org/previews/393/393701_4994127-hq.mp3',
      credit: 'vdr3 / Freesound.org, CC0',
      label: 'Hallesches Tor U-Bahn, Kreuzberg',
    },
    calm: {
      url: 'https://cdn.freesound.org/previews/474/474190_5474387-hq.mp3',
      credit: 'OneTwo_BER / Freesound.org, CC0',
      label: 'A calm summer evening on a Berlin street',
    },
  },
}

export function getRealStreetSound(neighborhoodId: string, isBusy: boolean): RealStreetSound | null {
  const entry = REAL_STREET_SOUND[neighborhoodId]
  if (!entry) return null
  return isBusy ? entry.busy : entry.calm
}
