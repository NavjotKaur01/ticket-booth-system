import { FileDown, Plus, Search } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { reservationCounts } from "@/data/reservation"
import { AddReservationDialog } from "@/features/reservations/add-reservation-dialog"
import { CancelReservationDialog } from "@/features/reservations/cancel-reservation-dialog"
import { ReservationDataTable } from "@/features/reservations/reservation-data-table"
import { ReservationHistoryDialog } from "@/features/reservations/reservation-history-dialog"
import { ReservationFiltersCard } from "@/features/reservations/reservation-filters-card"
import { printReservationTicket } from "@/services/ticket-print.service"
import { ReprintTicketDialog } from "@/features/ticket-print/reprint-ticket-dialog"
import { useAppSession } from "@/hooks/use-app-session"
import { useReservationData } from "@/hooks/use-reservation-data"
import { useShowDetailsByDate } from "@/hooks/use-show-details-by-date"
import { cancelReservation } from "@/lib/api/reservations"
import { buildCancelReservationRequest } from "@/lib/build-cancel-reservation-request"
import type { CancelReservationPaymentRow } from "@/types/cancel-reservation-payment"
import { filterReservations } from "@/lib/filter-reservations"
import type { Reservation } from "@/types/reservation"

/** ISO date string (yyyy-mm-dd) for the local calendar day. */
function todayDateValue() {
  const date = new Date()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}-${month}-${day}`
}

/** Reservations list with show filters and add-reservation workflow. */
export function Reservations() {
  const { connectionName, locationId, locationName, username, userRight, isReady } =
    useAppSession()

  const [showDate, setShowDate] = useState(todayDateValue)
  const [showTime, setShowTime] = useState("")
  const [refreshValue, setRefreshValue] = useState("999")
  const [search, setSearch] = useState("")
  const [addOpen, setAddOpen] = useState(false)
  const [reprintOpen, setReprintOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null)
  const [isCancellingReservation, setIsCancellingReservation] = useState(false)
  const [cancelReservationError, setCancelReservationError] = useState<
    string | null
  >(null)
  const [cancelledShow, setCancelledShow] = useState(false)
  const [showCancelled, setShowCancelled] = useState(false)
  const [displayNone, setDisplayNone] = useState(false)

  const { shows, loading: showsLoading, error: showsError } =
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
  } = useReservationData(
    connectionName,
    showTime,
    showCancelled,
    Boolean(showTime)
  )

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

  const statItems = useMemo(
    () => [
      { label: "Seats", value: reservationCounts.seats },
      {
        label: "Reserved",
        value: reservations.reduce((total, row) => total + row.qty, 0),
      },
      { label: "Available", value: reservationCounts.available },
      {
        label: "Seated",
        value: reservations.reduce((total, row) => total + row.seated, 0),
      },
      {
        label: "Scanned",
        value: reservations.reduce((total, row) => total + row.scanner, 0),
      },
    ],
    [reservations]
  )

  const selectedShow = useMemo(
    () => shows.find((show) => show.id === showTime),
    [showTime, shows]
  )

  const selectedShowLabel = selectedShow?.label ?? ""

  function handleTodayClick() {
    setShowDate(todayDateValue())
  }

  function handleOpenReprintTicket(reservation: Reservation) {
    setSelectedReservation(reservation)
    setReprintOpen(true)
  }

  function handleOpenReservationHistory(reservation: Reservation) {
    setSelectedReservation(reservation)
    setHistoryOpen(true)
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

  function handleReprintOpenChange(open: boolean) {
    setReprintOpen(open)
    if (!open) {
      setSelectedReservation(null)
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
                checked={displayNone}
                onCheckedChange={(v) => setDisplayNone(v === true)}
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

        <ReservationDataTable
          data={filteredReservations}
          loading={reservationsLoading}
          onCancelReservation={handleOpenCancelReservation}
          onPrintTickets={handleOpenReprintTicket}
          onReservationHistory={handleOpenReservationHistory}
        />
      </PanelCard>

      <AddReservationDialog open={addOpen} onOpenChange={setAddOpen} onSaved={handleReservationSaved} />
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
      <ReprintTicketDialog
        open={reprintOpen}
        onOpenChange={handleReprintOpenChange}
        reservation={selectedReservation}
        showDate={showDate}
        showLabel={selectedShowLabel}
        locationName={locationName}
      />
    </div>
  )
}



