import { cn } from "@/lib/utils"
import type { AssignSeatReservationRow } from "@/features/assign-seats/assign-seats.types"

type AssignSeatsReservationListProps = {
  reservations: AssignSeatReservationRow[]
  selectedReservationId: string | null
  filter: "dinner" | "all"
  onFilterChange: (filter: "dinner" | "all") => void
  onSelect: (reservationId: string) => void
}

function rowTextColor(row: AssignSeatReservationRow) {
  if (row.isDinner) {
    return "text-orange-500"
  }
  if (row.source.toLowerCase().includes("web")) {
    return "text-red-600"
  }
  if (row.promo.trim()) {
    return "text-blue-600"
  }
  return "text-foreground"
}

const HEADERS = [
  "Name",
  "CreateDt",
  "Qty",
  "Rem",
  "Promo",
  "Section",
  "Source",
  "Notes",
] as const

/** Dinner / All filter + reservation list — site filter / table chrome. */
export function AssignSeatsReservationList({
  reservations,
  selectedReservationId,
  filter,
  onFilterChange,
  onSelect,
}: AssignSeatsReservationListProps) {
  // Desktop AssignSeatsRemainningConverter: hide rows when Rem == 0.
  const rows = (
    filter === "dinner"
      ? reservations.filter((row) => row.isDinner)
      : reservations
  ).filter((row) => Number(row.rem) > 0)

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 bg-background px-3 pb-3 pt-1">
      <p className="shrink-0 text-xs text-muted-foreground">
        Note: Single-click to select a record.
      </p>

      <div className="inline-flex w-fit shrink-0 rounded-lg border border-border/70 bg-muted/40 p-0.5">
        {(["dinner", "all"] as const).map((tab) => {
          const selected = filter === tab
          return (
            <button
              key={tab}
              type="button"
              className={cn(
                "rounded-md px-3.5 py-1.5 text-xs font-medium capitalize transition-colors",
                selected
                  ? "bg-background text-foreground shadow-sm ring-1 ring-border/60"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => onFilterChange(tab)}
            >
              {tab === "dinner" ? "Dinner" : "All"}
            </button>
          )
        })}
      </div>

      <div className="min-h-0 flex-1 overflow-auto rounded-lg border border-border/70 bg-background">
        <table className="w-full min-w-[36rem] caption-bottom border-collapse text-xs">
          <thead className="sticky top-0 z-10 bg-muted/90 backdrop-blur-sm">
            <tr className="border-b border-border/60">
              {HEADERS.map((header) => (
                <th
                  key={header}
                  className="h-9 px-2.5 text-left align-middle text-[11px] font-semibold whitespace-nowrap text-muted-foreground"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={HEADERS.length}
                  className="h-24 px-3 text-center text-sm text-muted-foreground"
                >
                  No reservations to assign.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const selected = row.id === selectedReservationId
                return (
                  <tr
                    key={row.id}
                    className={cn(
                      "cursor-pointer border-b border-border/50 transition-colors hover:bg-muted/50",
                      selected && "bg-primary/10 hover:bg-primary/15",
                      rowTextColor(row)
                    )}
                    onClick={() => onSelect(row.id)}
                  >
                    <td className="px-2.5 py-1.5 align-middle font-medium whitespace-nowrap">
                      {row.name}
                    </td>
                    <td className="px-2.5 py-1.5 text-center align-middle tabular-nums whitespace-nowrap">
                      {row.createDt}
                    </td>
                    <td className="px-2.5 py-1.5 text-center align-middle tabular-nums whitespace-nowrap">
                      {row.qty}
                    </td>
                    <td className="px-2.5 py-1.5 text-center align-middle tabular-nums whitespace-nowrap">
                      {row.rem}
                    </td>
                    <td className="px-2.5 py-1.5 text-center align-middle whitespace-nowrap">
                      {row.promo}
                    </td>
                    <td className="px-2.5 py-1.5 text-center align-middle whitespace-nowrap">
                      {row.section}
                    </td>
                    <td className="px-2.5 py-1.5 text-center align-middle whitespace-nowrap">
                      {row.source}
                    </td>
                    <td className="max-w-[8rem] truncate px-2.5 py-1.5 align-middle">
                      {row.notes}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
