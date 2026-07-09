import { StickyNote } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/routes"
import type { AdminEventGroup, AdminEventShowtime } from "@/types/admin-event"

type EventGroupCardProps = {
  group: AdminEventGroup
  onAddReservation: (showtime: AdminEventShowtime) => void
}

export function EventGroupCard({ group, onAddReservation }: EventGroupCardProps) {
  return (
    <section className="border-b last:border-b-0">
      <div className="border-b bg-muted/30 px-3 py-2 text-center sm:text-left">
        <h2 className="text-sm font-semibold tracking-wide text-foreground">
          {group.title}
        </h2>
      </div>

      <div className="grid gap-4 p-3 sm:p-4 md:grid-cols-[120px_minmax(0,1fr)] md:items-start lg:grid-cols-[140px_minmax(0,1fr)]">
        <div className="mx-auto w-full max-w-[140px] overflow-hidden rounded-md border border-border bg-muted/20 md:mx-0">
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
              className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <p className="min-w-0 text-sm font-medium break-words text-foreground">
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

              <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row">
                <Button type="button" size="sm" className="w-full sm:w-auto" asChild>
                  <Link to={ROUTES.reservations}>Show Reservations</Link>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="w-full bg-green-600 text-white hover:bg-green-700 sm:w-auto"
                  onClick={() => onAddReservation(showtime)}
                >
                  Add Reservation
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
