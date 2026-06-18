import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Diamond,
} from "lucide-react"

import type { CheckInStatus } from "@/types/check-in"
import { cn } from "@/lib/utils"

// Check-in status icons, labels, and colors for table rows and legend.
const STATUS_CONFIG: Record<
  CheckInStatus,
  { icon: typeof CheckCircle2; label: string; className: string }
> = {
  "paid-checked-in": {
    icon: CheckCircle2,
    label: "Paid Checked in",
    className: "text-emerald-600",
  },
  "not-paid": {
    icon: AlertCircle,
    label: "Not Paid",
    className: "text-red-600",
  },
  "partial-check-in": {
    icon: AlertTriangle,
    label: "Partial Check-In",
    className: "text-amber-500",
  },
  "paid-not-seated": {
    icon: Diamond,
    label: "Paid not seated",
    className: "text-orange-500",
  },
}

/** Status icon rendered in the first column of each table row. */
export function CheckInStatusIcon({ status }: { status: CheckInStatus }) {
  const config = STATUS_CONFIG[status]
  const Icon = config.icon

  return (
    <Icon
      className={cn("size-4 shrink-0 fill-current/15", config.className)}
      aria-label={config.label}
    />
  )
}

type CheckInStatusLegendProps = {
  recordCount?: number
}

// Status icon legend and filtered record count above the check-in table.
export function CheckInStatusLegend({ recordCount }: CheckInStatusLegendProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 border-b px-2.5 py-2 lg:px-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
        {(Object.keys(STATUS_CONFIG) as CheckInStatus[]).map((status) => {
          const config = STATUS_CONFIG[status]
          const Icon = config.icon

          return (
            <span key={status} className="flex items-center gap-1">
              <Icon
                className={cn("size-3 fill-current/15", config.className)}
                aria-hidden
              />
              {config.label}
            </span>
          )
        })}
      </div>

      {recordCount !== undefined && (
        <p className="shrink-0 text-xs text-muted-foreground">
          Records:{" "}
          <span className="font-semibold tabular-nums text-foreground">
            {recordCount}
          </span>
        </p>
      )}
    </div>
  )
}
