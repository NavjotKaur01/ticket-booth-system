export type RecurrencePattern = "daily" | "weekly" | "monthly" | "yearly"
export type RecurrenceEndMode = "after" | "date"
export type MonthlyRecurrenceMode = "day" | "weekday"
export type YearlyRecurrenceMode = "date" | "weekday"

export type RecurrenceFormValue = {
  startDate: Date
  pattern: RecurrencePattern
  selectedWeekdays: number[]
  dailyWeekdays: number[]
  monthlyMode: MonthlyRecurrenceMode
  yearlyMode: YearlyRecurrenceMode
  interval: number
  occurrences: number
  endMode: RecurrenceEndMode
  endDate: Date
  monthlyOrdinal: string
  monthlyWeekday: string
  yearlyMonth: string
  yearlyDay: number
  yearlyOrdinal: string
  yearlyWeekday: string
}

export type RecurrenceState = {
  showTime: Date
  isEndDate: boolean
  isEndAfter: boolean
  endAfter: number
  occurrenceEndDate: Date
  isDaily: boolean
  isWeekly: boolean
  isMonthly: boolean
  isYearly: boolean
  dailyWeekdays: number[]
  weeklyWeekdays: number[]
  isMonthByDay: boolean
  isMonthByWeekday: boolean
  monthDay: number
  monthRecurrence: number
  monthRecurrence2: number
  weekName: string
  weekDayName: string
  isYearByDate: boolean
  isYearByWeekday: boolean
  yearRecurrence: number
  yearMonthName: string
  yearMonthName2: string
  yearWeekName: string
  yearWeekDayName: string
}
