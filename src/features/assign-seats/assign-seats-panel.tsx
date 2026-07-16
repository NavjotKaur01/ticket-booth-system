import { Expand, LoaderCircle, Shrink } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  chartImageBytesToUrl,
  isColumbusStyleConnection,
  resolveAssignSeatChartUrl,
  shouldShowChartDOverlay,
} from "@/features/assign-seats/assign-seats-chart-assets"
import { AssignSeatsFloorMap } from "@/features/assign-seats/assign-seats-floor-map"
import { AssignSeatsReservationList } from "@/features/assign-seats/assign-seats-reservation-list"
import { AssignSeatsTableGrid } from "@/features/assign-seats/assign-seats-table-grid"
import {
  assignSeatToCell,
  buildAssignSeatsWorkspace,
  buildChartOverlay,
  clearAllAssignments,
  clearSeatCell,
  collectAssignments,
  collectTableNumsByReservation,
  extractClubsAssignSeatDetail,
  holdSeatCell,
  removeReservationFromSeats,
  removeSeatsFromTable,
} from "@/features/assign-seats/assign-seats.service"
import type {
  AssignSeatChartState,
  AssignSeatReservationRow,
  AssignSeatTableRow,
} from "@/features/assign-seats/assign-seats.types"
import {
  deleteAllAssignSeats,
  fetchAssignSeatDetails,
  fetchClubsAssignSeatDetail,
  fetchColumbusAssignSeatNumbers,
  fetchReservationsToAssignSeats,
  saveAssignSeats,
} from "@/lib/api/assign-seats"
import { assignReservationSeat } from "@/lib/api/reservation-pos-actions"
import { cn } from "@/lib/utils"
import type {
  ApiAssignSeatDetail,
  ApiClubsAssignSeatDetail,
  ApiReservationToAssignSeat,
} from "@/types/api/assign-seats"

export type AssignSeatsSaveResult = {
  assignments: ReturnType<typeof collectAssignments>
  tableNumsByReservation: ReturnType<typeof collectTableNumsByReservation>
}

type AssignSeatsPanelProps = {
  connectionName: string
  locationId: string
  showId: string
  username: string
  initialReservationId?: string | null
  guestLabel?: string
  className?: string
  isSubmitting?: boolean
  error?: string | null
  onError?: (message: string | null) => void
  onSaved?: (result: AssignSeatsSaveResult) => void | Promise<void>
}

function AssignSeatsPanelSkeleton() {
  return (
    <div className="grid h-full min-h-0 flex-1 grid-cols-2 gap-0">
      <Skeleton className="h-full w-full rounded-none" />
      <div className="flex flex-col gap-0">
        <Skeleton className="h-[280px] w-full rounded-none" />
        <Skeleton className="min-h-0 flex-1 w-full rounded-none" />
      </div>
    </div>
  )
}

/**
 * Shared Assign Seats workspace — mirrors ClubMan AssignSeats.xaml layout.
 */
export function AssignSeatsPanel({
  connectionName,
  locationId,
  showId,
  username,
  initialReservationId = null,
  className,
  isSubmitting = false,
  error = null,
  onError,
  onSaved,
}: AssignSeatsPanelProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [clearing, setClearing] = useState(false)
  /** Desktop IsToggle / cmdToggle — show/hide chart image area. */
  const [chartVisible, setChartVisible] = useState(true)
  const [expanded, setExpanded] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [tables, setTables] = useState<AssignSeatTableRow[]>([])
  const [reservations, setReservations] = useState<AssignSeatReservationRow[]>(
    []
  )
  const [chart, setChart] = useState<AssignSeatChartState>({
    imageUrl: null,
    opacity: 1,
    fillVisible: true,
    overlay: [],
  })
  const chartCoordsRef = useRef<Map<string, { row: number; col: number }>>(
    new Map()
  )
  const chartBlobUrlRef = useRef<string | null>(null)
  const [seatCount, setSeatCount] = useState(10)
  const [selectedReservationId, setSelectedReservationId] = useState<
    string | null
  >(initialReservationId)
  const [filter, setFilter] = useState<"dinner" | "all">("all")

  const displayError = error ?? localError

  const setErrorMessage = useCallback(
    (message: string | null) => {
      setLocalError(message)
      onError?.(message)
    },
    [onError]
  )

  const syncChartOverlay = useCallback((nextTables: AssignSeatTableRow[]) => {
    setChart((current) => ({
      ...current,
      overlay: buildChartOverlay(nextTables, chartCoordsRef.current),
    }))
  }, [])

  const loadWorkspace = useCallback(async () => {
    if (!connectionName || !showId) {
      return
    }

    setLoading(true)
    setErrorMessage(null)

    try {
      const columbusStyle = isColumbusStyleConnection(connectionName)

      if (!columbusStyle && !locationId) {
        throw new Error(
          "LocationId is required for GetClubsAssignSeatDetail (non-Columbus clubs)."
        )
      }

      const [columbusResult, clubsDetailResult, detailsResult, reservationResult] =
        await Promise.allSettled([
          columbusStyle
            ? fetchColumbusAssignSeatNumbers(connectionName)
            : Promise.resolve(
                [] as Awaited<ReturnType<typeof fetchColumbusAssignSeatNumbers>>
              ),
          !columbusStyle && locationId
            ? fetchClubsAssignSeatDetail({ connectionName, locationId })
            : Promise.resolve(null as ApiClubsAssignSeatDetail | null),
          fetchAssignSeatDetails({ connectionName, showId }),
          fetchReservationsToAssignSeats({ connectionName, showId }),
        ])

      const columbus: Awaited<
        ReturnType<typeof fetchColumbusAssignSeatNumbers>
      > =
        columbusResult.status === "fulfilled" ? columbusResult.value : []
      const clubsDetailRaw =
        clubsDetailResult.status === "fulfilled"
          ? clubsDetailResult.value
          : null
      if (clubsDetailResult.status === "rejected" && !columbusStyle) {
        console.warn(
          "GetClubsAssignSeatDetail failed:",
          clubsDetailResult.reason
        )
      }
      const clubsDetail = extractClubsAssignSeatDetail(clubsDetailRaw)
      const details: ApiAssignSeatDetail[] =
        detailsResult.status === "fulfilled" ? detailsResult.value : []
      const reservationRows: ApiReservationToAssignSeat[] =
        reservationResult.status === "fulfilled" ? reservationResult.value : []

      if (reservationResult.status === "rejected") {
        throw reservationResult.reason
      }

      const apiChartImage =
        clubsDetail?.ChartImage ?? clubsDetail?.ByteImgSource
      const hasApiChartImage = Boolean(chartImageBytesToUrl(apiChartImage))

      // Desktop: columbus FillChart only when ConnectionName is columbus* (local path).
      // Non-columbus always uses API ChartTableList / ChartImage when available.
      const useColumbusFillChart = columbusStyle

      let workspace = buildAssignSeatsWorkspace({
        columbus: useColumbusFillChart ? columbus : [],
        clubsDetail: useColumbusFillChart ? null : clubsDetail,
        details,
        reservations: reservationRows,
        connectionName,
        filterReservationId: initialReservationId,
      })

      const imageUrl = resolveAssignSeatChartUrl({
        connectionName,
        chartImage: apiChartImage,
        chartImageSource: clubsDetail?.ChartImageSource,
      })

      const opacityRaw = Number(
        useColumbusFillChart
          ? 0.7
          : (clubsDetail?.ChartGridOpacity ?? workspace.chart.opacity ?? 0.7)
      )

      workspace = {
        ...workspace,
        chart: {
          ...workspace.chart,
          imageUrl: imageUrl ?? workspace.chart.imageUrl,
          opacity: Number.isFinite(opacityRaw)
            ? Math.min(1, Math.max(0.2, opacityRaw))
            : useColumbusFillChart
              ? 0.7
              : 1,
          fillVisible: shouldShowChartDOverlay({
            connectionName,
            fillVisibility: useColumbusFillChart
              ? "Visible"
              : clubsDetail?.ChartFillUpVisibility,
            hasApiChartImage,
          }),
        },
      }

      if (!workspace.chart.imageUrl && !useColumbusFillChart && !clubsDetail) {
        // Last resort: static pack map (Standupmedia → Tampa) so UI is not blank
        // when API fails but ConnectionName is known.
        workspace = {
          ...workspace,
          chart: {
            ...workspace.chart,
            imageUrl: resolveAssignSeatChartUrl({ connectionName }),
            fillVisible: false,
          },
        }
      }

      if (chartBlobUrlRef.current?.startsWith("blob:")) {
        URL.revokeObjectURL(chartBlobUrlRef.current)
      }
      chartBlobUrlRef.current = workspace.chart.imageUrl?.startsWith("blob:")
        ? workspace.chart.imageUrl
        : null

      chartCoordsRef.current = new Map(
        workspace.chart.overlay.map((cell) => [
          cell.tableNo,
          { row: cell.row, col: cell.col },
        ])
      )

      setTables(workspace.tables)
      setReservations(workspace.reservations)
      setChart(workspace.chart)
      setSeatCount(workspace.seatCount)
      setChartVisible(true)

      setSelectedReservationId((current) => {
        if (
          initialReservationId &&
          workspace.reservations.some((row) => row.id === initialReservationId)
        ) {
          return initialReservationId
        }
        if (
          current &&
          workspace.reservations.some((row) => row.id === current)
        ) {
          return current
        }
        return workspace.reservations[0]?.id ?? null
      })
    } catch (loadError) {
      setErrorMessage(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load assign seats"
      )
    } finally {
      setLoading(false)
    }
  }, [
    connectionName,
    initialReservationId,
    locationId,
    setErrorMessage,
    showId,
  ])

  useEffect(() => {
    void loadWorkspace()
    return () => {
      if (chartBlobUrlRef.current?.startsWith("blob:")) {
        URL.revokeObjectURL(chartBlobUrlRef.current)
      }
    }
    // Only reload when show/session changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionName, showId, locationId])

  useEffect(() => {
    if (initialReservationId) {
      setSelectedReservationId(initialReservationId)
    }
  }, [initialReservationId])

  function handleAssignCell(tableNo: string, seatNo: number) {
    if (!selectedReservationId) {
      setErrorMessage("Select a reservation first.")
      return
    }

    const result = assignSeatToCell(
      tables,
      reservations,
      tableNo,
      seatNo,
      selectedReservationId
    )

    if (result.error) {
      setErrorMessage(result.error)
      return
    }

    setErrorMessage(null)
    setTables(result.tables)
    setReservations(result.reservations)
    syncChartOverlay(result.tables)
  }

  function handleClearCell(tableNo: string, seatNo: number) {
    const result = clearSeatCell(tables, reservations, tableNo, seatNo)
    setTables(result.tables)
    setReservations(result.reservations)
    syncChartOverlay(result.tables)
    setErrorMessage(null)
  }

  function handleHoldSeat(tableNo: string, seatNo: number) {
    const result = holdSeatCell(tables, tableNo, seatNo)
    setTables(result.tables)
    syncChartOverlay(result.tables)
    setErrorMessage(null)
  }

  function handleRemoveFromTable(tableNo: string) {
    const result = removeSeatsFromTable(tables, reservations, tableNo)
    setTables(result.tables)
    setReservations(result.reservations)
    syncChartOverlay(result.tables)
    setErrorMessage(null)
  }

  function handleRemoveReservation(reservationId: string) {
    const result = removeReservationFromSeats(
      tables,
      reservations,
      reservationId
    )
    setTables(result.tables)
    setReservations(result.reservations)
    syncChartOverlay(result.tables)
    setErrorMessage(null)
  }

  async function handleClear() {
    setClearing(true)
    setErrorMessage(null)

    try {
      await deleteAllAssignSeats({
        connectionName,
        locationId,
        showId,
        lastUpdateId: username,
      })
      const cleared = clearAllAssignments(tables, reservations)
      setTables(cleared.tables)
      setReservations(cleared.reservations)
      syncChartOverlay(cleared.tables)
    } catch (clearError) {
      const cleared = clearAllAssignments(tables, reservations)
      setTables(cleared.tables)
      setReservations(cleared.reservations)
      syncChartOverlay(cleared.tables)
      setErrorMessage(
        clearError instanceof Error
          ? clearError.message
          : "Cleared locally; server clear failed."
      )
    } finally {
      setClearing(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    setErrorMessage(null)

    try {
      const assignments = collectAssignments(tables)
      await saveAssignSeats({
        connectionName,
        locationId,
        showId,
        lastUpdateId: username,
        assignSeats: assignments,
      })

      const tableNumsByReservation = collectTableNumsByReservation(tables)
      for (const row of tableNumsByReservation) {
        await assignReservationSeat({
          connectionName,
          locationId,
          reservationId: row.reservationId,
          tableNums: row.tableNums,
          lastUpdateId: username,
        })
      }

      await onSaved?.({ assignments, tableNumsByReservation })
    } catch (saveError) {
      setErrorMessage(
        saveError instanceof Error
          ? saveError.message
          : "Failed to save assign seats"
      )
    } finally {
      setSaving(false)
    }
  }

  const busy = loading || saving || clearing || isSubmitting

  return (
    <div
      className={cn(
        "relative flex min-h-0 flex-1 flex-col bg-background",
        expanded &&
          "fixed inset-3 z-50 rounded-lg border border-border/80 bg-background shadow-xl",
        className
      )}
    >
      {loading ? (
        <AssignSeatsPanelSkeleton />
      ) : (
        <>
          {/* Equal 2-column body — same layout as desktop */}
          <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-2">
            <AssignSeatsTableGrid
              tables={tables}
              seatCount={seatCount}
              selectedReservationId={selectedReservationId}
              onAssignCell={handleAssignCell}
              onClearCell={handleClearCell}
              onHoldSeat={handleHoldSeat}
              onRemoveFromTable={handleRemoveFromTable}
              onRemoveReservation={handleRemoveReservation}
            />

            <div className="flex min-h-0 flex-col border-l border-border/60 bg-background">
              <AssignSeatsFloorMap
                chart={chart}
                tables={tables}
                visible={chartVisible}
              />
              <AssignSeatsReservationList
                reservations={reservations}
                selectedReservationId={selectedReservationId}
                filter={filter}
                onFilterChange={setFilter}
                onSelect={setSelectedReservationId}
              />
            </div>
          </div>

          {displayError ? (
            <p className="border-t border-border/50 bg-background px-4 py-2 text-sm text-destructive">
              {displayError}
            </p>
          ) : null}

          <div className="flex h-12 shrink-0 items-center justify-between gap-2 border-t border-border/50 bg-muted/40 px-4">
            <div className="flex items-center gap-3 text-xs font-medium">
              <span className="text-orange-500">Dinner</span>
              <span className="text-red-600">Web</span>
              <span className="text-blue-600">Promo</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-8"
                title={chartVisible ? "Hide chart" : "Show chart"}
                onClick={() => setChartVisible((value) => !value)}
                disabled={busy}
              >
                {chartVisible ? (
                  <Shrink className="size-3.5" />
                ) : (
                  <Expand className="size-3.5" />
                )}
              </Button>
              <Button
                type="button"
                size="sm"
                className="min-w-20"
                disabled={busy}
                onClick={() => void handleSave()}
              >
                {saving || isSubmitting ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  "Save"
                )}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="min-w-20"
                disabled={busy}
                onClick={() => void handleClear()}
              >
                {clearing ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  "Clear"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-8"
                title={expanded ? "Exit full screen" : "Expand window"}
                onClick={() => setExpanded((value) => !value)}
                disabled={busy}
              >
                <Expand className="size-3.5" />
              </Button>
            </div>
          </div>

          {busy && !loading ? (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
              <div className="flex flex-col items-center gap-2">
                <LoaderCircle className="size-9 animate-spin text-primary" />
                <p className="text-sm font-semibold text-primary">Please Wait</p>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
