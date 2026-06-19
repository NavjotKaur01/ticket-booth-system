import { useMemo, useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import { touchReservations, touchShows } from "@/data/touch-shows"
import { TouchActionBar } from "@/features/touch/touch-action-bar"
import { TouchCountBar } from "@/features/touch/touch-count-bar"
import { TouchDataTable } from "@/features/touch/touch-data-table"
import { TouchShowList } from "@/features/touch/touch-show-list"
import { SelectSectionDialog } from "@/features/touch/select-section-dialog"
import { filterTouchReservations } from "@/lib/filter-touch-reservations"
import { DEFAULT_TOUCH_FILTERS } from "@/types/touch"

export function Touch() {
  const [selectedShowId, setSelectedShowId] = useState(touchShows[0]?.id ?? "")
  const [seatValue, setSeatValue] = useState("200")
  const [filters, setFilters] = useState(DEFAULT_TOUCH_FILTERS)
  const [reserveOpen, setReserveOpen] = useState(false)

  const selectedShow =
    touchShows.find((show) => show.id === selectedShowId) ?? touchShows[0]

  const filteredRecords = useMemo(
    () =>
      filterTouchReservations(
        touchReservations,
        selectedShow?.id ?? "",
        filters
      ),
    [selectedShow?.id, filters]
  )

  function updateFilter<K extends keyof typeof DEFAULT_TOUCH_FILTERS>(
    key: K,
    value: (typeof DEFAULT_TOUCH_FILTERS)[K]
  ) {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  function handleShowSelect(showId: string) {
    setSelectedShowId(showId)
    const show = touchShows.find((item) => item.id === showId)
    if (show) {
      setSeatValue(String(show.seats))
    }
  }

  if (!selectedShow) {
    return null
  }

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        Touch
      </h1>

      <div className="grid gap-3 xl:grid-cols-[17rem_minmax(0,1fr)]">
        <PanelCard className="overflow-hidden">
          <TouchShowList
            shows={touchShows}
            selectedShowId={selectedShowId}
            onSelectShow={handleShowSelect}
            onFuture={() => undefined}
            onReserve={() => setReserveOpen(true)}
          />
        </PanelCard>

        <SelectSectionDialog
          open={reserveOpen}
          onOpenChange={setReserveOpen}
        />

        <PanelCard>
          <TouchCountBar
            show={selectedShow}
            seatValue={seatValue}
            onSeatValueChange={setSeatValue}
            onSearch={() => undefined}
          />

          <div className="border-b px-3 py-2">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Count</span>
              {" · "}
              Records:{" "}
              <span className="font-semibold tabular-nums text-foreground">
                {filteredRecords.length}
              </span>
            </p>
          </div>

          <TouchDataTable data={filteredRecords} />

          <TouchActionBar filters={filters} onFilterChange={updateFilter} />
        </PanelCard>
      </div>
    </div>
  )
}
