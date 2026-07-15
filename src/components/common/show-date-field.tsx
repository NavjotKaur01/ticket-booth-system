import dayjs from "dayjs"
import { Calendar as CalendarIcon } from "lucide-react"
import { useEffect, useState } from "react"

import { DatePickerCalendarPanel } from "@/components/calendar/controls/date-picker-calendar-panel"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { formatDateForDisplay } from "@/lib/date-display-format"
import { cn } from "@/lib/utils"

function getStartOfDay(date: Date) {
  const value = new Date(date)
  value.setHours(0, 0, 0, 0)
  return value
}

function parseDateValue(value: string) {
  if (!value) {
    return null
  }

  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.toDate() : null
}

type ShowDateFieldProps = {
  showDate: string
  onShowDateChange: (value: string) => void
  className?: string
  disabled?: boolean
  displayFormat?: string
  /** `input` = bordered field (forms). `plain` = compact text+icon (toolbars). */
  appearance?: "input" | "plain"
}

export function ShowDateField({
  showDate,
  onShowDateChange,
  className,
  disabled = false,
  displayFormat,
  appearance = "input",
}: ShowDateFieldProps) {
  const selectedDate = parseDateValue(showDate)
  const [isOpen, setIsOpen] = useState(false)
  const [visibleMonth, setVisibleMonth] = useState<Date>(
    () => selectedDate ?? new Date()
  )

  useEffect(() => {
    if (selectedDate) {
      setVisibleMonth(selectedDate)
    }
  }, [showDate])

  function handleOpenChange(nextOpen: boolean) {
    if (disabled) {
      setIsOpen(false)
      return
    }

    setIsOpen(nextOpen)

    if (nextOpen && selectedDate) {
      setVisibleMonth(selectedDate)
    }
  }

  const displayValue = formatDateForDisplay(showDate, showDate, displayFormat)

  if (disabled) {
    return (
      <div
        aria-disabled="true"
        className={cn(
          appearance === "plain"
            ? "inline-flex items-center gap-1.5 opacity-70"
            : "inline-flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-muted/25 px-3 py-2 opacity-70 shadow-xs",
          className
        )}
      >
        <span
          className={cn(
            "text-sm leading-none",
            appearance === "plain" ? "text-muted-foreground" : "text-foreground"
          )}
        >
          {displayValue}
        </span>
        <CalendarIcon className="size-4 shrink-0 text-muted-foreground/80" />
      </div>
    )
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className={cn(
            appearance === "plain"
              ? "h-auto items-center gap-1.5 px-0 py-0 text-left font-normal hover:bg-transparent"
              : "h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-left font-normal shadow-xs hover:bg-background",
            className
          )}
        >
          <span className="text-sm leading-none text-foreground">
            {displayValue}
          </span>
          <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        {isOpen ? (
          <DatePickerCalendarPanel
            key={`show-date-${showDate}`}
            month={visibleMonth}
            onMonthChange={setVisibleMonth}
            selected={selectedDate ?? undefined}
            onSelect={(nextDate) => {
              onShowDateChange(
                dayjs(getStartOfDay(nextDate)).format("YYYY-MM-DD")
              )
              setIsOpen(false)
            }}
          />
        ) : null}
      </PopoverContent>
    </Popover>
  )
}
