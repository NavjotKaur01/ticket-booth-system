import { cn } from "@/lib/utils"
import type { ShowOption } from "@/types/reservation"

type ShowTimePickerProps = {
  shows: ShowOption[]
  showTime: string
  onShowTimeChange: (value: string) => void
  className?: string
}

/** Selectable show-time cards — time on top, venue subtitle below. */
export function ShowTimePicker({
  shows,
  showTime,
  onShowTimeChange,
  className,
}: ShowTimePickerProps) {
  return (
    <div
      className={cn(
        "-mx-0.5 flex min-w-0 items-stretch gap-1.5 overflow-x-auto px-0.5 pb-0.5",
        className
      )}
    >
      {shows.map((show) => {
        const isSelected = showTime === show.id

        return (
          <button
            key={show.id}
            type="button"
            title={show.label}
            onClick={() => onShowTimeChange(show.id)}
            className={cn(
              "flex w-[5.75rem] shrink-0 flex-col rounded-lg px-2 py-1.5 text-left transition-colors sm:w-[6.75rem] sm:px-2.5 sm:py-2",
              isSelected
                ? "bg-primary text-primary-foreground"
                : "border border-border/60 bg-background text-foreground hover:bg-muted/30"
            )}
          >
            <span className="truncate text-xs font-semibold sm:text-sm">
              {show.time ?? show.label}
            </span>
            <span
              className={cn(
                "truncate text-[11px] sm:text-xs",
                isSelected
                  ? "text-primary-foreground/85"
                  : "text-muted-foreground"
              )}
            >
              {show.subtitle ?? "Main Theater"}
            </span>
          </button>
        )
      })}
    </div>
  )
}

type ShowTimeFieldProps = {
  shows: ShowOption[]
  showTime: string
  onShowTimeChange: (value: string) => void
  className?: string
}

/** Labeled Show / Time field with card picker. */
export function ShowTimeField({
  shows,
  showTime,
  onShowTimeChange,
  className,
}: ShowTimeFieldProps) {
  return (
    <div className={cn("min-w-0", className)}>
      <span className="mb-1 block text-xs font-medium text-muted-foreground">
        Show / Time
      </span>
      <ShowTimePicker
        shows={shows}
        showTime={showTime}
        onShowTimeChange={onShowTimeChange}
      />
    </div>
  )
}
