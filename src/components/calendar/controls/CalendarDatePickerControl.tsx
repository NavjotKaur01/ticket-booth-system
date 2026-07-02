import dayjs from "dayjs"
import { CalendarIcon } from "lucide-react"
import { useEffect, useState } from "react"

import { DatePickerCalendarPanel } from "@/components/calendar/controls/date-picker-calendar-panel"
import { Button } from "@/components/ui/button"
import { getDefaultCalendarEndMonth } from "@/components/ui/calendar"
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

type CalendarDatePickerControlProps = {
  id: string
  value: string
  onChange: (value: string) => void
  disablePastDates?: boolean
  placeholder?: string
  className?: string
  displayFormat?: string
}

export function canNavigateToPreviousDate(value: string, disablePastDates: boolean) {
  if (!disablePastDates || !value) {
    return true
  }

  return dayjs(value).startOf("day").isAfter(dayjs().startOf("day"))
}

export default function CalendarDatePickerControl({
  id,
  value,
  onChange,
  disablePastDates = false,
  placeholder = "Select date",
  className,
  displayFormat,
}: CalendarDatePickerControlProps) {
  const selectedDate = parseDateValue(value)
  const [isOpen, setIsOpen] = useState(false)
  const [visibleMonth, setVisibleMonth] = useState<Date>(() => selectedDate ?? new Date())
  const minSelectableDate = disablePastDates ? getStartOfDay(new Date()) : undefined

  useEffect(() => {
    if (selectedDate) {
      setVisibleMonth(selectedDate)
    }
  }, [value])

  function handleOpenChange(nextOpen: boolean) {
    setIsOpen(nextOpen)

    if (nextOpen && selectedDate) {
      setVisibleMonth(selectedDate)
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className={cn(
            "h-9 justify-start gap-2 px-3 text-left font-normal",
            !selectedDate && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate">
            {formatDateForDisplay(selectedDate, placeholder, displayFormat)}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        {isOpen ? (
          <DatePickerCalendarPanel
            key={`${id}-${value}-picker`}
            month={visibleMonth}
            onMonthChange={setVisibleMonth}
            selected={selectedDate ?? undefined}
            startMonth={minSelectableDate}
            endMonth={getDefaultCalendarEndMonth()}
            minDate={minSelectableDate}
            disabled={minSelectableDate ? { before: minSelectableDate } : undefined}
            onSelect={(nextDate) => {
              onChange(dayjs(getStartOfDay(nextDate)).format("YYYY-MM-DD"))
              setIsOpen(false)
            }}
          />
        ) : null}
      </PopoverContent>
    </Popover>
  )
}
