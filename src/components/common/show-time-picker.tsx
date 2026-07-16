import type { KeyboardEvent, Ref } from "react"

import { cn } from "@/lib/utils"
import type { ShowOption } from "@/types/reservation"

type ShowTimePickerProps = {
  shows: ShowOption[]
  showTime: string
  onShowTimeChange: (value: string) => void
  className?: string
  selectedButtonRef?: Ref<HTMLButtonElement>
  onShowTimeKeyDown?: (
    event: KeyboardEvent<HTMLButtonElement>,
    show: ShowOption
  ) => void
}

/** Selectable show-time cards — time on top, venue subtitle below. */
export function ShowTimePicker({
  shows,
  showTime,
  onShowTimeChange,
  className,
  selectedButtonRef,
  onShowTimeKeyDown,
}: ShowTimePickerProps) {
  return (
    <div
      className={cn(
        "-mx-0.5 flex min-w-0 items-stretch gap-1.5 overflow-x-auto p-0.5",
        className
      )}
    >
      {shows.map((show) => {
        const isSelected = showTime === show.id

        return (
          <button
            key={show.id}
            type="button"
            ref={isSelected ? selectedButtonRef : undefined}
            title={show.label}
            onClick={() => onShowTimeChange(show.id)}
            onKeyDown={(event) => onShowTimeKeyDown?.(event, show)}
            className={cn(
              "flex w-[5.75rem] shrink-0 flex-col rounded-lg px-2 py-1.5 text-left transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none sm:w-[6.75rem] sm:px-2.5 sm:py-2",
              isSelected
                ? "bg-primary text-primary-foreground"
                : "border border-border/60 bg-background text-foreground hover:bg-muted/30"
            )}
          >
            <span className="truncate text-xs font-semibold sm:text-sm">
              {show.time ?? show.label}
            </span>
            {show.subtitle?.trim() || show.headliner?.trim() ? (
              <span
                className={cn(
                  "truncate text-[11px] sm:text-xs",
                  isSelected
                    ? "text-primary-foreground/85"
                    : "text-muted-foreground"
                )}
              >
                {show.subtitle?.trim() || show.headliner?.trim()}
              </span>
            ) : null}
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

/** Labeled Show Time field with card picker. */
export function ShowTimeField({
  shows,
  showTime,
  onShowTimeChange,
  className,
}: ShowTimeFieldProps) {
  return (
    <div className={cn("min-w-0", className)}>
      <span className="mb-1 block text-xs font-medium text-muted-foreground">
        Show Time
      </span>
      <ShowTimePicker
        shows={shows}
        showTime={showTime}
        onShowTimeChange={onShowTimeChange}
      />
    </div>
  )
}
