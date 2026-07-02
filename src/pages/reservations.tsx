import { FileDown, Plus, Search } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { AddReservationDialog } from "@/features/reservations/add-reservation-dialog"
import { CancelReservationDialog } from "@/features/reservations/cancel-reservation-dialog"
import { ReservationNoteDialog } from "@/features/reservations/reservation-note-dialog"
import { ReservationDataTable } from "@/features/reservations/reservation-data-table"
import { ReservationHistoryDialog } from "@/features/reservations/reservation-history-dialog"
import { ReservationFiltersCard } from "@/features/reservations/reservation-filters-card"
import { getMockTicketPrintData, printReservationTicket } from "@/services/ticket-print.service"
import { useAppSession } from "@/hooks/use-app-session"
import { useReservationData } from "@/hooks/use-reservation-data"
import { useShowDetailsByDate } from "@/hooks/use-show-details-by-date"
import { calculateReservationShowStats } from "@/lib/calculate-reservation-show-stats"
import { readBoothSeatDefault } from "@/lib/booth-seat-default"
import { writeStoredBoothSeatCount } from "@/lib/booth-seat-storage"
import { cancelReservation, revertCancelReservation, saveReservationNote } from "@/lib/api/reservations"
import { buildCancelReservationRequest } from "@/lib/build-cancel-reservation-request"
import { buildReservationNoteRequest } from "@/lib/build-reservation-note-request"
import {
  readReservationFilters,
  writeReservationFilters,
} from "@/lib/reservation-filter-storage"
import { resolveReservationTotalSeats } from "@/lib/resolve-reservation-total-seats"
import type { CancelReservationPaymentRow } from "@/types/cancel-reservation-payment"
import { filterReservations } from "@/lib/filter-reservations"
import type { Reservation } from "@/types/reservation"
import { useGetShowSectionsQuery, useGetSystemDefaultsQuery } from "@/store/api/clubmanApi"

/** ISO date string (yyyy-mm-dd) for the local calendar day. */
function todayDateValue() {
  const date = new Date()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}-${month}-${day}`
}

/** Reservations list with show filters and add-reservation workflow. */
export function Reservations() {
  const {
    credentials,
    connectionName,
    locationId,
    locationName,
    username,
    userRight,
    isReady,
  } = useAppSession()

  const storedFilters = useMemo(
    () => readReservationFilters(locationId),
    [locationId]
  )

  const [showDate, setShowDate] = useState(todayDateValue)
  const [showTime, setShowTime] = useState("")
  const [refreshValue, setRefreshValue] = useState(
    storedFilters.refreshValue ?? "999"
  )
  const [search, setSearch] = useState("")
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [noteOpen, setNoteOpen] = useState(false)
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null)
  const [isCancellingReservation, setIsCancellingReservation] = useState(false)
  const [cancelReservationError, setCancelReservationError] = useState<
    string | null
  >(null)
  const [uncancelReservationError, setUncancelReservationError] = useState<
    string | null
  >(null)
  const [isUncancellingReservation, setIsUncancellingReservation] =
    useState(false)
  const [isSavingReservationNote, setIsSavingReservationNote] = useState(false)
  const [saveReservationNoteError, setSaveReservationNoteError] = useState<
    string | null
  >(null)
  const [cancelledShow, setCancelledShow] = useState(
    storedFilters.cancelledShow ?? false
  )
  const [showCancelled, setShowCancelled] = useState(
    storedFilters.showCancelled ?? false
  )
  const [displayPhone, setDisplayPhone] = useState(false)
  const [reservationPrintError, setReservationPrintError] = useState<string | null>(null)

  const { shows, loading: showsLoading, error: showsError, refetch: refetchShows } =
    useShowDetailsByDate(
      connectionName,
      locationId,
      showDate,
      cancelledShow,
      isReady
    )

  const {
    reservations,
    loading: reservationsLoading,
    error: reservationsError,
    refresh: refreshReservations,
  } = useReservationData(
    connectionName,
    showTime,
    showCancelled,
    Boolean(showTime),
    refreshValue
  )

  const { data: showSections = [], refetch: refetchShowSections } =
    useGetShowSectionsQuery(
      { connectionString: connectionName, showId: showTime },
      { skip: !connectionName || !showTime }
    )

  const { data: systemDefaults = [] } = useGetSystemDefaultsQuery(
    { connectionName, locationId },
    { skip: !connectionName || !locationId }
  )

  const boothSeatDefault = useMemo(
    () => readBoothSeatDefault(systemDefaults),
    [systemDefaults]
  )

  useEffect(() => {
    if (boothSeatDefault > 0 && locationId) {
      writeStoredBoothSeatCount(locationId, boothSeatDefault)
    }
  }, [boothSeatDefault, locationId])

  useEffect(() => {
    if (!locationId) {
      return
    }

    writeReservationFilters(locationId, {
      showCancelled,
      cancelledShow,
      refreshValue,
    })
  }, [cancelledShow, locationId, refreshValue, showCancelled])

  useEffect(() => {
    if (showsLoading) {
      return
    }

    if (shows.length === 0) {
      setShowTime("")
      return
    }

    if (!shows.some((show) => show.id === showTime)) {
      setShowTime(shows[0].id)
    }
  }, [shows, showsLoading, showTime])

  const filteredReservations = useMemo(
    () => filterReservations(reservations, search),
    [reservations, search]
  )

  const totalSeatsCount = useMemo(
    () =>
      resolveReservationTotalSeats(
        locationId,
        credentials?.DefaultSeatCount ?? 0,
        boothSeatDefault,
        showSections
      ),
    [boothSeatDefault, credentials?.DefaultSeatCount, locationId, showSections]
  )

  const statItems = useMemo(() => {
    const stats = calculateReservationShowStats(totalSeatsCount, reservations)

    return [
      { label: "Seats", value: stats.seats },
      { label: "Reserved", value: stats.reservation },
      { label: "Available", value: stats.available },
      { label: "Seated", value: stats.seated },
      { label: "Scanned", value: stats.scanned },
    ]
  }, [totalSeatsCount, reservations])

  const selectedShow = useMemo(
    () => shows.find((show) => show.id === showTime),
    [showTime, shows]
  )

  const selectedShowLabel = selectedShow?.label ?? ""

  function handleTodayClick() {
    setShowDate(todayDateValue())
  }

  async function handleRefresh() {
    await Promise.all([
      refreshReservations(),
      refetchShowSections(),
      refetchShows(),
    ])
  }


  function handleOpenEditReservation(reservation: Reservation) {
    if (reservation.isCancelled) {
      return
    }

    setSelectedReservation(reservation)
    setEditOpen(true)
  }

  function handleReservationDialogOpenChange(open: boolean) {
    if (!open) {
      setAddOpen(false)
      setEditOpen(false)
      setSelectedReservation(null)
    }
  }

  async function handleReservationDialogSaved(
    _reservationIds: string[],
    ticketData?: import("@/types/ticket-print").TicketPrintData
  ) {
    await refreshReservations()

    if (editOpen || !ticketData) {
      return
    }

    await handleReservationSaved(_reservationIds, ticketData)
  }

  function handleOpenReservationHistory(reservation: Reservation) {
    setSelectedReservation(reservation)
    setHistoryOpen(true)
  }

  function handleOpenAddNote(reservation: Reservation) {
    setSelectedReservation(reservation)
    setSaveReservationNoteError(null)
    setNoteOpen(true)
  }

  function handleNoteDialogOpenChange(open: boolean) {
    setNoteOpen(open)
    if (!open) {
      setSelectedReservation(null)
      setSaveReservationNoteError(null)
      setIsSavingReservationNote(false)
    }
  }

  async function handleSaveReservationNote(note: string) {
    if (!selectedReservation || !isReady) {
      return
    }

    setIsSavingReservationNote(true)
    setSaveReservationNoteError(null)

    try {
      await saveReservationNote(
        buildReservationNoteRequest({
          connectionName,
          locationId,
          reservationId: selectedReservation.id,
          lastUpdateId: username,
          reservationNote: note,
        })
      )
      await refreshReservations()
      handleNoteDialogOpenChange(false)
    } catch (requestError) {
      setSaveReservationNoteError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to save reservation note"
      )
    } finally {
      setIsSavingReservationNote(false)
    }
  }

  function handleHistoryDialogOpenChange(open: boolean) {
    setHistoryOpen(open)
    if (!open) {
      setSelectedReservation(null)
    }
  }

  function handleOpenCancelReservation(reservation: Reservation) {
    setSelectedReservation(reservation)
    setCancelReservationError(null)
    setCancelOpen(true)
  }

  function handleCancelDialogOpenChange(open: boolean) {
    setCancelOpen(open)
    if (!open) {
      setSelectedReservation(null)
      setCancelReservationError(null)
      setIsCancellingReservation(false)
    }
  }

  async function handleUnCancelReservation(reservation: Reservation) {
    if (!isReady) {
      return
    }

    setIsUncancellingReservation(true)
    setUncancelReservationError(null)

    try {
      await revertCancelReservation(
        buildCancelReservationRequest({
          connectionName,
          locationId,
          reservationId: reservation.id,
          lastUpdateId: username,
        })
      )
    } catch (requestError) {
      setUncancelReservationError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to uncancel reservation"
      )
    } finally {
      setIsUncancellingReservation(false)
    }
  }

  async function handleSaveCancelReservation({
    reservationNote,
    payments,
  }: {
    reservationNote: string
    payments: CancelReservationPaymentRow[]
  }) {
    if (!selectedReservation || !isReady) {
      return
    }

    setIsCancellingReservation(true)
    setCancelReservationError(null)

    try {
      await cancelReservation(
        buildCancelReservationRequest({
          connectionName,
          locationId,
          reservationId: selectedReservation.id,
          lastUpdateId: username,
          reservationNote,
          payments,
        })
      )
      handleCancelDialogOpenChange(false)
    } catch (requestError) {
      setCancelReservationError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to cancel reservation"
      )
    } finally {
      setIsCancellingReservation(false)
    }
  }


  async function handlePrintReservation(
    reservation: Reservation,
    {
      layout = "combined",
      includeQr = true,
    }: {
      layout?: "combined" | "individual"
      includeQr?: boolean
    } = {}
  ) {
    setReservationPrintError(null)

    try {
      const ticketData = await getMockTicketPrintData({
        reservation,
        showDate,
        showLabel: selectedShowLabel,
        locationName,
      })

      const didStart = await printReservationTicket({
        ticket: ticketData,
        ticketCount: ticketData.reservation.partySize,
        includeQr,
        layout,
      })

      if (!didStart) {
        throw new Error("Unable to start printing. Please allow popups and try again.")
      }
    } catch (error) {
      setReservationPrintError(
        error instanceof Error
          ? error.message
          : "Unable to start printing. Please try again."
      )
    }
  }

  async function handleReservationSaved(
    _reservationIds: string[],
    ticketData?: import("@/types/ticket-print").TicketPrintData
  ) {
    if (!ticketData) {
      return
    }

    const didStart = await printReservationTicket({
      ticket: ticketData,
      ticketCount: ticketData.reservation.partySize,
      includeQr: true,
      layout: "combined",
    })

    if (!didStart) {
      throw new Error("Reservation saved, but printing could not be started.")
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Reservations
        </h1>
        <button
          type="button"
          onClick={handleTodayClick}
          className="inline-flex cursor-pointer items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 transition-opacity hover:opacity-80 dark:bg-blue-950/50 dark:text-blue-300"
        >
          Today
        </button>
      </div>

      <ReservationFiltersCard
        showDate={showDate}
        onShowDateChange={setShowDate}
        showTime={showTime}
        onShowTimeChange={setShowTime}
        refreshValue={refreshValue}
        onRefreshValueChange={setRefreshValue}
        onRefresh={() => void handleRefresh()}
        isRefreshing={reservationsLoading}
        shows={shows}
        showsLoading={showsLoading}
        showsError={showsError}
        statItems={statItems}
      />

      <PanelCard>
        <div className="flex flex-col gap-2 border-b p-3 xl:flex-row xl:items-center xl:gap-3">
          <div className="relative w-full shrink-0 xl:max-w-sm">
            <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search reservations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 xl:flex-1 xl:justify-center">
            <label className="flex cursor-pointer items-center gap-1.5 text-xs text-foreground">
              <Checkbox
                checked={cancelledShow}
                onCheckedChange={(v) => setCancelledShow(v === true)}
              />
              Cancelled Show
            </label>
            <label className="flex cursor-pointer items-center gap-1.5 text-xs text-foreground">
              <Checkbox
                checked={showCancelled}
                onCheckedChange={(v) => setShowCancelled(v === true)}
              />
              Cancelled Reservation
            </label>
            <label className="flex cursor-pointer items-center gap-1.5 text-xs text-foreground">
              <Checkbox
                checked={displayPhone}
                onCheckedChange={(v) => setDisplayPhone(v === true)}
              />
              Display Phone
            </label>
          </div>

          <div className="flex shrink-0 items-center justify-end gap-2">
            <Button variant="outline" size="sm" className="gap-1.5">
              <FileDown className="size-3.5" />
              Export
            </Button>
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => setAddOpen(true)}
            >
              <Plus className="size-3.5" />
              Add
            </Button>
          </div>
        </div>

        {reservationsError ? (
          <p className="px-3 py-2 text-sm text-destructive">{reservationsError}</p>
        ) : null}
        {uncancelReservationError ? (
          <p className="px-3 py-2 text-sm text-destructive">
            {uncancelReservationError}
          </p>
        ) : null}
        {reservationPrintError ? (
          <p className="px-3 py-2 text-sm text-destructive">
            {reservationPrintError}
          </p>
        ) : null}

        <ReservationDataTable
          data={filteredReservations}
          loading={reservationsLoading || isUncancellingReservation}
          displayPhone={displayPhone}
          onCancelReservation={handleOpenCancelReservation}
          onUnCancelReservation={handleUnCancelReservation}
          onPrintTickets={(reservation) => {
            void handlePrintReservation(reservation, {
              layout: "combined",
              includeQr: true,
            })
          }}
          onPrintIndividualTickets={(reservation) => {
            void handlePrintReservation(reservation, {
              layout: "individual",
              includeQr: true,
            })
          }}
          onPrintReceipt={(reservation) => {
            void handlePrintReservation(reservation, {
              layout: "combined",
              includeQr: false,
            })
          }}
          onReservationHistory={handleOpenReservationHistory}
          onAddNote={handleOpenAddNote}
          onEditReservation={handleOpenEditReservation}
        />
      </PanelCard>

      <AddReservationDialog
        open={addOpen || editOpen}
        onOpenChange={handleReservationDialogOpenChange}
        onSaved={handleReservationDialogSaved}
        reservation={editOpen ? selectedReservation : null}
        showDate={showDate}
        showTime={showTime}
      />
      <CancelReservationDialog
        open={cancelOpen}
        onOpenChange={handleCancelDialogOpenChange}
        reservation={selectedReservation}
        connectionName={connectionName}
        showDate={showDate}
        showTime={selectedShow?.time}
        showHeadliner={selectedShow?.headliner}
        userRight={userRight}
        isSubmitting={isCancellingReservation}
        error={cancelReservationError}
        onSave={handleSaveCancelReservation}
      />
      <ReservationHistoryDialog
        open={historyOpen}
        onOpenChange={handleHistoryDialogOpenChange}
        reservation={selectedReservation}
        connectionName={connectionName}
      />
      <ReservationNoteDialog
        open={noteOpen}
        onOpenChange={handleNoteDialogOpenChange}
        reservation={selectedReservation}
        connectionName={connectionName}
        isSubmitting={isSavingReservationNote}
        error={saveReservationNoteError}
        onSave={handleSaveReservationNote}
      />

    </div>
  )
}


