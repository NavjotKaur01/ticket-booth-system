import { useEffect, useMemo, useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import { adminEventGroups as initialGroups } from "@/data/admin-events"
import { EventsFiltersBar } from "@/features/admin-events/events-filters-bar"
import { EventsList } from "@/features/admin-events/events-list"
import { useAppSession } from "@/hooks/use-app-session"
import {
  countAdminEventShowtimes,
  filterAdminEventGroups,
} from "@/lib/filter-admin-events"
import type { AdminEventFilters, AdminEventGroup } from "@/types/admin-event"
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

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        All Events
      </h1>

      <PanelCard>
        <EventsFiltersBar
          draftFilters={draftFilters}
          onFilterChange={updateDraftFilter}
          onSearch={handleSearch}
        />

        <div className="border-b px-3 py-2 text-center">
          <p className="text-sm text-muted-foreground">
            Total Records found:{" "}
            <span className="font-semibold tabular-nums text-foreground">
              {totalShowtimes}
            </span>
          </p>
        </div>

        <EventsList groups={filteredGroups} />
      </PanelCard>
    </div>
  )
}
