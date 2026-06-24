import type { RecurrenceFormValue, RecurrenceState } from "@/types/recurrence"

const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
]

export function weekdayIndexToName(index: number) {
  return WEEKDAY_NAMES[index] ?? "Sunday"
}

export function mapRecurrenceFormToState(form: RecurrenceFormValue): RecurrenceState {
  const startDate = form.startDate
  const dailyWeekdays =
    form.dailyWeekdays.length > 0
      ? form.dailyWeekdays
      : [startDate.getDay()]

  return {
    showTime: startDate,
    isEndDate: form.endMode === "date",
    isEndAfter: form.endMode === "after",
    endAfter: Math.max(1, form.occurrences),
    occurrenceEndDate: form.endDate,
    isDaily: form.pattern === "daily",
    isWeekly: form.pattern === "weekly",
    isMonthly: form.pattern === "monthly",
    isYearly: form.pattern === "yearly",
    dailyWeekdays,
    weeklyWeekdays:
      form.selectedWeekdays.length > 0
        ? form.selectedWeekdays
        : [startDate.getDay()],
    isMonthByDay: form.monthlyMode === "day",
    isMonthByWeekday: form.monthlyMode === "weekday",
    monthDay: startDate.getDate(),
    monthRecurrence: Math.max(1, form.interval),
    monthRecurrence2: Math.max(1, form.interval),
    weekName: form.monthlyOrdinal,
    weekDayName: form.monthlyWeekday,
    isYearByDate: form.yearlyMode === "date",
    isYearByWeekday: form.yearlyMode === "weekday",
    yearRecurrence: form.yearlyDay,
    yearMonthName: form.yearlyMonth,
    yearMonthName2: form.yearlyMonth,
    yearWeekName: form.yearlyOrdinal,
    yearWeekDayName: form.yearlyWeekday,
  }
}

export function validateRecurrenceForm(form: RecurrenceFormValue): string | null {
  if (form.startDate < getStartOfDay(new Date())) {
    return "This show is in the past, cannot be modified."
  }

  if (form.endMode === "date" && form.endDate < form.startDate) {
    return "End Date can't be prior than Show date."
  }

  if (form.pattern === "weekly" && form.selectedWeekdays.length === 0) {
    return "Select at least one weekday."
  }

  if (form.pattern === "daily" && form.dailyWeekdays.length === 0) {
    return "Select at least one weekday."
  }

  return null
}

function getStartOfDay(date: Date) {
  const value = new Date(date)
  value.setHours(0, 0, 0, 0)
  return value
}
