import { weekdayIndexToName } from "@/lib/recurrence/recurrence-date-utils"
import type { CalendarEvent } from "@/types/calendar-event"
import type { RecurrenceState } from "@/types/recurrence"

export function mapCalendarEventToRecurrenceState(
  event: CalendarEvent
): RecurrenceState {
  const showTime = new Date(event.start)
  const dayOfWeek = showTime.getDay()
  const weekdayName = weekdayIndexToName(dayOfWeek)
  const monthName = showTime.toLocaleString("en-US", { month: "long" })

  return {
    showTime,
    isEndDate: true,
    isEndAfter: false,
    endAfter: 1,
    occurrenceEndDate: showTime,
    isDaily: false,
    isWeekly: true,
    isMonthly: false,
    isYearly: false,
    dailyWeekdays: [dayOfWeek],
    weeklyWeekdays: [dayOfWeek],
    isMonthByDay: true,
    isMonthByWeekday: false,
    monthDay: showTime.getDate(),
    monthRecurrence: 1,
    monthRecurrence2: 1,
    weekName: "First",
    weekDayName: weekdayName,
    isYearByDate: true,
    isYearByWeekday: false,
    yearRecurrence: showTime.getDate(),
    yearMonthName: monthName,
    yearMonthName2: monthName,
    yearWeekName: "First",
    yearWeekDayName: weekdayName,
  }
}
