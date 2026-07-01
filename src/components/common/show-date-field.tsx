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

function formatShowDate(dateValue: string) {
  const date = parseDateValue(dateValue)
  if (!date) {
    return dateValue
  }

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

type ShowDateFieldProps = {
  showDate: string
  onShowDateChange: (value: string) => void
  className?: string
  disabled?: boolean
}

export function ShowDateField({
  showDate,
  onShowDateChange,
  className,
  disabled = false,
}: ShowDateFieldProps) {
  const selectedDate = parseDateValue(showDate)
  const [isOpen, setIsOpen] = useState(false)
  const [visibleMonth, setVisibleMonth] = useState<Date>(() => selectedDate ?? new Date())

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

  if (disabled) {
    return (
      <div
        aria-disabled="true"
        className={cn(
          "inline-flex items-center gap-1 rounded-md border border-border/60 bg-muted/25 px-2.5 py-1.5 opacity-70",
          className
        )}
      >
        <span className="text-sm leading-none text-muted-foreground">
          {formatShowDate(showDate)}
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
            "h-auto items-center gap-1 px-0 py-0 text-left font-normal hover:bg-transparent",
            className
          )}
        >
          <span className="text-sm leading-none text-foreground">
            {formatShowDate(showDate)}
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
              onShowDateChange(dayjs(getStartOfDay(nextDate)).format("YYYY-MM-DD"))
              setIsOpen(false)
            }}
          />
        ) : null}
      </PopoverContent>
    </Popover>
  )
}

