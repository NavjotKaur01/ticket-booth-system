import { EventGroupCard } from "@/features/admin-events/event-group-card"
import type { AdminEventGroup, AdminEventShowtime } from "@/types/admin-event"

type EventsListProps = {
  groups: AdminEventGroup[]
  emptyMessage?: string
  onAddReservation: (showtime: AdminEventShowtime) => void
}

export function EventsList({
  groups,
  emptyMessage = "No events match the current filters.",
  onAddReservation,
}: EventsListProps) {
  if (groups.length === 0) {
    return (
      <div className="px-3 py-12 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div>
      {groups.map((group) => (
        <EventGroupCard
          key={group.id}
          group={group}
          onAddReservation={onAddReservation}
        />
      ))}
    </div>
  )
}
