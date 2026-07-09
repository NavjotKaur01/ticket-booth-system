import { EventGroupCard } from "@/features/admin-events/event-group-card"
import type { AdminEventGroup } from "@/types/admin-event"

type EventsListProps = {
  groups: AdminEventGroup[]
  emptyMessage?: string
}

export function EventsList({
  groups,
  emptyMessage = "No events match the current filters.",
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
        <EventGroupCard key={group.id} group={group} />
      ))}
    </div>
  )
}
