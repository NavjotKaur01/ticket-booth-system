import { useState } from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { cellColorClass } from "@/features/assign-seats/assign-seats.service"
import {
  ASSIGN_SEATS_GRID,
  ASSIGN_SEATS_HEADER,
} from "@/features/assign-seats/assign-seats-styles"
import type { AssignSeatTableRow } from "@/features/assign-seats/assign-seats.types"

type ContextTarget = {
  tableNo: string
  seatNo: number
  reservationId: string | null
}

type AssignSeatsTableGridProps = {
  tables: AssignSeatTableRow[]
  seatCount: number
  selectedReservationId: string | null
  onAssignCell: (tableNo: string, seatNo: number) => void
  onClearCell: (tableNo: string, seatNo: number) => void
  onHoldSeat: (tableNo: string, seatNo: number) => void
  onRemoveFromTable: (tableNo: string) => void
  onRemoveReservation: (reservationId: string) => void
}

/** Desktop assignSeatsList DataGrid — Table + Seat1…Seat10 with A/B headers. */
export function AssignSeatsTableGrid({
  tables,
  seatCount,
  selectedReservationId,
  onAssignCell,
  onClearCell,
  onHoldSeat,
  onRemoveFromTable,
  onRemoveReservation,
}: AssignSeatsTableGridProps) {
  const seatNumbers = Array.from({ length: seatCount }, (_, index) => index + 1)
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 })
  const [contextTarget, setContextTarget] = useState<ContextTarget | null>(null)

  return (
    <div className="flex h-full min-h-0 flex-col bg-white px-2.5 pt-1">
      <p className="shrink-0 py-0.5 text-[12px] text-black">
        Note : Double click on cell to Assign seat.
      </p>

      <div
        className="min-h-0 flex-1 overflow-auto border"
        style={{ borderColor: ASSIGN_SEATS_GRID }}
      >
        <table className="w-max min-w-full border-collapse text-[10px] font-medium">
          <thead
            className="sticky top-0 z-10"
            style={{ backgroundColor: ASSIGN_SEATS_HEADER }}
          >
            <tr>
              <th
                className="border px-1 py-0"
                style={{ borderColor: ASSIGN_SEATS_GRID }}
              >
                <div className="flex h-10 w-[50px] flex-col justify-end pb-0.5 text-center text-[13px] font-semibold">
                  <span className="h-4" />
                  <span className="h-px w-full bg-[#d3d3d3]" />
                  <span>Table</span>
                </div>
              </th>
              {seatNumbers.map((seatNo) => {
                const group =
                  seatNo === 1 || seatNo === 2
                    ? "A"
                    : seatNo === 3 || seatNo === 4
                      ? "B"
                      : ""
                return (
                  <th
                    key={seatNo}
                    className={cn(
                      "border px-0 py-0",
                      seatNo >= 5 && "bg-[#d0d0d0]"
                    )}
                    style={{ borderColor: ASSIGN_SEATS_GRID }}
                  >
                    <div className="flex h-10 w-[50px] flex-col items-center justify-end pb-0.5 text-[13px] font-semibold">
                      <span className="h-4 text-center">{group}</span>
                      <span className="h-px w-full bg-[#d3d3d3]" />
                      <span>Seat{seatNo}</span>
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {tables.map((table, rowIndex) => (
              <tr
                key={table.tableNo}
                className={cn(
                  "h-5 hover:bg-[#cccccc]",
                  rowIndex % 2 === 1 ? "bg-[#fbfbfb]" : "bg-white"
                )}
              >
                <td
                  className="border px-1.5 text-center text-[10px] font-medium tabular-nums text-black"
                  style={{ borderColor: ASSIGN_SEATS_GRID }}
                >
                  {table.tableNo}
                </td>
                {table.seats.map((seat) => {
                  const filled = Boolean(seat.reservationId) || Boolean(seat.isHold)
                  const selectedHere =
                    Boolean(seat.reservationId) &&
                    seat.reservationId === selectedReservationId
                  // Desktop LightGray for seats above MaxSeats (typically Seat5–10).
                  const greyed =
                    !filled &&
                    (Boolean(seat.readOnly) || seat.seatNo > table.maxSeats)

                  return (
                    <td
                      key={`${table.tableNo}-${seat.seatNo}`}
                      className={cn("border p-0", greyed && "bg-[#d3d3d3]")}
                      style={{ borderColor: ASSIGN_SEATS_GRID }}
                      onContextMenu={(event) => {
                        event.preventDefault()
                        setContextTarget({
                          tableNo: table.tableNo,
                          seatNo: seat.seatNo,
                          reservationId: seat.reservationId,
                        })
                        setMenuPos({ x: event.clientX, y: event.clientY })
                        setMenuOpen(true)
                      }}
                    >
                      <button
                        type="button"
                        className={cn(
                          "flex h-5 min-w-[50px] max-w-[70px] items-center justify-start truncate px-1 text-left text-[10px] font-medium leading-none",
                          greyed
                            ? "bg-[#d3d3d3] text-black hover:bg-[#c8c8c8]"
                            : cellColorClass(
                                seat.color,
                                Boolean(seat.reservationId)
                              ),
                          seat.isHold && "bg-[#c0c0c0] text-black",
                          selectedHere && !greyed && "bg-[#f1f1f1]"
                        )}
                        onDoubleClick={() => {
                          if (seat.reservationId || seat.isHold) {
                            onClearCell(table.tableNo, seat.seatNo)
                            return
                          }
                          onAssignCell(table.tableNo, seat.seatNo)
                        }}
                      >
                        {seat.displayName}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="fixed size-0 overflow-hidden opacity-0"
            style={{ left: menuPos.x, top: menuPos.y }}
            aria-hidden
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[11rem]">
          <DropdownMenuItem
            onSelect={() => {
              if (contextTarget) {
                onHoldSeat(contextTarget.tableNo, contextTarget.seatNo)
              }
            }}
          >
            Hold
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              if (contextTarget) {
                onClearCell(contextTarget.tableNo, contextTarget.seatNo)
              }
            }}
          >
            Remove from Seat
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              if (contextTarget) {
                onRemoveFromTable(contextTarget.tableNo)
              }
            }}
          >
            Remove from Table
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!contextTarget?.reservationId}
            onSelect={() => {
              if (contextTarget?.reservationId) {
                onRemoveReservation(contextTarget.reservationId)
              }
            }}
          >
            Remove Reservation
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
