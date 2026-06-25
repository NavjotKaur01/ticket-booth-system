import { cn } from "@/lib/utils"

type CheckInStatsGridProps = {
  items: readonly {
    label: string
    value: string | number
    highlight?: boolean
  }[]
  className?: string
}

export function CheckInStatsGrid({ items, className }: CheckInStatsGridProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-start gap-4 sm:gap-6 md:gap-8",
        className
      )}
    >
      {items.map((stat) => (
        <div key={stat.label} className="shrink-0 text-center">
          <p
            className={cn(
              "text-xl leading-none font-semibold tabular-nums sm:text-2xl",
              stat.highlight ? "text-emerald-600" : "text-foreground"
            )}
          >
            {stat.value}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}
