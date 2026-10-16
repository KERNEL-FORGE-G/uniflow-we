import { cn } from '../../utils/cn'

export function Skeleton({
  className,
  variant = 'default',
}: {
  className?: string
  variant?: 'default' | 'text' | 'circle' | 'rounded'
}) {
  const variants = {
    default: 'rounded-lg',
    text: 'rounded h-4',
    circle: 'rounded-full',
    rounded: 'rounded-xl',
  }

  return (
    <div
      className={cn(
        'skeleton bg-gradient-to-r from-[#f3f4f6] via-[#e5e7eb] to-[#f3f4f6] animate-skeleton',
        variants[variant],
        className,
      )}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-[#e5e7eb] bg-white p-5 space-y-3">
      <Skeleton className="h-6 w-2/3" />
      <Skeleton variant="text" className="w-full" />
      <Skeleton variant="text" className="w-4/5" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-[#e5e7eb] bg-white overflow-hidden">
      <div className="bg-[#f9fafb] p-4 border-b border-[#e5e7eb]">
        <div className="flex gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-4 w-24" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-[#f3f4f6]">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex gap-4 items-center">
            <Skeleton variant="circle" className="h-10 w-10" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton variant="text" className="w-1/2" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}
