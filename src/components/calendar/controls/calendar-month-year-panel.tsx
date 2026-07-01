import { useEffect, useMemo, useRef, type TouchEvent, type WheelEvent } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  getDefaultCalendarEndMonth,
  getDefaultCalendarStartMonth,
} from "@/components/ui/calendar"

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sept",
  "Oct",
  "Nov",
  "Dec",
] as const

type CalendarMonthYearPanelProps = {
  month: Date
  selectedMonth?: Date
  expandedYear: number
  alignExpandedYearToTop?: boolean
  onExpandedYearChange: (year: number) => void
  onMonthSelect: (month: Date) => void
  startMonth?: Date
  endMonth?: Date
  minDate?: Date
  maxDate?: Date
}

function getMonthBounds(year: number, monthIndex: number) {
  return {
    start: new Date(year, monthIndex, 1),
    end: new Date(year, monthIndex + 1, 0),
  }
}

function isMonthDisabled(
  year: number,
  monthIndex: number,
  minDate?: Date,
  maxDate?: Date
) {
  const { start, end } = getMonthBounds(year, monthIndex)

  if (minDate && end < minDate) {
    return true
  }

  if (maxDate && start > maxDate) {
    return true
  }

  return false
}

export function CalendarMonthYearPanel({
  month,
  selectedMonth,
  expandedYear,
  alignExpandedYearToTop = false,
  onExpandedYearChange,
  onMonthSelect,
  startMonth = getDefaultCalendarStartMonth(),
  endMonth = getDefaultCalendarEndMonth(),
  minDate,
  maxDate,
}: CalendarMonthYearPanelProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const years = useMemo(() => {
    const firstYear = startMonth.getFullYear()
    const lastYear = endMonth.getFullYear()
    return Array.from({ length: lastYear - firstYear + 1 }, (_, index) => firstYear + index)
  }, [endMonth, startMonth])

  useEffect(() => {
    if (!alignExpandedYearToTop) {
      return
    }

    const container = listRef.current
    if (!container) {
      return
    }

    function scrollExpandedYearToTop(scrollContainer: HTMLDivElement) {
      const yearElement = scrollContainer.querySelector<HTMLElement>(
        `[data-year="${expandedYear}"]`
      )
      if (!yearElement) {
        return
      }

      scrollContainer.scrollTop = yearElement.offsetTop
    }

    scrollExpandedYearToTop(container)
    requestAnimationFrame(() => scrollExpandedYearToTop(container))
  }, [alignExpandedYearToTop, expandedYear])

  function handleWheel(event: WheelEvent<HTMLDivElement>) {
    event.stopPropagation()
    event.currentTarget.scrollTop += event.deltaY
  }

  function handleTouchMove(event: TouchEvent<HTMLDivElement>) {
    event.stopPropagation()
  }

  return (
    <div
      ref={listRef}
      className="calendar-thin-scrollbar max-h-[min(18rem,calc(var(--radix-popover-content-available-height)-0.5rem))] touch-pan-y overscroll-contain overflow-y-auto pr-1 [-webkit-overflow-scrolling:touch]"
      onWheel={handleWheel}
      onTouchMove={handleTouchMove}
    >
      {years.map((year) => {
        const isExpanded = year === expandedYear

        return (
          <section key={year} data-year={year} className="border-b border-border/70 last:border-b-0">
            <button
              type="button"
              className={cn(
                "flex w-full items-center px-3 py-2 text-left text-sm font-medium transition-colors",
                isExpanded
                  ? "bg-muted text-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              onClick={() => onExpandedYearChange(year)}
            >
              {year}
            </button>

            {isExpanded ? (
              <div className="grid grid-cols-4 gap-1 bg-background px-2 py-2">
                {MONTH_LABELS.map((label, monthIndex) => {
                  const disabled = isMonthDisabled(year, monthIndex, minDate, maxDate)
                  const isActiveMonth =
                    month.getFullYear() === year && month.getMonth() === monthIndex
                  const isSelectedMonth =
                    selectedMonth?.getFullYear() === year &&
                    selectedMonth.getMonth() === monthIndex

                  return (
                    <Button
                      key={`${year}-${label}`}
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={disabled}
                      className={cn(
                        "h-8 px-0 text-xs font-medium",
                        (isActiveMonth || isSelectedMonth) &&
                          "border border-primary bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                      )}
                      onClick={() => onMonthSelect(new Date(year, monthIndex, 1))}
                    >
                      {label}
                    </Button>
                  )
                })}
              </div>
            ) : null}
          </section>
        )
      })}
    </div>
  )
}
