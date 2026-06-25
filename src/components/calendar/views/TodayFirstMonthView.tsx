import type React from "react"
import type {
  DateLocalizer,
  NavigateAction,
  TitleOptions,
  ViewProps,
  ViewStatic,
} from "react-big-calendar"
import MonthView from "react-big-calendar/lib/Month"

import {
  getCurrentMonthShiftedVisibleDays,
  getStandardMonthVisibleDays,
  isCurrentMonth,
  resolveNow,
  toDate,
} from "./calendar-view-range"
import type { CalendarEvent } from "@/types/calendar-event"

const BaseMonthView =
  (MonthView as unknown as { default?: React.ComponentType<any> }).default ??
  (MonthView as unknown as React.ComponentType<any>)

type MonthRange = { start: Date; end: Date }
type MonthViewComponent = React.ComponentType<ViewProps<CalendarEvent>> &
  ViewStatic & {
    range: (date: Date, options: { localizer: DateLocalizer }) => MonthRange
  }

function shouldShiftCurrentMonth(
  date: Date,
  now: Date,
  shiftCurrentMonth: boolean
) {
  return shiftCurrentMonth && isCurrentMonth(date, now)
}

function buildMonthVisibleDays(
  date: Date,
  localizer: DateLocalizer,
  now: Date,
  shiftCurrentMonth: boolean
) {
  return shouldShiftCurrentMonth(date, now, shiftCurrentMonth)
    ? getCurrentMonthShiftedVisibleDays(date, localizer, now)
    : getStandardMonthVisibleDays(date, localizer)
}

function createMonthLocalizer(
  date: Date,
  localizer: DateLocalizer,
  now: Date,
  shiftCurrentMonth: boolean
) {
  if (!shouldShiftCurrentMonth(date, now, shiftCurrentMonth)) {
    return localizer
  }

  const visibleDays = buildMonthVisibleDays(date, localizer, now, shiftCurrentMonth)
  const firstVisibleDay = visibleDays[0]
  const lastVisibleDay = visibleDays[visibleDays.length - 1]
  const shiftedLocalizer = Object.create(localizer) as DateLocalizer

  shiftedLocalizer.visibleDays = () => visibleDays.map((day) => new Date(day))
  shiftedLocalizer.firstVisibleDay = () => new Date(firstVisibleDay)
  shiftedLocalizer.lastVisibleDay = () => new Date(lastVisibleDay)

  return shiftedLocalizer
}

export function createTodayFirstMonthView(shiftCurrentMonth: boolean) {
  function TodayFirstMonthViewComponent(props: ViewProps<CalendarEvent>) {
    const displayDate = toDate(props.date)
    const now = resolveNow(props.getNow)
    const shiftedLocalizer = createMonthLocalizer(
      displayDate,
      props.localizer,
      now,
      shiftCurrentMonth
    )

    return <BaseMonthView {...props} localizer={shiftedLocalizer} />
  }

  const TodayFirstMonthView = TodayFirstMonthViewComponent as MonthViewComponent

  TodayFirstMonthView.navigate = (
    date: Date,
    action: NavigateAction,
    { localizer }: { localizer: DateLocalizer }
  ) => {
    switch (action) {
      case "PREV":
        return localizer.add(date, -1, "month")
      case "NEXT":
        return localizer.add(date, 1, "month")
      default:
        return date
    }
  }

  TodayFirstMonthView.title = (date: Date, { localizer }: TitleOptions) =>
    localizer.format(date, "monthHeaderFormat")

  TodayFirstMonthView.range = (
    date: Date,
    { localizer }: { localizer: DateLocalizer }
  ) => {
    const now = resolveNow()

    if (!shouldShiftCurrentMonth(date, now, shiftCurrentMonth)) {
      return {
        start: localizer.firstVisibleDay(date, localizer),
        end: localizer.lastVisibleDay(date, localizer),
      }
    }

    const visibleDays = buildMonthVisibleDays(
      date,
      localizer,
      now,
      shiftCurrentMonth
    )

    return {
      start: visibleDays[0],
      end: visibleDays[visibleDays.length - 1],
    }
  }

  return TodayFirstMonthView
}

const TodayFirstMonthView = createTodayFirstMonthView(true)

export default TodayFirstMonthView
