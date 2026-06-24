import { Check } from "lucide-react"
import { useEffect, useRef, type WheelEvent } from "react"

import { cn } from "@/lib/utils"

export type CalendarSelectOption = {
  value: string
  label: string
}

type CalendarScrollSelectListProps = {
  value: string
  options: CalendarSelectOption[]
  onSelect: (value: string) => void
  isOpen: boolean
}

export function getCalendarSelectOptions(
  value: string,
  options: CalendarSelectOption[]
) {
  if (!value || options.some((option) => option.value === value)) {
    return options
  }

  return [{ value, label: value }, ...options]
}

export function CalendarScrollSelectList({
  value,
  options,
  onSelect,
  isOpen,
}: CalendarScrollSelectListProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const displayOptions = getCalendarSelectOptions(value, options)

  useEffect(() => {
    if (!isOpen || !listRef.current) {
      return
    }

    listRef.current
      .querySelector<HTMLElement>("[data-selected='true']")
      ?.scrollIntoView({ block: "center" })
  }, [isOpen, value, displayOptions.length])

  function handleWheel(event: WheelEvent<HTMLDivElement>) {
    event.stopPropagation()
    event.currentTarget.scrollTop += event.deltaY
  }

  return (
    <div
      ref={listRef}
      className="calendar-thin-scrollbar max-h-44 overscroll-contain overflow-y-auto pr-1"
      onWheel={handleWheel}
    >
      {displayOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          data-selected={option.value === value ? "true" : undefined}
          className={cn(
            "flex h-8 w-full items-center justify-between rounded-sm px-2 text-left text-sm hover:bg-primary/10 hover:text-primary",
            option.value === value && "bg-primary/10 text-primary"
          )}
          onClick={() => onSelect(option.value)}
        >
          <span className="truncate">{option.label}</span>
          {option.value === value ? <Check className="size-3.5 shrink-0" /> : null}
        </button>
      ))}
    </div>
  )
}
