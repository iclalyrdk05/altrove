/**
 * Sunrise/sunset approximation (NOAA simplified solar position algorithm).
 * Accurate to within a few minutes — sufficient for an atmospheric daylight arc,
 * not for navigation or legal use.
 */
function toRadians(deg: number) {
  return (deg * Math.PI) / 180
}
function toDegrees(rad: number) {
  return (rad * 180) / Math.PI
}

function julianDay(date: Date) {
  return date.getTime() / 86400000 + 2440587.5
}

function calcSunTimesUTC(date: Date, lat: number, lon: number) {
  const jd = julianDay(date)
  const J2000 = 2451545.0
  const J0 = 0.0009
  // `n` must be rounded to the nearest whole day before being used — without
  // that snap, meanSolarNoon/solarTransit drift to stay near whatever exact
  // instant `date` happens to be (instead of solving for that calendar day's
  // real solar noon), which made isDay silently evaluate close to "true"
  // around any current moment rather than reflecting the actual time of day.
  // This was invisible for neighborhoods near the Greenwich meridian (the
  // drift is proportional to |lon|) but badly wrong for Istanbul/Tokyo/NYC.
  const nStar = jd - J2000 - J0 + lon / 360
  const n = Math.round(nStar)
  const meanSolarNoon = J0 - lon / 360 + n
  const solarMeanAnomaly = (357.5291 + 0.98560028 * meanSolarNoon) % 360
  const M = toRadians(solarMeanAnomaly)
  const center =
    1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M)
  const eclipticLongitude = (solarMeanAnomaly + center + 180 + 102.9372) % 360
  const lambda = toRadians(eclipticLongitude)
  const solarTransit =
    J2000 + meanSolarNoon + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * lambda)
  const sinDeclination = Math.sin(lambda) * Math.sin(toRadians(23.4397))
  const declination = Math.asin(sinDeclination)

  const latRad = toRadians(lat)
  const cosHourAngle =
    (Math.sin(toRadians(-0.833)) - Math.sin(latRad) * Math.sin(declination)) /
    (Math.cos(latRad) * Math.cos(declination))

  if (cosHourAngle > 1) return { sunrise: null, sunset: null, polar: 'night' as const }
  if (cosHourAngle < -1) return { sunrise: null, sunset: null, polar: 'day' as const }

  const hourAngle = toDegrees(Math.acos(cosHourAngle))
  const jRise = solarTransit - hourAngle / 360
  const jSet = solarTransit + hourAngle / 360

  const jdToDate = (j: number) => new Date((j - 2440587.5) * 86400000)
  return { sunrise: jdToDate(jRise), sunset: jdToDate(jSet), polar: null }
}

export interface SunTimes {
  sunrise: Date | null
  sunset: Date | null
  polar: 'day' | 'night' | null
  isDay: boolean
  /** 0 = sunrise, 1 = sunset, fraction of daylight elapsed; null outside daylight */
  daylightProgress: number | null
}

export function getSunTimes(date: Date, lat: number, lon: number): SunTimes {
  const { sunrise, sunset, polar } = calcSunTimesUTC(date, lat, lon)
  if (polar) {
    return { sunrise: null, sunset: null, polar, isDay: polar === 'day', daylightProgress: polar === 'day' ? 0.5 : null }
  }
  if (!sunrise || !sunset) {
    return { sunrise: null, sunset: null, polar: null, isDay: true, daylightProgress: null }
  }
  const isDay = date >= sunrise && date <= sunset
  const daylightProgress = isDay
    ? (date.getTime() - sunrise.getTime()) / (sunset.getTime() - sunrise.getTime())
    : null
  return { sunrise, sunset, polar: null, isDay, daylightProgress }
}

export function formatTimeInZone(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

export function formatTimeShort(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}

export function formatDateInZone(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function getTimeZoneAbbreviation(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'short',
  }).formatToParts(date)
  return parts.find((p) => p.type === 'timeZoneName')?.value ?? timeZone
}

/** Offset in minutes of a timezone from UTC at a given instant (handles DST). */
export function getTimezoneOffsetMinutes(date: Date, timeZone: string) {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
  const parts = dtf.formatToParts(date).reduce<Record<string, string>>((acc, p) => {
    if (p.type !== 'literal') acc[p.type] = p.value
    return acc
  }, {})
  const asUTC = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour) === 24 ? 0 : Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  )
  return (asUTC - date.getTime()) / 60000
}

export interface TimeDifference {
  diffHours: number
  diffMinutesRemainder: number
  label: string
  dayRelation: 'same day' | 'a day ahead' | 'a day behind'
}

export function getTimeDifference(date: Date, locationZone: string, referenceZone: string): TimeDifference {
  const locationOffset = getTimezoneOffsetMinutes(date, locationZone)
  const referenceOffset = getTimezoneOffsetMinutes(date, referenceZone)
  const diffMinutes = locationOffset - referenceOffset
  const sign = diffMinutes >= 0 ? '+' : '-'
  const abs = Math.abs(diffMinutes)
  const diffHours = Math.floor(abs / 60)
  const diffMinutesRemainder = Math.round(abs % 60)

  const label =
    abs === 0
      ? 'Same time'
      : `${sign}${diffHours}${diffMinutesRemainder ? `:${String(diffMinutesRemainder).padStart(2, '0')}` : ''}h`

  const locationDay = new Intl.DateTimeFormat('en-US', { timeZone: locationZone, day: 'numeric' }).format(date)
  const referenceDay = new Intl.DateTimeFormat('en-US', { timeZone: referenceZone, day: 'numeric' }).format(date)
  let dayRelation: TimeDifference['dayRelation'] = 'same day'
  if (locationDay !== referenceDay) {
    dayRelation = diffMinutes >= 0 ? 'a day ahead' : 'a day behind'
  }

  return { diffHours, diffMinutesRemainder, label, dayRelation }
}
