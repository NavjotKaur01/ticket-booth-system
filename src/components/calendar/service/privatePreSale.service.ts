import dayjs from "dayjs"

import { combinePrivateShowDateAndTime } from "@/lib/build-private-show-link-request"
import {
  mapPrivateShowComics,
  mapPrivateShowsForDate,
} from "@/lib/map-private-show-options"
import type { ShowDetailsByDateItem } from "@/types/api/show-details"
import type { CalendarEvent } from "@/types/calendar-event"
import type { PreSaleFormValues } from "@/types/pre-sale"

import type { CalendarSelectOption } from "../controls/CalendarSelectControl"

export type PrivatePreSaleOptions = {
  showOptions: CalendarSelectOption[]
  comicOptions: CalendarSelectOption[]
}

export type PrivatePreSaleFormValues = PreSaleFormValues

export function createPrivatePreSaleFormValues(
  event: CalendarEvent,
  now: Date = new Date()
): PrivatePreSaleFormValues {
  const today = dayjs(now).format("YYYY-MM-DD")
  return {
    showDate: dayjs(event.start).format("YYYY-MM-DD"),
    showId: "",
    comicId: "",
    startDate: today,
    endDate: today,
    accessCode: "",
    startTime: "12:00 am",
    endTime: "12:00 am",
  }
}

export function findSelectedPrivateShow(
  items: ShowDetailsByDateItem[],
  selectedShowId: string
) {
  const normalizedShowId = selectedShowId.trim().toLowerCase()
  return items.find(
    (item) =>
      item.IsPrivate === true &&
      item.ShowId.trim().toLowerCase() === normalizedShowId
  )
}

export function buildSelectedPrivateShowOptions(
  match: ShowDetailsByDateItem | undefined
): PrivatePreSaleOptions {
  if (!match) {
    return { showOptions: [], comicOptions: [] }
  }

  const shows = mapPrivateShowsForDate([match])
  const comics = mapPrivateShowComics(shows, [match])
  return {
    showOptions: shows.map((show) => ({
      value: show.id,
      label: show.label,
    })),
    comicOptions: comics.map((comic) => ({
      value: comic.id,
      label: comic.label,
    })),
  }
}

export function validatePrivatePreSaleForm(
  values: PrivatePreSaleFormValues,
  privateShow: ShowDetailsByDateItem | undefined
): string | null {
  if (!privateShow) {
    return "Selected show is not configured as a private show."
  }
  if (!values.comicId || values.comicId !== privateShow.ComicId) {
    return "Please select a comic."
  }
  if (!values.showId || values.showId !== privateShow.ShowId) {
    return "Please select a show."
  }
  if (!values.accessCode.trim()) {
    return "Please enter an access code."
  }
  if (!values.startDate || !values.endDate) {
    return "Please enter start and end dates."
  }

  const start = combinePrivateShowDateAndTime(
    values.startDate,
    values.startTime
  )
  const end = combinePrivateShowDateAndTime(values.endDate, values.endTime)
  if (!start || !end) {
    return "Please enter valid start and end date/time values."
  }
  if (end.getTime() < start.getTime()) {
    return "End date/time must be on or after start date/time."
  }
  return null
}
