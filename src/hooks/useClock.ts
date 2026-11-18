import { useEffect, useState } from 'react'

/** Ticks once a second; reduced-motion users still get accurate (if less animated) time. */
export function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}
