import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Sparkles } from 'lucide-react'
import { useCommunityStore, isMomentActive } from '@/stores/communityStore'
import { useLocationStore } from '@/stores/locationStore'
import { useUIStore } from '@/stores/uiStore'
import { Avatar } from '@/components/shared/Avatar'

const VISIBLE_MS = 6000
/** Visual gap (px) between this toast's bottom edge and the dock bar's own top edge. */
const DOCK_GAP = 16

/**
 * A quiet bottom toast for newly-arrived Moments in the neighborhood the
 * viewer currently has open — skips the viewer's own posts (no need to
 * notify yourself) and anything that arrived for a neighborhood that isn't
 * the one on screen right now.
 */
export function MomentToast() {
  const latestMomentId = useCommunityStore((s) => s.latestMomentId)
  const moments = useCommunityStore((s) => s.moments)
  const neighborhoodId = useLocationStore((s) => s.current.id)
  const setCommunityOverlayOpen = useUIStore((s) => s.setCommunityOverlayOpen)
  const dockTopOffset = useUIStore((s) => s.dockTopOffset)
  const [visible, setVisible] = useState(false)
  const seenRef = useRef<string | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const moment = moments.find((m) => m.id === latestMomentId) ?? null

  useEffect(() => {
    if (!moment || moment.id === seenRef.current) return
    seenRef.current = moment.id
    if (moment.authorName === 'You' || moment.neighborhoodId !== neighborhoodId || !isMomentActive(moment)) return

    setVisible(true)
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setVisible(false), VISIBLE_MS)
    return () => clearTimeout(timeoutRef.current)
  }, [moment, neighborhoodId])

  function open() {
    setVisible(false)
    setCommunityOverlayOpen(true)
  }

  return (
    <AnimatePresence>
      {visible && moment && (
        <motion.button
          initial={{ opacity: 0, x: 24, scale: 0.97 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 16, scale: 0.97 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          onClick={open}
          style={{ bottom: dockTopOffset + DOCK_GAP }}
          className="glass-surface pointer-events-auto fixed right-4 z-30 flex w-[88%] max-w-[320px] items-start gap-2.5 rounded-[20px] p-3.5 text-left shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
        >
          <Avatar seed={moment.authorId ?? moment.id} emoji={moment.authorAvatar} size={36} />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1 text-[12px] font-medium text-white/90">
              <Sparkles size={11} className="text-rose" />
              New moment from {moment.authorName}
            </p>
            <p className="mt-0.5 line-clamp-2 text-[12.5px] leading-snug text-white/65">{moment.note}</p>
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
