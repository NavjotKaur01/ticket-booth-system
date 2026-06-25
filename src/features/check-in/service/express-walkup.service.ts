import {
  promoOptions,
  reservationShowMeta,
  sectionOptions,
  showOptions,
} from "@/data/reservation"
import type { ShowOption } from "@/types/reservation"
import type { ScrollSelectOption } from "@/components/common/scroll-select-control"

export type ExpressWalkupShowTimeOption = {
  id: string
  label: string
  available: number
}

export type ExpressWalkupSectionOption = {
  id: string
  label: string
  name: string
  price: number
  seats: number
  available: number
}

export type ExpressWalkupTotals = {
  subtotal: string
  serviceCharge: string
  discount: string
  taxes: string
  total: string
}

export type ExpressWalkupDialogData = {
  title: string
  comicStageName: string
  showDate: string
  showTimeOptions: ExpressWalkupShowTimeOption[]
  sectionOptions: ExpressWalkupSectionOption[]
  promoOptions: ScrollSelectOption[]
  originOptions: ScrollSelectOption[]
  ticketCountOptions: number[]
}

export type ExpressWalkupFormValues = {
  showTimeId: string
  sectionId: string
  dinner: boolean
  party: string
  passes: string
  promoId: string
}

const SERVICE_CHARGE_PER_TICKET = 1

function formatMoney(value: number) {
  return `$${value.toFixed(2)}`
}

function formatDisplayDate(value: string) {
  const date = new Date(`${value}T00:00:00`)

  return new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

function parsePrice(value: string) {
  return Number(value.replace(/[^0-9.]/g, "")) || 0
}

function buildTitle(showTime: ShowOption | undefined, showDate: string) {
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${showDate}T00:00:00`))

  return `Express Walkup · ${showTime?.label ?? reservationShowMeta.comicName} · ${formattedDate}`
}

function mapShowTimeOptions(shows: ShowOption[]) {
  return shows.map((show, index) => ({
    id: show.id,
    label: show.label,
    available: Math.max(25, 300 - index * 24),
  }))
}

function mapSectionOptions() {
  return sectionOptions.map((section) => ({
    id: section.id,
    label: section.label,
    name: section.name,
    price: parsePrice(section.price),
    seats: section.seats,
    available: section.available,
  }))
}

export async function getExpressWalkupDialogData({
  showDate,
  showTimeId,
  shows = showOptions,
}: {
  showDate: string
  showTimeId: string
  shows?: ShowOption[]
}): Promise<ExpressWalkupDialogData> {
  await new Promise((resolve) => window.setTimeout(resolve, 180))

  const activeShow = shows.find((show) => show.id === showTimeId) ?? shows[0]

  return {
    title: buildTitle(activeShow, showDate),
    comicStageName: reservationShowMeta.comicName,
    showDate: formatDisplayDate(showDate),
    showTimeOptions: mapShowTimeOptions(shows),
    sectionOptions: mapSectionOptions(),
    promoOptions: promoOptions.map((option) => ({
      value: option.id,
      label: option.label,
    })),
    originOptions: [{ value: "walkup", label: "Walkup" }],
    ticketCountOptions: Array.from({ length: 25 }, (_, index) => index + 1),
  }
}

export function createExpressWalkupFormValues(
  data: ExpressWalkupDialogData
): ExpressWalkupFormValues {
  return {
    showTimeId: data.showTimeOptions[0]?.id ?? "",
    sectionId: data.sectionOptions[0]?.id ?? "",
    dinner: false,
    party: "1",
    passes: "1",
    promoId: data.promoOptions[0]?.value ?? "none",
  }
}

function calculateDiscount(
  promoId: string,
  sectionPrice: number,
  party: number
) {
  switch (promoId) {
    case "admit2":
      return party >= 2 ? sectionPrice : 0
    case "admit4":
      return party >= 4 ? sectionPrice * 2 : 0
    case "buy1get1":
      return sectionPrice * Math.floor(party / 2)
    case "comedy10":
      return sectionPrice * party * 0.1
    default:
      return 0
  }
}

export function calculateExpressWalkupTotals({
  formValues,
  sectionOptions,
}: {
  formValues: ExpressWalkupFormValues
  sectionOptions: ExpressWalkupSectionOption[]
}): ExpressWalkupTotals {
  const party = Math.max(0, Number(formValues.party) || 0)
  const section = sectionOptions.find(
    (option) => option.id === formValues.sectionId
  )
  const price = section?.price ?? 0
  const subtotal = price * party
  const serviceCharge = party > 0 ? SERVICE_CHARGE_PER_TICKET * party : 0
  const discount = calculateDiscount(formValues.promoId, price, party)
  const taxes = 0
  const total = Math.max(0, subtotal + serviceCharge + taxes - discount)

  return {
    subtotal: formatMoney(subtotal),
    serviceCharge: formatMoney(serviceCharge),
    discount: formatMoney(discount),
    taxes: formatMoney(taxes),
    total: formatMoney(total),
  }
}
