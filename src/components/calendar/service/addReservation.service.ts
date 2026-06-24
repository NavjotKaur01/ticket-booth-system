import dayjs from "dayjs"

import type { PhoneParts } from "@/components/forms/phone-input-group"
import { EMPTY_PHONE_PARTS } from "@/components/forms/phone-input-group"
import { events, type CalendarEvent } from "@/data/calendarEvents"
import {
  formatSectionDesktopPrice,
  formatSectionSeatAvailability,
} from "@/data/reservation"

export type AddReservationOption = {
  id: string
  label: string
}

export type AddReservationSectionOption = {
  id: string
  label: string
  price: string
  name: string
  seats: number
  available: number
}

export type AddReservationShowTimeOption = {
  id: string
  label: string
  time: string
}

export type AddReservationTotals = {
  subtotal: string
  serviceCharge: string
  discount: string
  taxes: string
  total: string
}

export type AddReservationCustomerDefaults = {
  lastName: string
  firstName: string
  phone: PhoneParts
  email: string
}

export type AddReservationDialogData = {
  eventId: string
  performer: string
  headerDateLabel: string
  showDate: string
  showTimeOptions: AddReservationShowTimeOption[]
  sectionOptions: AddReservationSectionOption[]
  originOptions: AddReservationOption[]
  promoOptions: AddReservationOption[]
  defaultShowTimeId: string
  defaultSectionId: string
  defaultOriginId: string
  defaultPromoId: string
  defaultParty: string
  defaultPasses: string
  dinner: boolean
  totals: AddReservationTotals
  customer: AddReservationCustomerDefaults
  notes: string
}

export type AddReservationFormValues = {
  showDate: string
  showTimeId: string
  sectionId: string
  originId: string
  party: string
  promoId: string
  passes: string
  dinner: boolean
  totals: AddReservationTotals
  customer: AddReservationCustomerDefaults
  searchType: "customer" | "business"
  notes: string
}

function formatHeaderDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

function formatShowTimeLabel(event: CalendarEvent) {
  const time = event.time.replace(/(AM|PM)$/i, (match) => ` ${match}`)
  return `${time} ${event.performer}`
}

function formatSectionLabel(option: Omit<AddReservationSectionOption, "id" | "label">) {
  return `${formatSectionDesktopPrice(option.price)} ${option.name} ${formatSectionSeatAvailability(option.seats, option.available)}`
}

function getSectionOptions(event: CalendarEvent): AddReservationSectionOption[] {
  const capacity = event.seats.capacity
  const sold = event.seats.sold + event.seats.comp
  const available = Math.max(0, capacity - sold)

  const regular: AddReservationSectionOption = {
    id: "regular",
    price: "$12.00",
    name: "Regular",
    seats: capacity,
    available,
    label: "",
  }
  regular.label = formatSectionLabel(regular)

  const vip: AddReservationSectionOption = {
    id: "vip",
    price: "$25.00",
    name: "VIP",
    seats: Math.max(20, Math.round(capacity * 0.2)),
    available: Math.max(0, Math.round(available * 0.25)),
    label: "",
  }
  vip.label = formatSectionLabel(vip)

  return [regular, vip]
}

function getShowTimeOptions(event: CalendarEvent): AddReservationShowTimeOption[] {
  const eventDay = dayjs(event.start).format("YYYY-MM-DD")

  const sameDayEvents = events.filter(
    (candidate) =>
      candidate.location === event.location &&
      dayjs(candidate.start).format("YYYY-MM-DD") === eventDay &&
      !candidate.cancelled
  )

  const options = (sameDayEvents.length > 0 ? sameDayEvents : [event]).map((candidate) => ({
    id: String(candidate.id),
    time: candidate.time,
    label: formatShowTimeLabel(candidate),
  }))

  const hasCurrentEvent = options.some((option) => option.id === String(event.id))

  if (!hasCurrentEvent) {
    options.unshift({
      id: String(event.id),
      time: event.time,
      label: formatShowTimeLabel(event),
    })
  }

  return options
}

function getOriginOptions(): AddReservationOption[] {
  return [
    { id: "phone", label: "Phone-In" },
    { id: "walkup", label: "Walk-up" },
    { id: "web", label: "Web" },
  ]
}

function getPromoOptions(): AddReservationOption[] {
  return [
    { id: "none", label: "Select" },
    { id: "admit2", label: "Admit 2" },
    { id: "admit4", label: "Admit 4" },
    { id: "buy1get1", label: "Buy 1 Get 1" },
    { id: "comedy10", label: "COMEDY10" },
  ]
}

function getDefaultTotals(): AddReservationTotals {
  return {
    subtotal: "$0.00",
    serviceCharge: "$0.00",
    discount: "$0.00",
    taxes: "$0.00",
    total: "$0.00",
  }
}

export function createAddReservationFormValues(
  data: AddReservationDialogData
): AddReservationFormValues {
  return {
    showDate: data.showDate,
    showTimeId: data.defaultShowTimeId,
    sectionId: data.defaultSectionId,
    originId: data.defaultOriginId,
    party: data.defaultParty,
    promoId: data.defaultPromoId,
    passes: data.defaultPasses,
    dinner: data.dinner,
    totals: { ...data.totals },
    customer: { ...data.customer, phone: { ...data.customer.phone } },
    searchType: "customer",
    notes: data.notes,
  }
}

export function calculateAddReservationTotals(
  formValues: AddReservationFormValues,
  sectionOptions: AddReservationSectionOption[]
): AddReservationTotals {
  const section = sectionOptions.find((option) => option.id === formValues.sectionId)
  const party = Math.max(0, Number(formValues.party) || 0)
  const passes = Math.max(0, Number(formValues.passes) || 0)
  const unitPrice = Number(section?.price.replace(/[^0-9.]/g, "") || 0)
  const ticketCount = Math.max(party, passes)
  const subtotal = unitPrice * ticketCount
  const serviceCharge = subtotal > 0 ? 2 * ticketCount : 0
  const discount = formValues.promoId === "comedy10" ? subtotal * 0.1 : 0
  const taxable = Math.max(0, subtotal + serviceCharge - discount)
  const taxes = taxable * 0.08
  const total = taxable + taxes

  const formatMoney = (value: number) => `$${value.toFixed(2)}`

  return {
    subtotal: formatMoney(subtotal),
    serviceCharge: formatMoney(serviceCharge),
    discount: formatMoney(discount),
    taxes: formatMoney(taxes),
    total: formatMoney(total),
  }
}

export async function getAddReservationDialogData(
  event: CalendarEvent
): Promise<AddReservationDialogData> {
  await new Promise((resolve) => window.setTimeout(resolve, 200))

  const showTimeOptions = getShowTimeOptions(event)
  const sectionOptions = getSectionOptions(event)

  return {
    eventId: event.id,
    performer: event.performer,
    headerDateLabel: formatHeaderDate(event.start),
    showDate: dayjs(event.start).format("YYYY-MM-DD"),
    showTimeOptions,
    sectionOptions,
    originOptions: getOriginOptions(),
    promoOptions: getPromoOptions(),
    defaultShowTimeId: String(event.id),
    defaultSectionId: sectionOptions[0]?.id ?? "regular",
    defaultOriginId: "phone",
    defaultPromoId: "none",
    defaultParty: "0",
    defaultPasses: "1",
    dinner: false,
    totals: getDefaultTotals(),
    customer: {
      lastName: "",
      firstName: "",
      phone: { ...EMPTY_PHONE_PARTS },
      email: "",
    },
    notes: "",
  }
}

