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
    <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-fit sm:max-w-full sm:flex-nowrap sm:gap-0 sm:overflow-x-auto sm:rounded-sm sm:bg-muted/30 sm:shadow-xs sm:divide-x sm:divide-border/50">
      {items.map((stat) => (
        <div
          key={stat.label}
          className="shrink-0 rounded-sm bg-muted/40 px-2.5 py-1.5 text-center sm:rounded-none sm:bg-transparent"
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
