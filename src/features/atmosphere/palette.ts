import type { SkyCondition } from '@/types'

export interface AtmospherePalette {
  sky: [string, string, string]
  glow: string
  particles: 'rain' | 'snow' | 'none'
  fog: number
  cloudOpacity: number
  starAlpha: number
}

/**
 * Maps weather condition + time-of-day to a cinematic gradient, independent
 * of raw hex values the user typed — tuned around the Dusk Blue / Sunset
 * Peach / Golden Hour palette from the design system.
 */
export function getAtmospherePalette(condition: SkyCondition, isDay: boolean, daylightProgress: number | null): AtmospherePalette {
  const nearSunrise = daylightProgress !== null && daylightProgress < 0.08
  const nearSunset = daylightProgress !== null && daylightProgress > 0.88
  const goldenHour = nearSunrise || nearSunset

  if (!isDay) {
    switch (condition) {
      case 'rain':
      case 'storm':
        return { sky: ['#1b2436', '#2b3550', '#454f68'], glow: '#687796', particles: 'rain', fog: 0.25, cloudOpacity: 0.5, starAlpha: 0 }
      case 'snow':
        return { sky: ['#1c2436', '#2e3750', '#4a5470'], glow: '#a2a7ad', particles: 'snow', fog: 0.3, cloudOpacity: 0.4, starAlpha: 0.1 }
      case 'fog':
        return { sky: ['#20242e', '#343a47', '#4d525e'], glow: '#79889b', particles: 'none', fog: 0.55, cloudOpacity: 0.3, starAlpha: 0 }
      case 'cloudy':
        return { sky: ['#171c28', '#272e3f', '#3c4457'], glow: '#687796', particles: 'none', fog: 0.15, cloudOpacity: 0.45, starAlpha: 0.15 }
      default:
        return { sky: ['#0e1420', '#1c2538', '#2e3a54'], glow: '#687796', particles: 'none', fog: 0.05, cloudOpacity: 0.15, starAlpha: 0.75 }
    }
  }

  if (goldenHour) {
    return { sky: ['#4a3b52', '#bd5a47', '#eea654'], glow: '#e8b77c', particles: condition === 'rain' ? 'rain' : 'none', fog: 0.1, cloudOpacity: 0.35, starAlpha: 0 }
  }

  switch (condition) {
    case 'rain':
    case 'storm':
      return { sky: ['#525e78', '#6a7690', '#8893a8'], glow: '#a2a7ad', particles: 'rain', fog: 0.2, cloudOpacity: 0.6, starAlpha: 0 }
    case 'snow':
      return { sky: ['#6f7a8c', '#8d96a6', '#c2c2b8'], glow: '#c2c2b8', particles: 'snow', fog: 0.15, cloudOpacity: 0.5, starAlpha: 0 }
    case 'fog':
      return { sky: ['#7d8794', '#9aa2ab', '#bfc2c2'], glow: '#a2a7ad', particles: 'none', fog: 0.6, cloudOpacity: 0.3, starAlpha: 0 }
    case 'cloudy':
      return { sky: ['#64718a', '#7f8ba0', '#a2a7ad'], glow: '#a2a7ad', particles: 'none', fog: 0.1, cloudOpacity: 0.55, starAlpha: 0 }
    case 'partly-cloudy':
      return { sky: ['#4e7fae', '#79a3c9', '#c2c2b8'], glow: '#eea654', particles: 'none', fog: 0.05, cloudOpacity: 0.35, starAlpha: 0 }
    default:
      return { sky: ['#2f6fb0', '#5a97cf', '#bfd7ea'], glow: '#eea654', particles: 'none', fog: 0, cloudOpacity: 0.2, starAlpha: 0 }
  }
}
