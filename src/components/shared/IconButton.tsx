import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { clsx } from '@/utils/clsx'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  active?: boolean
  label: string
  size?: 'sm' | 'md'
}

export function IconButton({ children, active, label, size = 'md', className, ...props }: IconButtonProps) {
  return (
    <button
      aria-label={label}
      title={label}
      className={clsx(
        'glass-surface-soft flex items-center justify-center rounded-full text-white/85 transition-all duration-300',
        'hover:text-white hover:bg-white/15 active:scale-95',
        size === 'md' ? 'h-10 w-10' : 'h-8 w-8',
        active && 'bg-white/20 text-white ring-1 ring-white/40',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
