export type StatItem = {
  label: string
  value: string | number
}

type StatsBarProps = {
  items: readonly StatItem[]
}

/** Horizontal stat summary strip for filter panels and dashboards. */
export function StatsBar({ items }: StatsBarProps) {
  return (
    <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 lg:flex lg:w-auto lg:flex-nowrap lg:gap-0 lg:overflow-x-auto lg:rounded-sm lg:bg-muted/30 lg:shadow-xs lg:divide-x lg:divide-border/50">
      {items.map((stat) => (
        <div
          key={stat.label}
          className="shrink-0 rounded-sm bg-muted/40 px-2.5 py-1.5 text-center lg:min-w-[5.75rem] lg:rounded-none lg:bg-transparent"
        >
          <p className="text-[10px] font-medium tracking-wide whitespace-nowrap text-muted-foreground uppercase">
            {stat.label}
          </p>
          <p className="mt-0.5 text-base font-semibold tabular-nums text-foreground">
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  )
}
