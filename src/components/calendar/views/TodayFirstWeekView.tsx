import type React from "react"
import type {
  DateLocalizer,
  NavigateAction,
  TitleOptions,
  ViewProps,
  ViewStatic,
} from "react-big-calendar"
import TimeGrid from "react-big-calendar/lib/TimeGrid"

import {
  getCurrentWeekShiftedRange,
  getStandardWeekRange,
  isCurrentWeek,
  resolveNow,
  toDate,
} from "./calendar-view-range"
import type { CalendarEvent } from "@/types/calendar-event"

const BaseTimeGrid =
  (TimeGrid as unknown as { default?: React.ComponentType<any> }).default ??
  (TimeGrid as unknown as React.ComponentType<any>)

type WeekViewComponent = React.ComponentType<ViewProps<CalendarEvent>> &
  ViewStatic & {
    range: (date: Date, options: { localizer: DateLocalizer }) => Date[]
  }

function buildWeekRange(date: Date, localizer: DateLocalizer, now: Date) {
  return isCurrentWeek(date, now, localizer)
    ? getCurrentWeekShiftedRange(now, localizer)
    : getStandardWeekRange(date, localizer)
}

function TodayFirstWeekViewComponent(props: ViewProps<CalendarEvent>) {
  const {
    date,
    localizer,
    min,
    max,
    scrollToTime,
    enableAutoScroll = true,
    ...rest
  } = props
  const displayDate = toDate(date)
  const now = resolveNow(props.getNow)
  const range = buildWeekRange(displayDate, localizer, now)
  const dayStart = localizer.startOf(now, "day")

  return (
    <BaseTimeGrid
      {...rest}
      range={range}
      eventOffset={15}
      localizer={localizer}
      min={min ?? dayStart}
      max={max ?? localizer.endOf(now, "day")}
      scrollToTime={scrollToTime ?? dayStart}
      enableAutoScroll={enableAutoScroll}
    />
  )
}

const TodayFirstWeekView = TodayFirstWeekViewComponent as WeekViewComponent

TodayFirstWeekView.navigate = (
  date: Date,
  action: NavigateAction,
  { localizer }: { localizer: DateLocalizer }
) => {
  switch (action) {
    case "PREV":
      return localizer.add(date, -1, "week")
    case "NEXT":
      return localizer.add(date, 1, "week")
    default:
      return date
  }
}

TodayFirstWeekView.title = (date: Date, { localizer }: TitleOptions) => {
  const now = resolveNow()
  const range = buildWeekRange(date, localizer, now)
  const start = range[0]
  const end = range[range.length - 1]

  return localizer.format({ start, end }, "dayRangeHeaderFormat")
}

TodayFirstWeekView.range = (
  date: Date,
  { localizer }: { localizer: DateLocalizer }
) => {
  const now = resolveNow()
  return buildWeekRange(date, localizer, now)
}

export default TodayFirstWeekView

