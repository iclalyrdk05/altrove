import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { clsx } from '@/utils/clsx'

interface GlassPanelProps {
  children: ReactNode
  className?: string
  id?: string
}

export function GlassPanel({ children, className, id }: GlassPanelProps) {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.98 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className={clsx('glass-surface rounded-[28px] shadow-[0_20px_60px_rgba(0,0,0,0.35)]', className)}
    >
      {children}
    </motion.div>
  )
}

export function Scrim({ onClick, elevated }: { onClick: () => void; elevated?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClick}
      className={clsx('fixed inset-0 bg-black/30 backdrop-blur-[2px]', elevated ? 'z-40' : 'z-30')}
    />
  )
}
