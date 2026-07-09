import { useEffect, useMemo, useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import {
  AdminPageShell,
  AdminPageTitle,
  AdminPanelStats,
  AdminPanelToolbar,
} from "@/components/layout/admin-page"
import { adminEventGroups as initialGroups } from "@/data/admin-events"
import { EventsFiltersBar } from "@/features/admin-events/events-filters-bar"
import { EventsList } from "@/features/admin-events/events-list"
import { AddReservationDialog } from "@/features/reservations/add-reservation-dialog"
import { useAppSession } from "@/hooks/use-app-session"
import {
  countAdminEventShowtimes,
  filterAdminEventGroups,
} from "@/lib/filter-admin-events"
import { parseShowTimeFromAdminLabel } from "@/lib/parse-admin-event-show-time"
import type {
  AdminEventFilters,
  AdminEventGroup,
  AdminEventShowtime,
} from "@/types/admin-event"
import { EMPTY_ADMIN_EVENT_FILTERS } from "@/types/admin-event"

function todayInputValue() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, "0")
  const day = String(today.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function Events() {
  const { locationId } = useAppSession()
  const [groups, setGroups] = useState<AdminEventGroup[]>(initialGroups)
  const [draftFilters, setDraftFilters] = useState<AdminEventFilters>(() => ({
    ...EMPTY_ADMIN_EVENT_FILTERS,
    date: todayInputValue(),
  }))
  const [appliedFilters, setAppliedFilters] = useState<AdminEventFilters>(() => ({
    ...EMPTY_ADMIN_EVENT_FILTERS,
    date: todayInputValue(),
  }))
  const [addReservationOpen, setAddReservationOpen] = useState(false)
  const [addReservationShowDate, setAddReservationShowDate] = useState<string>()
  const [addReservationShowTimeLabel, setAddReservationShowTimeLabel] =
    useState<string>()

  useEffect(() => {
    if (!locationId) {
      return
    }

    setGroups((current) => {
      const usesPlaceholderLocation = current.every(
        (group) => group.locationId === "standupmedia"
      )

      if (!usesPlaceholderLocation) {
        return current
      }

      return current.map((group) =>
        group.locationId === "standupmedia" ? { ...group, locationId } : group
      )
    })
  }, [locationId])

  const filteredGroups = useMemo(
    () => filterAdminEventGroups(groups, locationId, appliedFilters),
    [appliedFilters, groups, locationId]
  )

  const totalShowtimes = countAdminEventShowtimes(filteredGroups)

  function updateDraftFilter<K extends keyof AdminEventFilters>(
    key: K,
    value: AdminEventFilters[K]
  ) {
    setDraftFilters((current) => ({ ...current, [key]: value }))
  }

  function handleSearch() {
    setAppliedFilters(draftFilters)
  }

  function handleAddReservation(showtime: AdminEventShowtime) {
    setAddReservationShowDate(showtime.showDate)
    setAddReservationShowTimeLabel(
      parseShowTimeFromAdminLabel(showtime.showDateLabel)
    )
    setAddReservationOpen(true)
  }

  return (
    <AdminPageShell>
      <AdminPageTitle>All Events</AdminPageTitle>

      <PanelCard>
        <EventsFiltersBar
          draftFilters={draftFilters}
          onFilterChange={updateDraftFilter}
          onSearch={handleSearch}
        />

        <AdminPanelToolbar className="py-2">
          <AdminPanelStats className="sm:ml-auto sm:text-right">
            Total Records found:{" "}
            <span className="font-semibold tabular-nums text-foreground">
              {totalShowtimes}
            </span>
          </AdminPanelStats>
        </AdminPanelToolbar>

        <EventsList
          groups={filteredGroups}
          onAddReservation={handleAddReservation}
        />
      </PanelCard>

      <AddReservationDialog
        open={addReservationOpen}
        onOpenChange={setAddReservationOpen}
        showDate={addReservationShowDate}
        preferredShowTimeLabel={addReservationShowTimeLabel}
      />
    </AdminPageShell>
  )
}
