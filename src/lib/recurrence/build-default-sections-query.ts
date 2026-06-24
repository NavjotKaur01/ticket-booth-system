import {
  getEndOfDay,
  getNextMonthDay,
  getNextMonthDayFromWeekDay,
  getNextYearDay,
  getNextYearDayFromWeekDay,
  getStartOfDay,
  monthNameToNumber,
  ordinalToWeekNumber,
  weekdayIndexToName,
  weekdayNameToIndex,
} from "@/lib/recurrence/recurrence-date-utils"
import type { RecurrenceState } from "@/types/recurrence"

export type DefaultSectionsQuery = {
  startDate: Date
  endDate: Date
  dayNames: string[]
}

function resolveEndAfter(state: RecurrenceState) {
  return state.endAfter > 0 ? state.endAfter : 1
}

function buildDayNamesFromIndexes(indexes: number[]) {
  return [...new Set(indexes.map(weekdayIndexToName))]
}

export function buildDefaultSectionsQuery(
  state: RecurrenceState
): DefaultSectionsQuery {
  const startDate = getStartOfDay(state.showTime)
  let endDate = getEndOfDay(startDate)
  let dayIndexes: number[] = []

  if (state.isDaily) {
    if (!state.isEndDate) {
      endDate = getEndOfDay(
        new Date(startDate.getTime() + (resolveEndAfter(state) - 1) * 86400000)
      )
    } else {
      endDate = getEndOfDay(state.occurrenceEndDate)
    }
    dayIndexes = state.dailyWeekdays
  } else if (state.isWeekly) {
    if (!state.isEndDate) {
      endDate = getEndOfDay(
        new Date(
          startDate.getTime() +
            (7 * resolveEndAfter(state) - 1) * 86400000
        )
      )
    } else {
      endDate = getEndOfDay(state.occurrenceEndDate)
    }
    dayIndexes = state.weeklyWeekdays
  } else if (state.isMonthly) {
    if (!state.isEndDate) {
      endDate = getEndOfDay(
        new Date(startDate.getFullYear(), startDate.getMonth() + resolveEndAfter(state), 0)
      )
    } else {
      endDate = getEndOfDay(state.occurrenceEndDate)
    }

    const endCount = state.isEndDate
      ? Math.max(
          1,
          state.occurrenceEndDate.getMonth() -
            startDate.getMonth() +
            (state.occurrenceEndDate.getFullYear() - startDate.getFullYear()) * 12 +
            1
        )
      : resolveEndAfter(state)

    if (state.isMonthByDay) {
      let cursor = startDate
      for (let index = 0; index < endCount; index += 1) {
        const next = getNextMonthDay(cursor, state.monthDay, state.monthRecurrence)
        dayIndexes.push(next.getDay())
        cursor = next
      }
    } else {
      const weekNumber = ordinalToWeekNumber(state.weekName)
      const weekday = weekdayNameToIndex(state.weekDayName)
      let cursor = startDate
      for (let index = 0; index < endCount; index += 1) {
        const next = getNextMonthDayFromWeekDay(
          cursor,
          weekNumber,
          weekday,
          state.monthRecurrence2
        )
        dayIndexes.push(next.getDay())
        cursor = next
      }
    }
  } else if (state.isYearly) {
    if (!state.isEndDate) {
      endDate = getEndOfDay(
        new Date(startDate.getFullYear() + resolveEndAfter(state), startDate.getMonth(), startDate.getDate())
      )
    } else {
      endDate = getEndOfDay(state.occurrenceEndDate)
    }

    const endCount = state.isEndDate
      ? Math.max(
          1,
          state.occurrenceEndDate.getFullYear() - startDate.getFullYear() + 1
        )
      : resolveEndAfter(state)

    if (state.isYearByDate) {
      const month = monthNameToNumber(state.yearMonthName2)
      let cursor = startDate
      for (let index = 0; index < endCount; index += 1) {
        const next = getNextYearDay(cursor, month, state.yearRecurrence, index === 0)
        dayIndexes.push(next.getDay())
        cursor = next
        endDate = getEndOfDay(next)
      }
    } else {
      const month = monthNameToNumber(state.yearMonthName)
      const weekNumber = ordinalToWeekNumber(state.yearWeekName)
      const weekday = weekdayNameToIndex(state.yearWeekDayName)
      let cursor = startDate
      for (let index = 0; index < endCount; index += 1) {
        const next = getNextYearDayFromWeekDay(
          cursor,
          weekNumber,
          weekday,
          month,
          index === 0
        )
        dayIndexes.push(next.getDay())
        cursor = next
        endDate = getEndOfDay(next)
      }
    }
  }

  const dayNames = buildDayNamesFromIndexes(dayIndexes)

  return {
    startDate,
    endDate,
    dayNames: dayNames.length > 0 ? dayNames : [weekdayIndexToName(startDate.getDay())],
  }
}
