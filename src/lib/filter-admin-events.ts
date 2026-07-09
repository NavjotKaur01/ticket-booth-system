import type { AdminEventFilters, AdminEventGroup } from "@/types/admin-event"

function matchesSearch(title: string, query: string) {
  if (!query.trim()) return true
  return title.toLowerCase().includes(query.trim().toLowerCase())
}

export function filterAdminEventGroups(
  groups: AdminEventGroup[],
  locationId: string,
  filters: AdminEventFilters
): AdminEventGroup[] {
  return groups
    .filter((group) => !locationId || group.locationId === locationId)
    .filter((group) => matchesSearch(group.title, filters.search))
    .map((group) => {
      if (filters.allShows || !filters.date) {
        return group
      }

      return {
        ...group,
        showtimes: group.showtimes.filter(
          (showtime) => showtime.showDate === filters.date
        ),
      }
    })
    .filter((group) => group.showtimes.length > 0)
}

export function countAdminEventShowtimes(groups: AdminEventGroup[]) {
  return groups.reduce((total, group) => total + group.showtimes.length, 0)
}
