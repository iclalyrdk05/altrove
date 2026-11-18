import { avatarPhotoUrl } from '@/features/community/avatarPhoto'
import { clsx } from '@/utils/clsx'

export function Avatar({
  seed,
  size = 36,
  className,
}: {
  seed: string
  emoji?: string
  size?: number
  className?: string
}) {
  return (
    <span
      className={clsx('relative inline-flex shrink-0 overflow-hidden rounded-full bg-white/10', className)}
      style={{ width: size, height: size }}
    >
      <img src={avatarPhotoUrl(seed)} alt="" className="h-full w-full object-cover" loading="lazy" />
    </span>
  )
}
