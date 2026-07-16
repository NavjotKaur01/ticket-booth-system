import { useEffect, useState } from "react"

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
 * - Background ImageBrush = AssignSeatChart (full opacity — never ChartGridOpacity)
 * - Transparent chartGrid DataGrid = ChartD; Opacity = ChartGridOpacity when visible
 */
export function AssignSeatsFloorMap({
  chart,
  tables,
  visible,
}: AssignSeatsFloorMapProps) {
  const [imageFailed, setImageFailed] = useState(false)

  useEffect(() => {
    setImageFailed(false)
  }, [chart.imageUrl])

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
  // Desktop binds ChartGridOpacity to the overlay grid only, not the chart image.
  const overlayOpacity = Number.isFinite(chart.opacity) ? chart.opacity : 0.7

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
    <div className="relative h-[280px] max-h-[280px] min-h-[280px] shrink-0 overflow-hidden border-b border-border/60 bg-white">
      {showImage ? (
        <img
          key={chart.imageUrl}
          src={chart.imageUrl!}
          alt="Seating chart"
          className="absolute inset-0 h-full w-full select-none bg-white"
          style={{
            opacity: 1,
            objectFit: chart.fillVisible ? "fill" : "contain",
          }}
          onLoad={() => setImageFailed(false)}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className="absolute inset-0 bg-muted/30" />
      )}

      {chart.fillVisible ? (
        <div
          className="pointer-events-none absolute inset-0 z-10 flex flex-col"
          style={{ opacity: overlayOpacity }}
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
                    className="flex items-center justify-center overflow-hidden text-[10px] font-medium tabular-nums leading-none text-foreground"
                    style={{
                      width: `${widthPct}%`,
                      color: cell?.isFull ? "#ef4444" : undefined,
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
        <p className="absolute inset-x-0 top-1/2 z-20 -translate-y-1/2 px-4 text-center text-xs text-muted-foreground">
          {chart.imageUrl
            ? "Seating chart could not load."
            : "No seating chart for this club."}
        </p>
      ) : null}
    </div>
  )
}
