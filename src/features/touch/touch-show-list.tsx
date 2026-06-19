import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { TouchShow } from "@/types/touch"

type TouchShowListProps = {
  shows: TouchShow[]
  selectedShowId: string
  onSelectShow: (showId: string) => void
  onFuture: () => void
  onReserve: () => void
}

export function TouchShowList({
  shows,
  selectedShowId,
  onSelectShow,
  onFuture,
  onReserve,
}: TouchShowListProps) {
  return (
    <div className="flex h-full min-h-[32rem] flex-col">
      <div className="border-b px-3 py-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Shows
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        <div className="space-y-1.5">
          {shows.map((show) => {
            const active = show.id === selectedShowId

            return (
              <button
                key={show.id}
                type="button"
                onClick={() => onSelectShow(show.id)}
                className={cn(
                  "w-full rounded-md border px-3 py-2.5 text-left transition-colors",
                  active
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border/60 bg-background hover:border-primary/30 hover:bg-muted/40"
                )}
              >
                <p className="text-sm font-semibold">{show.comedianName}</p>
                <p
                  className={cn(
                    "mt-0.5 text-xs",
                    active ? "text-primary/80" : "text-muted-foreground"
                  )}
                >
                  {show.displayDate}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-2 border-t p-2">
        <Button type="button" className="w-full" size="sm" onClick={onFuture}>
          Future
        </Button>
        <Button type="button" className="w-full" size="sm" onClick={onReserve}>
          Reserve
        </Button>
      </div>
    </div>
  )
}
