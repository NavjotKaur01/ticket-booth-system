import { User } from "lucide-react"

import { UserLocationAssignPopover } from "@/features/user-setup/user-location-assign-popover"
import { cn } from "@/lib/utils"

type UserLocationAssignCardProps = {
  userName: string
  assignedLocations: string[]
  allLocations: string[]
  onSave: (locations: string[]) => void
}

const MAX_VISIBLE_LOCATIONS = 2

export function UserLocationAssignCard({
  userName,
  assignedLocations,
  allLocations,
  onSave,
}: UserLocationAssignCardProps) {
  const hasAssignments = assignedLocations.length > 0
  const visibleLocations = assignedLocations.slice(0, MAX_VISIBLE_LOCATIONS)
  const hiddenCount = Math.max(0, assignedLocations.length - MAX_VISIBLE_LOCATIONS)

  return (
    <article
      className={cn(
        "flex min-w-0 flex-col gap-2.5 rounded-lg border bg-background p-3 transition-colors",
        hasAssignments
          ? "border-primary/20 bg-primary/2"
          : "border-border hover:border-border/80 hover:bg-muted/20"
      )}
    >
      <div className="flex items-start gap-2.5">
        <span
          className={cn(
            "mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-md",
            hasAssignments
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground"
          )}
        >
          <User className="size-3.5" />
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-medium text-foreground">{userName}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {hasAssignments
              ? `${assignedLocations.length} location${assignedLocations.length === 1 ? "" : "s"} assigned`
              : "No locations assigned yet"}
          </p>
        </div>

        <UserLocationAssignPopover
          userName={userName}
          locations={allLocations}
          assignedLocations={assignedLocations}
          onSave={onSave}
          triggerLabel={hasAssignments ? "Manage" : "Assign"}
        />
      </div>

      {hasAssignments ? (
        <div className="flex flex-wrap gap-1.5 pl-9">
          {visibleLocations.map((location) => (
            <span
              key={location}
              className="inline-flex max-w-full items-center truncate rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
            >
              {location}
            </span>
          ))}
          {hiddenCount > 0 ? (
            <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              +{hiddenCount} more
            </span>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}
