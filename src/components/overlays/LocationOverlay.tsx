import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Search, X, Clock, Bookmark, Check, Compass } from 'lucide-react'
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
    }
  }, [open])

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

  function visit(n: Neighborhood) {
    setLocation(n)
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
                const isActive = current.id === n.id
                const saved_ = isSaved(n.id)
                return (
                  <div
                    key={`${item.kind}-${i}-${n.id}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => visit(n)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') visit(n)
                    }}
                    className={clsx(
                      'mb-1 flex w-full cursor-pointer items-center justify-between gap-2 rounded-2xl px-3 py-2.5 text-left transition-colors',
                      isActive ? 'bg-white/15' : 'hover:bg-white/8',
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-medium text-white">{n.name}</p>
                      <p className="truncate text-[11.5px] text-white/45">
                        {n.city}, {n.country}
                      </p>
                    </div>
                    {isActive && (
                      <div className="flex shrink-0 items-center gap-1">
                        <Check size={15} className="text-olive" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleSaved(n)
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-white/50 hover:bg-white/10 hover:text-white"
                          aria-label={saved_ ? 'Remove from saved' : 'Save place'}
                        >
                          <Bookmark size={14} className={saved_ ? 'fill-linen text-linen' : ''} />
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
