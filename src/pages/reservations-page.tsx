import { FileDown, Plus, Search } from "lucide-react"
import { useMemo, useState } from "react"

import { AddReservationDialog } from "@/components/reservations/add-reservation-dialog"
import {
  RESERVATION_PANEL_CLASS,
  ReservationFiltersCard,
} from "@/components/reservations/reservation-filters-card"
import { ReservationDataTable } from "@/components/reservations/reservation-data-table"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { reservations, showOptions } from "@/data/reservation-data"
import { filterReservations } from "@/lib/filter-reservations"

/** Reservations list with show filters and add-reservation workflow. */
export function ReservationsPage() {
  const [showDate, setShowDate] = useState("2026-06-18")
  const [showTime, setShowTime] = useState(showOptions[0]?.id ?? "")
  const [refreshValue, setRefreshValue] = useState("999")
  const [search, setSearch] = useState("")
  const [addOpen, setAddOpen] = useState(false)
  const [cancelledReservation, setCancelledReservation] = useState(false)
  const [cancelledShow, setCancelledShow] = useState(false)
  const [displayPhone, setDisplayPhone] = useState(false)

  const filteredReservations = useMemo(
    () => filterReservations(reservations, search),
    [search]
  )

  const selectedShow = showOptions.find((s) => s.id === showTime)?.label

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Reservations
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage show reservations for {selectedShow}
        </p>
      </div>

      <ReservationFiltersCard
        showDate={showDate}
        onShowDateChange={setShowDate}
        showTime={showTime}
        onShowTimeChange={setShowTime}
        refreshValue={refreshValue}
        onRefreshValueChange={setRefreshValue}
        cancelledReservation={cancelledReservation}
        onCancelledReservationChange={setCancelledReservation}
        cancelledShow={cancelledShow}
        onCancelledShowChange={setCancelledShow}
        displayPhone={displayPhone}
        onDisplayPhoneChange={setDisplayPhone}
      />

      <Card className={RESERVATION_PANEL_CLASS}>
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search reservations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="outline" className="gap-1.5">
              <FileDown className="size-4" />
              Export
            </Button>
            <Button className="gap-1.5" onClick={() => setAddOpen(true)}>
              <Plus className="size-4" />
              Add Reservation
            </Button>
          </div>
        </div>

        <ReservationDataTable data={filteredReservations} />
      </Card>

      <AddReservationDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  )
}
