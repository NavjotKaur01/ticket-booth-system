import { cn } from "@/lib/utils"
import {
  ASSIGN_SEATS_GRID,
  ASSIGN_SEATS_HEADER,
} from "@/features/assign-seats/assign-seats-styles"
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
  return "text-black"
}

/** Desktop Dinner / All TabControl + reservation DataGrid. */
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
    <div className="flex min-h-0 flex-1 flex-col bg-white px-0.5">
      <p className="shrink-0 px-1 py-0.5 text-[12px] text-black">
        Note : Single click to select record.
      </p>

      <div
        className="flex min-h-0 flex-1 flex-col border border-black bg-white"
      >
        <div className="flex shrink-0 border-b border-black">
          {(["dinner", "all"] as const).map((tab) => {
            const selected = filter === tab
            return (
              <button
                key={tab}
                type="button"
                className={cn(
                  "px-3 py-0.5 text-[12px] capitalize",
                  selected ? "bg-sky-300" : "bg-white hover:bg-[#f5f5f5]"
                )}
                onClick={() => onFilterChange(tab)}
              >
                {tab === "dinner" ? "Dinner" : "All"}
              </button>
            )
          })}
        </div>

        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full min-w-[36rem] border-collapse text-[10px] font-medium">
            <thead
              className="sticky top-0 z-10"
              style={{ backgroundColor: ASSIGN_SEATS_HEADER }}
            >
              <tr>
                {[
                  "Name",
                  "CreateDt",
                  "Qty",
                  "Rem",
                  "Promo",
                  "Section",
                  "Source",
                  "Notes",
                ].map((header) => (
                  <th
                    key={header}
                    className="border px-2 py-1.5 text-left text-[13px] font-semibold"
                    style={{ borderColor: ASSIGN_SEATS_GRID }}
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
                    colSpan={8}
                    className="border px-3 py-6 text-center text-[#666]"
                    style={{ borderColor: ASSIGN_SEATS_GRID }}
                  >
                    No reservations to assign.
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => {
                  const selected = row.id === selectedReservationId
                  return (
                    <tr
                      key={row.id}
                      className={cn(
                        "h-5 cursor-pointer hover:bg-[#cccccc]",
                        selected
                          ? "bg-[#c0c0c0]"
                          : index % 2 === 1
                            ? "bg-[#fbfbfb]"
                            : "bg-white",
                        rowTextColor(row)
                      )}
                      onClick={() => onSelect(row.id)}
                    >
                      <td
                        className="border px-2 py-0.5"
                        style={{ borderColor: ASSIGN_SEATS_GRID }}
                      >
                        {row.name}
                      </td>
                      <td
                        className="border px-2 py-0.5 text-center tabular-nums"
                        style={{ borderColor: ASSIGN_SEATS_GRID }}
                      >
                        {row.createDt}
                      </td>
                      <td
                        className="border px-2 py-0.5 text-center tabular-nums"
                        style={{ borderColor: ASSIGN_SEATS_GRID }}
                      >
                        {row.qty}
                      </td>
                      <td
                        className="border px-2 py-0.5 text-center tabular-nums"
                        style={{ borderColor: ASSIGN_SEATS_GRID }}
                      >
                        {row.rem}
                      </td>
                      <td
                        className="border px-2 py-0.5 text-center"
                        style={{ borderColor: ASSIGN_SEATS_GRID }}
                      >
                        {row.promo}
                      </td>
                      <td
                        className="border px-2 py-0.5 text-center"
                        style={{ borderColor: ASSIGN_SEATS_GRID }}
                      >
                        {row.section}
                      </td>
                      <td
                        className="border px-2 py-0.5 text-center"
                        style={{ borderColor: ASSIGN_SEATS_GRID }}
                      >
                        {row.source}
                      </td>
                      <td
                        className="max-w-[8rem] truncate border px-2 py-0.5"
                        style={{ borderColor: ASSIGN_SEATS_GRID }}
                      >
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
    </div>
  )
}
