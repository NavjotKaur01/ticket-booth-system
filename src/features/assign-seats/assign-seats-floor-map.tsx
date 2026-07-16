import { useState } from "react"

import {
  CHART_COL_WIDTHS,
  CHART_COLS,
  CHART_ROWS,
} from "@/features/assign-seats/assign-seats-chart-layout"
import type {
  AssignSeatChartState,
  AssignSeatTableRow,
} from "@/features/assign-seats/assign-seats.types"

type AssignSeatsFloorMapProps = {
  chart: AssignSeatChartState
  tables: AssignSeatTableRow[]
  visible: boolean
}

/**
 * Desktop AssignSeats.xaml flexGrid:
 * - Background ImageBrush = AssignSeatChart (Columbus.jpg)
 * - Transparent chartGrid DataGrid = ChartD (P1…P21 text, Black→Red when full)
 */
export function AssignSeatsFloorMap({
  chart,
  tables,
  visible,
}: AssignSeatsFloorMapProps) {
  const [imageFailed, setImageFailed] = useState(false)

  if (!visible) {
    return null
  }

  const fullByTable = new Map(
    tables.map((table) => {
      const assigned = table.seats.filter(
        (seat) => seat.reservationId || seat.isHold || seat.displayName
      ).length
      return [
        table.tableNo,
        assigned >= table.maxSeats && table.maxSeats > 0,
      ] as const
    })
  )

  const showImage = Boolean(chart.imageUrl) && !imageFailed
  const totalWidth = CHART_COL_WIDTHS.reduce((sum, w) => sum + w, 0)

  // Build 13×13 primary cell map from overlay (col 0…12 = P1…P13).
  const cellMap = new Map<string, { tableNo: string; isFull: boolean }>()
  for (const cell of chart.overlay) {
    if (cell.col < 0 || cell.col >= CHART_COLS) {
      continue
    }
    cellMap.set(`${cell.row}:${cell.col}`, {
      tableNo: cell.tableNo,
      isFull: cell.isFull || (fullByTable.get(cell.tableNo) ?? false),
    })
  }

  return (
    <div
      className="relative h-[280px] max-h-[280px] min-h-[280px] shrink-0 overflow-hidden border-b border-[#dbdbdb] bg-white"
      style={{ opacity: 1 }}
    >
      {/* ImageBrush equivalent — Stretch Fill */}
      {showImage ? (
        <img
          key={chart.imageUrl}
          src={chart.imageUrl!}
          alt="Seating chart"
          className="absolute inset-0 h-full w-full select-none"
          style={{
            opacity: chart.opacity,
            // Numbered charts (Tampa/Liberty): contain. Columbus empty boxes: fill.
            objectFit: chart.fillVisible ? "fill" : "contain",
          }}
          onLoad={() => setImageFailed(false)}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className="absolute inset-0 bg-[#e8e8e8]" />
      )}

      {/* Transparent ChartD DataGrid overlay */}
      {chart.fillVisible ? (
        <div
          className="pointer-events-none absolute inset-0 z-10 flex flex-col"
          style={{ opacity: chart.opacity }}
        >
          {Array.from({ length: CHART_ROWS }, (_, row) => (
            <div
              key={row}
              className="flex min-h-0 flex-1"
              style={{ maxHeight: 21 }}
            >
              {Array.from({ length: CHART_COLS }, (_, col) => {
                const cell = cellMap.get(`${row}:${col}`)
                const widthPct = (CHART_COL_WIDTHS[col]! / totalWidth) * 100
                return (
                  <div
                    key={col}
                    className="flex items-center justify-center overflow-hidden text-[10px] font-medium tabular-nums leading-none"
                    style={{
                      width: `${widthPct}%`,
                      color: cell?.isFull ? "#ff0000" : "#000000",
                    }}
                    title={cell ? `Table ${cell.tableNo}` : undefined}
                  >
                    {cell?.tableNo ?? ""}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      ) : null}

      {!showImage ? (
        <p className="absolute inset-x-0 top-1/2 z-20 -translate-y-1/2 px-4 text-center text-xs text-[#555]">
          Seating chart could not load.
        </p>
      ) : null}
    </div>
  )
}
