import { useState } from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { cellColorClass } from "@/features/assign-seats/assign-seats.service"
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

/** Assign seats table — same interactions as desktop; site table chrome. */
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
    <div className="flex h-full min-h-0 flex-col bg-background px-3 pt-2 pb-2">
      <p className="shrink-0 pb-1.5 text-xs text-muted-foreground">
        Note: Double-click a cell to assign seats from that column across the
        row (up to remaining).
      </p>

      <div className="min-h-0 flex-1 overflow-auto rounded-lg border border-border/70 bg-background">
        <table className="w-max min-w-full border-collapse text-[11px] font-medium">
          <thead className="sticky top-0 z-10 bg-muted/90 backdrop-blur-sm">
            <tr className="border-b border-border/60">
              <th className="border-r border-border/50 px-1 py-0">
                <div className="flex h-10 w-[52px] flex-col justify-end pb-0.5 text-center text-xs font-semibold text-muted-foreground">
                  <span className="h-4" />
                  <span className="h-px w-full bg-border" />
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
                      "border-r border-border/50 px-0 py-0",
                      seatNo >= 5 && "bg-muted/70"
                    )}
                  >
                    <div className="flex h-10 w-[52px] flex-col items-center justify-end pb-0.5 text-xs font-semibold text-muted-foreground">
                      <span className="h-4 text-center text-[10px] text-muted-foreground/80">
                        {group}
                      </span>
                      <span className="h-px w-full bg-border" />
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
                  "h-5 border-b border-border/40 hover:bg-muted/50",
                  rowIndex % 2 === 1 ? "bg-muted/15" : "bg-background"
                )}
              >
                <td className="border-r border-border/40 px-1.5 text-center text-[11px] font-medium tabular-nums text-foreground">
                  {table.tableNo}
                </td>
                {table.seats.map((seat) => {
                  const filled =
                    Boolean(seat.reservationId) || Boolean(seat.isHold)
                  const selectedHere =
                    Boolean(seat.reservationId) &&
                    seat.reservationId === selectedReservationId
                  const greyed =
                    !filled &&
                    (Boolean(seat.readOnly) || seat.seatNo > table.maxSeats)

                  return (
                    <td
                      key={`${table.tableNo}-${seat.seatNo}`}
                      className={cn(
                        "border-r border-border/40 p-0",
                        greyed && "bg-muted/60"
                      )}
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
                          "flex h-5 min-w-[52px] max-w-[72px] items-center justify-start truncate px-1 text-left text-[11px] font-medium leading-none",
                          greyed
                            ? "bg-muted/60 text-muted-foreground hover:bg-muted"
                            : cellColorClass(
                                seat.color,
                                Boolean(seat.reservationId)
                              ),
                          seat.isHold && "bg-muted text-foreground",
                          selectedHere &&
                            !greyed &&
                            "ring-1 ring-inset ring-primary/40"
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
