import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

// Pre-built skeleton components for common UI patterns
function UserCardSkeleton() {
  return (
    <div className="glass-card rounded-lg p-6 space-y-4">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-3 w-[150px]" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-[100px]" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
    </div>
  )
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="glass-card rounded-lg overflow-hidden">
      <div className="p-4 border-b border-border/50">
        <div className="flex space-x-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-[120px]" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-border/50">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4">
            <div className="flex space-x-4">
              {Array.from({ length: 4 }).map((_, colIndex) => (
                <Skeleton key={colIndex} className="h-4 w-[120px]" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export { Skeleton, UserCardSkeleton, TableSkeleton }
