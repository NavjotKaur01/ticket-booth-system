import dayjs from "dayjs"
import { CalendarIcon } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
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

function formatDisplayDate(date: Date | null, placeholder: string) {
  if (!date) {
    return placeholder
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

type CalendarDatePickerControlProps = {
  id: string
  value: string
  onChange: (value: string) => void
  disablePastDates?: boolean
  placeholder?: string
  className?: string
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
            {formatDisplayDate(selectedDate, placeholder)}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          month={visibleMonth}
          onMonthChange={setVisibleMonth}
          selected={selectedDate ?? undefined}
          disabled={minSelectableDate ? { before: minSelectableDate } : undefined}
          onSelect={(nextDate) => {
            if (nextDate) {
              onChange(dayjs(getStartOfDay(nextDate)).format("YYYY-MM-DD"))
              setIsOpen(false)
            }
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
