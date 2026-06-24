import dayjs from "dayjs"

import { preSaleComicOptions } from "@/data/pre-sale"
import type { CalendarEvent } from "@/types/calendar-event"

import type { CalendarSelectOption } from "../controls/CalendarSelectControl"

export type PrivatePreSaleDialogData = {
  eventId: string
  showDate: string
  showId: string
  comicId: string
  startDate: string
  endDate: string
  accessCode: string
  startTime: string
  endTime: string
  showOptions: CalendarSelectOption[]
  comicOptions: CalendarSelectOption[]
}

export type PrivatePreSaleFormValues = {
  showDate: string
  showId: string
  comicId: string
  startDate: string
  endDate: string
  accessCode: string
  startTime: string
  endTime: string
}

function todayDateValue() {
  return dayjs().format("YYYY-MM-DD")
}

function formatShowOptionLabel(event: CalendarEvent) {
  const time = event.time.replace(/(AM|PM)$/i, (match) => ` ${match.toLowerCase()}`)
  return `${time} ${event.performer}`
}

function buildComicOptions(event: CalendarEvent): CalendarSelectOption[] {
  const options: CalendarSelectOption[] = preSaleComicOptions.map((option) => ({
    value: option.id,
    label: option.label,
  }))

  if (!options.some((option) => option.value === event.comicId)) {
    options.unshift({
      value: event.comicId,
      label: event.performer,
    })
  }

  return options
}

export function createPrivatePreSaleFormValues(
  data: PrivatePreSaleDialogData
): PrivatePreSaleFormValues {
  return {
    showDate: data.showDate,
    showId: data.showId,
    comicId: data.comicId,
    startDate: data.startDate,
    endDate: data.endDate,
    accessCode: data.accessCode,
    startTime: data.startTime,
    endTime: data.endTime,
  }
}

export async function getPrivatePreSaleDialogData(
  event: CalendarEvent
): Promise<PrivatePreSaleDialogData> {
  await new Promise((resolve) => window.setTimeout(resolve, 150))

  const today = todayDateValue()

  return {
    eventId: event.id,
    showDate: dayjs(event.start).format("YYYY-MM-DD"),
    showId: event.showId,
    comicId: event.comicId,
    startDate: today,
    endDate: today,
    accessCode: "",
    startTime: "12:00 am",
    endTime: "12:00 am",
    showOptions: [
      {
        value: event.showId,
        label: formatShowOptionLabel(event),
      },
    ],
    comicOptions: buildComicOptions(event),
  }
}

export async function savePrivatePreSale(
  eventId: string,
  values: PrivatePreSaleFormValues
): Promise<void> {
  await new Promise((resolve) => window.setTimeout(resolve, 200))

  void eventId
  void values
}
