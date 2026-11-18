import { useEffect } from 'react'
import type { RefObject } from 'react'

/**
 * Closes a floating panel on outside pointerdown, while ignoring clicks on
 * elements marked `data-dock-trigger` so a trigger button's own onClick can
 * decide whether to open a different panel or toggle the current one closed
 * without the outside-click handler racing it.
 */
export function useOutsideClose(ref: RefObject<HTMLElement | null>, onClose: () => void, active: boolean) {
  useEffect(() => {
    if (!active) return
    function handler(e: PointerEvent) {
      const target = e.target as HTMLElement
      if (ref.current?.contains(target)) return
      if (target.closest('[data-dock-trigger]')) return
      onClose()
    }
    document.addEventListener('pointerdown', handler)
    return () => document.removeEventListener('pointerdown', handler)
  }, [active, onClose, ref])
}
