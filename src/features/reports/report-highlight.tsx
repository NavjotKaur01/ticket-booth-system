import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/** Primary hero metric for report summaries (e.g. tickets sold today). */
export function ReportHeroMetric({
  label,
  value,
  className,
}: {
  label: string
  value: string | number
  className?: string
}) {
  return (
    <div className={cn("inline-flex min-w-40 flex-col", className)}>
      <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-1 text-3xl leading-none font-bold tabular-nums text-primary">
        {value}
      </p>
    </div>
  )
}

/** Emphasized count badge for report section headers. */
export function ReportCountBadge({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border border-primary/25 bg-primary/5 px-3 py-1 text-sm font-semibold text-primary",
        className
      )}
    >
      {children}
    </span>
  )
}
