import { buildSaveShowRequest } from "@/lib/build-save-show-request"
import {
  changeTime,
  getNextMonthDay,
  getNextMonthDayFromWeekDay,
  getNextWeekday,
  getNextYearDay,
  getNextYearDayFromWeekDay,
  monthNameToNumber,
  ordinalToWeekNumber,
  weekdayNameToIndex,
} from "@/lib/recurrence/recurrence-date-utils"
import type { ApiDefaultShowSection } from "@/types/api/save-show"
import type { AddShowFormValues } from "@/types/calendar-show"
import type { RecurrenceState } from "@/types/recurrence"

import type { SectionLookupItem } from "@/types/api/system-lookup"

type SaveShowsWithRecurrenceParams = {
  connectionString: string
  locationId: string
  username: string
  recurrence: RecurrenceState
  form: AddShowFormValues
  sectionRows: ApiDefaultShowSection[]
  sectionLookups: SectionLookupItem[]
  saveShow: (request: ReturnType<typeof buildSaveShowRequest>) => Promise<boolean>
}

function resolveEndAfter(state: RecurrenceState) {
  return state.endAfter > 0 ? state.endAfter : 1
}

async function saveOccurrence(
  params: SaveShowsWithRecurrenceParams,
  showDate: Date,
  showArrival: Date
) {
  const request = buildSaveShowRequest({
    connectionString: params.connectionString,
    locationId: params.locationId,
    username: params.username,
    showDate,
    showArrivalTime: showArrival,
    form: params.form,
    sectionRows: params.sectionRows,
    sectionLookups: params.sectionLookups,
  })

  if (request.ShowList.length === 0) {
    return true
  }

  return params.saveShow(request)
}

export async function saveShowsWithRecurrence(
  params: SaveShowsWithRecurrenceParams
) {
  const state = params.recurrence
  let showTime = new Date(state.showTime)
  let showArrival = new Date(state.showTime)
  const endAfter = resolveEndAfter(state)

  if (state.isDaily) {
    const totalDays = state.isEndDate
      ? Math.floor(
          (state.occurrenceEndDate.getTime() - showTime.getTime()) / 86400000
        ) + 1
      : endAfter

    for (let index = 0; index < totalDays; index += 1) {
      const saved = await saveOccurrence(params, showTime, showArrival)
      if (!saved) {
        return false
      }
      showTime = new Date(showTime.getTime() + 86400000)
      showArrival = new Date(showArrival.getTime() + 86400000)
    }

    return true
  }

  if (state.isWeekly) {
    const totalWeeks = state.isEndDate
      ? Math.floor(
          (state.occurrenceEndDate.getTime() - showTime.getTime()) / (7 * 86400000)
        )
      : endAfter

    for (let index = 0; index < totalWeeks; index += 1) {
      for (const weekday of state.weeklyWeekdays) {
        const occurrenceDate =
          showTime.getDay() === weekday
            ? showTime
            : getNextWeekday(showTime, weekday)

        const saved = await saveOccurrence(params, occurrenceDate, showArrival)
        if (!saved) {
          return false
        }
      }

      showTime = new Date(showTime.getTime() + 7 * 86400000)
      showArrival = new Date(showArrival.getTime() + 7 * 86400000)
    }

    return true
  }

  if (state.isMonthly) {
    const totalMonths = state.isEndDate
      ? Math.max(
          1,
          state.occurrenceEndDate.getMonth() -
            showTime.getMonth() +
            (state.occurrenceEndDate.getFullYear() - showTime.getFullYear()) * 12
        )
      : endAfter

    if (state.isMonthByDay) {
      let cursorDate = showTime
      let cursorArrival = showArrival

      for (let index = 0; index < totalMonths; index += 1) {
        const nextDate = getNextMonthDay(cursorDate, state.monthDay, state.monthRecurrence)
        const nextArrival = getNextMonthDay(
          cursorArrival,
          state.monthDay,
          state.monthRecurrence
        )
        const saved = await saveOccurrence(params, nextDate, nextArrival)
        if (!saved) {
          return false
        }
        cursorDate = nextDate
        cursorArrival = nextArrival
      }

      return true
    }

    const weekNumber = ordinalToWeekNumber(state.weekName)
    const weekday = weekdayNameToIndex(state.weekDayName)
    let cursorDate = showTime
    let cursorArrival = showArrival

    for (let index = 0; index < totalMonths; index += 1) {
      const nextDate = changeTime(
        getNextMonthDayFromWeekDay(
          cursorDate,
          weekNumber,
          weekday,
          state.monthRecurrence2
        ),
        cursorDate.getHours(),
        cursorDate.getMinutes()
      )
      const nextArrival = changeTime(
        getNextMonthDayFromWeekDay(
          cursorArrival,
          weekNumber,
          weekday,
          state.monthRecurrence2
        ),
        cursorArrival.getHours(),
        cursorArrival.getMinutes()
      )
      const saved = await saveOccurrence(params, nextDate, nextArrival)
      if (!saved) {
        return false
      }
      cursorDate = nextDate
      cursorArrival = nextArrival
    }

    return true
  }

  if (state.isYearly) {
    const totalYears = state.isEndDate
      ? Math.max(
          1,
          state.occurrenceEndDate.getFullYear() - showTime.getFullYear()
        )
      : endAfter

    if (state.isYearByDate) {
      const month = monthNameToNumber(state.yearMonthName2)
      let cursorDate = showTime
      let cursorArrival = showArrival

      for (let index = 0; index < totalYears; index += 1) {
        const nextDate = changeTime(
          getNextYearDay(cursorDate, month, state.yearRecurrence, index === 0),
          cursorDate.getHours(),
          cursorDate.getMinutes()
        )
        const nextArrival = changeTime(
          getNextYearDay(cursorArrival, month, state.yearRecurrence, index === 0),
          cursorArrival.getHours(),
          cursorArrival.getMinutes()
        )
        const saved = await saveOccurrence(params, nextDate, nextArrival)
        if (!saved) {
          return false
        }
        cursorDate = nextDate
        cursorArrival = nextArrival
      }

      return true
    }

    const month = monthNameToNumber(state.yearMonthName)
    const weekNumber = ordinalToWeekNumber(state.yearWeekName)
    const weekday = weekdayNameToIndex(state.yearWeekDayName)
    let cursorDate = showTime
    let cursorArrival = showArrival

    for (let index = 0; index < totalYears; index += 1) {
      const nextDate = changeTime(
        getNextYearDayFromWeekDay(
          cursorDate,
          weekNumber,
          weekday,
          month,
          index === 0
        ),
        cursorDate.getHours(),
        cursorDate.getMinutes()
      )
      const nextArrival = changeTime(
        getNextYearDayFromWeekDay(
          cursorArrival,
          weekNumber,
          weekday,
          month,
          index === 0
        ),
        cursorArrival.getHours(),
        cursorArrival.getMinutes()
      )
      const saved = await saveOccurrence(params, nextDate, nextArrival)
      if (!saved) {
        return false
      }
      cursorDate = nextDate
      cursorArrival = nextArrival
    }

    return true
  }

  return saveOccurrence(params, showTime, showArrival)
}
