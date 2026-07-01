import dayjs from "dayjs"
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { useEffect, useState } from "react"
import type { Matcher } from "react-day-picker"

import { Button } from "@/components/ui/button"
import {
  Calendar,
  getDefaultCalendarEndMonth,
  getDefaultCalendarStartMonth,
} from "@/components/ui/calendar"
import { CalendarMonthYearPanel } from "@/components/calendar/controls/calendar-month-year-panel"
import { cn } from "@/lib/utils"

type PickerView = "calendar" | "month-year"

type DatePickerCalendarPanelProps = {
  month: Date
  onMonthChange: (month: Date) => void
  selected?: Date
  onSelect?: (date: Date) => void
  disabled?: Matcher
  startMonth?: Date
  endMonth?: Date
  minDate?: Date
  className?: string
}

function formatCaptionMonth(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(date)
}

function canGoToMonth(
  nextMonth: Date,
  startMonth: Date,
  endMonth: Date
) {
  const monthTime = dayjs(nextMonth).startOf("month")
  return (
    !monthTime.isBefore(dayjs(startMonth).startOf("month")) &&
    !monthTime.isAfter(dayjs(endMonth).startOf("month"))
  )
}

export function DatePickerCalendarPanel({
  month,
  onMonthChange,
  selected,
  onSelect,
  disabled,
  startMonth = getDefaultCalendarStartMonth(),
  endMonth = getDefaultCalendarEndMonth(),
  minDate,
  className,
}: DatePickerCalendarPanelProps) {
  const [view, setView] = useState<PickerView>("calendar")
  const [expandedYear, setExpandedYear] = useState(month.getFullYear())
  const [alignExpandedYearToTop, setAlignExpandedYearToTop] = useState(false)

  useEffect(() => {
    setExpandedYear(month.getFullYear())
  }, [month])

  function openMonthYearView() {
    setExpandedYear(month.getFullYear())
    setAlignExpandedYearToTop(true)
    setView("month-year")
  }

  function handleExpandedYearChange(year: number) {
    setAlignExpandedYearToTop(false)
    setExpandedYear(year)
  }

  function handleMonthSelect(nextMonth: Date) {
    onMonthChange(nextMonth)
    setView("calendar")
  }

  function goToPreviousMonth() {
    const nextMonth = dayjs(month).subtract(1, "month").startOf("month").toDate()
    if (canGoToMonth(nextMonth, startMonth, endMonth)) {
      onMonthChange(nextMonth)
    }
  }

  function goToNextMonth() {
    const nextMonth = dayjs(month).add(1, "month").startOf("month").toDate()
    if (canGoToMonth(nextMonth, startMonth, endMonth)) {
      onMonthChange(nextMonth)
    }
  }

  const canGoPrevious = canGoToMonth(
    dayjs(month).subtract(1, "month").startOf("month").toDate(),
    startMonth,
    endMonth
  )
  const canGoNext = canGoToMonth(
    dayjs(month).add(1, "month").startOf("month").toDate(),
    startMonth,
    endMonth
  )

  return (
    <div className={cn("w-[17.5rem]", className)}>
      <div className="flex items-center justify-between border-b border-border/70 px-2 py-2">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="size-7"
          disabled={view === "month-year" || !canGoPrevious}
          onClick={goToPreviousMonth}
          aria-label="Previous month"
        >
          <ChevronLeft className="size-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="h-8 gap-1 px-2 text-sm font-medium"
          onClick={() => {
            if (view === "calendar") {
              openMonthYearView()
              return
            }

            setView("calendar")
          }}
        >
          {formatCaptionMonth(month)}
          <ChevronDown
            className={cn(
              "size-3.5 text-muted-foreground transition-transform",
              view === "month-year" && "rotate-180"
            )}
          />
        </Button>

        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="size-7"
          disabled={view === "month-year" || !canGoNext}
          onClick={goToNextMonth}
          aria-label="Next month"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {view === "month-year" ? (
        <CalendarMonthYearPanel
          month={month}
          selectedMonth={selected}
          expandedYear={expandedYear}
          alignExpandedYearToTop={alignExpandedYearToTop}
          onExpandedYearChange={handleExpandedYearChange}
          onMonthSelect={handleMonthSelect}
          startMonth={startMonth}
          endMonth={endMonth}
          minDate={minDate}
          maxDate={endMonth}
        />
      ) : (
        <Calendar
          mode="single"
          captionLayout="label"
          hideNavigation
          month={month}
          onMonthChange={onMonthChange}
          selected={selected}
          startMonth={startMonth}
          endMonth={endMonth}
          disabled={disabled}
          onSelect={(nextDate) => {
            if (nextDate) {
              onSelect?.(nextDate)
            }
          }}
          className="p-2"
          classNames={{
            month_caption: "hidden",
            nav: "hidden",
          }}
        />
      )}
    </div>
  )
}
