import { Sun, CloudSun, Cloud, CloudFog, CloudRain, CloudSnow, CloudLightning, Moon } from 'lucide-react'
import type { SkyCondition } from '@/types'

export function conditionIcon(condition: SkyCondition, isDay: boolean, size = 16) {
  const props = { size, strokeWidth: 1.8 }
  if (!isDay && (condition === 'clear' || condition === 'sunny')) return <Moon {...props} />
  switch (condition) {
    case 'clear':
    case 'sunny':
      return <Sun {...props} />
    case 'partly-cloudy':
      return <CloudSun {...props} />
    case 'cloudy':
      return <Cloud {...props} />
    case 'fog':
      return <CloudFog {...props} />
    case 'rain':
      return <CloudRain {...props} />
    case 'snow':
      return <CloudSnow {...props} />
    case 'storm':
      return <CloudLightning {...props} />
    default:
      return <Cloud {...props} />
  }
}
