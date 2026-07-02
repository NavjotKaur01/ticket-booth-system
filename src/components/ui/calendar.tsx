"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import "react-day-picker/style.css"

const DEFAULT_CALENDAR_YEAR_SPAN_PAST = 125
const DEFAULT_CALENDAR_YEAR_SPAN_FUTURE = 25

export function getDefaultCalendarStartMonth() {
  const currentYear = new Date().getFullYear()
  return new Date(currentYear - DEFAULT_CALENDAR_YEAR_SPAN_PAST, 0, 1)
}

export function getDefaultCalendarEndMonth() {
  const currentYear = new Date().getFullYear()
  return new Date(currentYear + DEFAULT_CALENDAR_YEAR_SPAN_FUTURE, 11, 31)
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  startMonth,
  endMonth,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      captionLayout={captionLayout}
      startMonth={startMonth ?? getDefaultCalendarStartMonth()}
      endMonth={endMonth ?? getDefaultCalendarEndMonth()}
      className={cn("p-3", className)}
      classNames={{
        root: "w-full",
        months: "flex flex-col gap-4",
        month: "relative space-y-4",
        month_caption: "flex h-9 w-full items-center justify-center px-9 text-sm font-medium",
        nav: "absolute inset-x-3 top-3 flex items-center justify-between",
        button_previous: cn(
          buttonVariants({ variant: "outline", size: "icon-sm" }),
          "size-7 bg-transparent p-0 opacity-70 hover:opacity-100"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline", size: "icon-sm" }),
          "size-7 bg-transparent p-0 opacity-70 hover:opacity-100"
        ),
        weekdays: "grid grid-cols-7 gap-1",
        weekday: "h-8 text-center text-xs font-medium text-muted-foreground",
        week: "grid grid-cols-7 gap-1",
        day: "grid size-8 place-items-center rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
        day_button: "grid size-8 place-items-center rounded-md",
        selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
        today: "border border-ring text-foreground",
        outside: "text-muted-foreground opacity-50",
        disabled: "text-muted-foreground opacity-40",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: chevronClassName }) => {
          if (orientation === "left") {
            return <ChevronLeft className={cn("size-4", chevronClassName)} />
          }

          return <ChevronRight className={cn("size-4", chevronClassName)} />
        },
      }}
      {...props}
    />
  )
}

export { Calendar }
