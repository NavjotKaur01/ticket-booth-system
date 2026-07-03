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
  minDate?: string | Date
  maxDate?: string | Date
  placeholder?: string
  className?: string
  displayFormat?: string
  tabIndex?: number
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
  minDate,
  maxDate,
  placeholder = "Select date",
  className,
  displayFormat,
  tabIndex,
}: CalendarDatePickerControlProps) {
  const selectedDate = parseDateValue(value)
  const [isOpen, setIsOpen] = useState(false)
  const [visibleMonth, setVisibleMonth] = useState<Date>(() => selectedDate ?? new Date())
  const explicitMinDate =
    typeof minDate === "string" ? parseDateValue(minDate) : minDate ? getStartOfDay(minDate) : null
  const pastMinDate = disablePastDates ? getStartOfDay(new Date()) : null
  const minSelectableDate =
    explicitMinDate && pastMinDate
      ? explicitMinDate > pastMinDate
        ? explicitMinDate
        : pastMinDate
      : (explicitMinDate ?? pastMinDate ?? undefined)
  const maxSelectableDate =
    typeof maxDate === "string" ? parseDateValue(maxDate) : maxDate ? getStartOfDay(maxDate) : null
  const disabledDates = [
    ...(minSelectableDate ? [{ before: minSelectableDate }] : []),
    ...(maxSelectableDate ? [{ after: maxSelectableDate }] : []),
  ]

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
          tabIndex={tabIndex}
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
            endMonth={maxSelectableDate ?? getDefaultCalendarEndMonth()}
            minDate={minSelectableDate}
            maxDate={maxSelectableDate ?? undefined}
            disabled={disabledDates.length > 0 ? disabledDates : undefined}
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
