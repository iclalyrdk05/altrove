import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Search, X, Clock, Bookmark, BookmarkCheck, Check, Compass } from 'lucide-react'
import { NEIGHBORHOODS } from '@/features/locations/data'
import { neighborhoodFromGeocode } from '@/features/locations/custom'
import { searchPlaces, type GeocodeResult } from '@/providers/weather'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useLocationStore } from '@/stores/locationStore'
import { useUIStore } from '@/stores/uiStore'
import { Scrim } from '@/components/shared/GlassPanel'
import { clsx } from '@/utils/clsx'
import type { Neighborhood } from '@/types'

export function LocationOverlay() {
  const open = useUIStore((s) => s.locationOverlayOpen)
  const setOpen = useUIStore((s) => s.setLocationOverlayOpen)
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query, 350)
  const [results, setResults] = useState<GeocodeResult[]>([])
  const [searching, setSearching] = useState(false)
  const [candidate, setCandidate] = useState<Neighborhood | null>(null)
  const [tab, setTab] = useState<'curated' | 'recent' | 'saved'>('curated')

  const current = useLocationStore((s) => s.current)
  const recents = useLocationStore((s) => s.recents)
  const saved = useLocationStore((s) => s.saved)
  const setLocation = useLocationStore((s) => s.setLocation)
  const toggleSaved = useLocationStore((s) => s.toggleSaved)
  const isSaved = useLocationStore((s) => s.isSaved)

  useEffect(() => {
    if (!open) {
      setQuery('')
      setResults([])
      setCandidate(null)
      return
    }
    setCandidate(current)
  }, [open, current])

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([])
      return
    }
    setSearching(true)
    const controller = new AbortController()
    searchPlaces(debouncedQuery, controller.signal)
      .then((r) => setResults(r))
      .finally(() => setSearching(false))
    return () => controller.abort()
  }, [debouncedQuery])

  const curatedFiltered = query.trim()
    ? NEIGHBORHOODS.filter(
        (n) =>
          n.name.toLowerCase().includes(query.toLowerCase()) ||
          n.city.toLowerCase().includes(query.toLowerCase()) ||
          n.country.toLowerCase().includes(query.toLowerCase()),
      )
    : NEIGHBORHOODS

  function confirm() {
    if (!candidate) return
    setLocation(candidate)
    setOpen(false)
  }

  const list = query.trim()
    ? [...curatedFiltered.map((n) => ({ kind: 'curated' as const, n })), ...results.map((r) => ({ kind: 'geocode' as const, r }))]
    : tab === 'curated'
      ? NEIGHBORHOODS.map((n) => ({ kind: 'curated' as const, n }))
      : tab === 'recent'
        ? recents.map((n) => ({ kind: 'curated' as const, n }))
        : saved.map((n) => ({ kind: 'curated' as const, n }))

  return (
    <AnimatePresence>
      {open && (
        <>
          <Scrim onClick={() => setOpen(false)} />
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="glass-surface fixed bottom-4 left-4 top-4 z-40 flex w-[380px] max-w-[88vw] flex-col overflow-hidden rounded-[26px] shadow-[0_30px_90px_rgba(0,0,0,0.5)]"
          >
            <div className="flex items-center gap-2 border-b border-white/10 p-4">
              <Search size={16} className="text-white/40" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search a neighborhood, city, country…"
                className="flex-1 bg-transparent text-[14px] text-white placeholder:text-white/35 focus:outline-none"
              />
              <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white">
                <X size={16} />
              </button>
            </div>

            {!query.trim() && (
              <div className="flex gap-1 px-4 pt-3">
                {(
                  [
                    { id: 'curated', label: 'Featured', icon: <Compass size={12} /> },
                    { id: 'recent', label: 'Recent', icon: <Clock size={12} /> },
                    { id: 'saved', label: 'Saved', icon: <Bookmark size={12} /> },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={clsx(
                      'flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium transition-colors',
                      tab === t.id ? 'bg-white/18 text-white' : 'text-white/45 hover:text-white/70',
                    )}
                  >
                    {t.icon}
                    {t.label}
                  </button>
                ))}
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-2 py-3">
              {searching && <p className="px-2 py-2 text-[12px] text-white/35">Searching…</p>}
              {list.length === 0 && (
                <p className="px-3 py-6 text-center text-[12px] text-white/35">
                  {tab === 'recent' ? 'No recent neighborhoods yet.' : tab === 'saved' ? 'No saved places yet.' : 'No matches found.'}
                </p>
              )}
              {list.map((item, i) => {
                const n = item.kind === 'curated' ? item.n : neighborhoodFromGeocode(item.r)
                const isActive = candidate?.id === n.id
                return (
                  <button
                    key={`${item.kind}-${i}-${n.id}`}
                    onClick={() => setCandidate(n)}
                    className={clsx(
                      'mb-1 flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left transition-colors',
                      isActive ? 'bg-white/15' : 'hover:bg-white/8',
                    )}
                  >
                    <div>
                      <p className="text-[13.5px] font-medium text-white">{n.name}</p>
                      <p className="text-[11.5px] text-white/45">
                        {n.city}, {n.country}
                      </p>
                    </div>
                    {isActive && <Check size={15} className="text-olive" />}
                  </button>
                )
              })}
            </div>

            {/* compact selected-neighborhood summary + actions — no separate map panel */}
            <AnimatePresence>
              {candidate && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="shrink-0 border-t border-white/10 p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-semibold text-white">{candidate.name}</p>
                      <p className="text-[12px] text-white/55">
                        {candidate.city}, {candidate.country}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleSaved(candidate)}
                      className="glass-surface-soft flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/70 hover:text-white"
                      aria-label="Save place"
                    >
                      {isSaved(candidate.id) ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
                    </button>
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-[12px] leading-snug text-white/55">{candidate.blurb}</p>
                  <button
                    onClick={confirm}
                    disabled={candidate.id === current.id}
                    className="mt-3 w-full rounded-full bg-linen py-2.5 text-[13px] font-semibold text-wine transition-opacity hover:bg-white disabled:opacity-40"
                    style={{ color: '#6c1c37' }}
                  >
                    {candidate.id === current.id ? 'Currently Viewing' : 'Visit This Neighborhood'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
