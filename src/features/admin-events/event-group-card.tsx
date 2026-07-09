import { StickyNote } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/routes"
import type { AdminEventGroup } from "@/types/admin-event"

type EventGroupCardProps = {
  group: AdminEventGroup
}

export function EventGroupCard({ group }: EventGroupCardProps) {
  return (
    <section className="border-b last:border-b-0">
      <div className="border-b bg-muted/30 px-3 py-2 text-center">
        <h2 className="text-sm font-semibold tracking-wide text-foreground">
          {group.title}
        </h2>
      </div>

      <div className="grid gap-4 p-4 lg:grid-cols-[140px_minmax(0,1fr)] lg:items-start">
        <div className="mx-auto w-full max-w-[140px] overflow-hidden rounded-md border border-border bg-muted/20 lg:mx-0">
          <img
            src={group.imageUrl}
            alt={group.title}
            className="aspect-3/4 w-full object-cover"
          />
        </div>

        <div className="divide-y divide-border">
          {group.showtimes.map((showtime) => (
            <div
              key={showtime.id}
              className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-foreground">
                  {showtime.showDateLabel}
                </p>
                <span className="inline-flex items-center rounded-full bg-teal-700 px-2.5 py-0.5 text-xs font-medium text-white">
                  {showtime.priceLabel}
                </span>
                {showtime.hasNote ? (
                  <span
                    className="inline-flex size-6 items-center justify-center rounded-sm bg-amber-300 text-amber-950"
                    title="Show note"
                  >
                    <StickyNote className="size-3.5" />
                  </span>
                ) : null}
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <Button type="button" size="sm" asChild>
                  <Link to={ROUTES.reservations}>Show Reservations</Link>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="bg-green-600 text-white hover:bg-green-700"
                  asChild
                >
                  <Link to={ROUTES.reservations}>Add Reservation</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
