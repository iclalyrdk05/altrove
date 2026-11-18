import { useEffect, useRef } from 'react'

interface WeatherParticlesCanvasProps {
  particles: 'rain' | 'snow' | 'none'
  windSpeedKmh: number
  reducedMotion: boolean
  className?: string
}

interface Particle {
  x: number
  y: number
  len: number
  speed: number
  drift: number
  size: number
}

/** Rain/snow particle overlay, shared between the illustrated Atmosphere scene and real video footage. */
export function WeatherParticlesCanvas({ particles, windSpeedKmh, reducedMotion, className }: WeatherParticlesCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = (canvas.width = canvas.offsetWidth * devicePixelRatio)
    let height = (canvas.height = canvas.offsetHeight * devicePixelRatio)

    const count = particles === 'none' ? 0 : particles === 'rain' ? 180 : 90
    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      len: particles === 'rain' ? 14 + Math.random() * 18 : 0,
      speed: particles === 'rain' ? 9 + Math.random() * 7 : 1 + Math.random() * 1.5,
      drift: (windSpeedKmh / 40) * (particles === 'rain' ? 2.2 : 0.6),
      size: particles === 'snow' ? 1.5 + Math.random() * 2.5 : 1,
    }))

    function onResize() {
      if (!canvas) return
      width = canvas.width = canvas.offsetWidth * devicePixelRatio
      height = canvas.height = canvas.offsetHeight * devicePixelRatio
    }
    window.addEventListener('resize', onResize)

    if (reducedMotion || particles === 'none') {
      ctx.clearRect(0, 0, width, height)
      return () => window.removeEventListener('resize', onResize)
    }

    function tick() {
      if (!ctx) return
      ctx.clearRect(0, 0, width, height)
      for (const p of particlesRef.current) {
        if (particles === 'rain') {
          ctx.strokeStyle = 'rgba(220,228,240,0.35)'
          ctx.lineWidth = 1.2
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(p.x + p.drift * 3, p.y + p.len)
          ctx.stroke()
        } else {
          ctx.fillStyle = 'rgba(255,255,255,0.65)'
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * devicePixelRatio, 0, Math.PI * 2)
          ctx.fill()
        }
        p.y += p.speed * devicePixelRatio
        p.x += p.drift * devicePixelRatio
        if (p.y > height) {
          p.y = -20
          p.x = Math.random() * width
        }
        if (p.x > width) p.x = 0
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(rafRef.current)
    }
  }, [particles, windSpeedKmh, reducedMotion])

  return <canvas ref={canvasRef} className={className ?? 'absolute inset-0 h-full w-full'} />
}
