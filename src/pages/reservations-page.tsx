import { FileDown, Plus, Search } from "lucide-react"
import { useMemo, useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { reservations, showOptions } from "@/data/reservation-data"
import { AddReservationDialog } from "@/features/reservations/add-reservation-dialog"
import { ReservationDataTable } from "@/features/reservations/reservation-data-table"
import { ReservationFiltersCard } from "@/features/reservations/reservation-filters-card"
import { filterReservations } from "@/lib/filter-reservations"

/** Reservations list with show filters and add-reservation workflow. */
export function ReservationsPage() {
  const [showDate, setShowDate] = useState("2026-06-18")
  const [showTime, setShowTime] = useState(showOptions[0]?.id ?? "")
  const [refreshValue, setRefreshValue] = useState("999")
  const [search, setSearch] = useState("")
  const [addOpen, setAddOpen] = useState(false)
  const [cancelledShow, setCancelledShow] = useState(false)
  const [showCancelled, setShowCancelled] = useState(false)
  const [displayNone, setDisplayNone] = useState(false)

  const filteredReservations = useMemo(
    () => filterReservations(reservations, search),
    [search]
  )

  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Reservations
        </h1>
      </div>

      <ReservationFiltersCard
        showDate={showDate}
        onShowDateChange={setShowDate}
        cancelledShow={cancelledShow}
        onCancelledShowChange={setCancelledShow}
        showTime={showTime}
        onShowTimeChange={setShowTime}
        refreshValue={refreshValue}
        onRefreshValueChange={setRefreshValue}
      />

      <PanelCard>
        <div className="flex flex-col gap-2 border-b p-3 lg:flex-row lg:items-center lg:gap-3">
          <div className="relative w-full max-w-sm shrink-0">
            <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search reservations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 lg:flex-1">
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
            <Button size="sm" className="gap-1.5" onClick={() => setAddOpen(true)}>
              <Plus className="size-3.5" />
              Add Reservation
            </Button>
          </div>
        </div>

        <ReservationDataTable data={filteredReservations} />
      </PanelCard>

      <AddReservationDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  )
}
