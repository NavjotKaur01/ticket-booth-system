import type { CalendarEvent } from "@/types/calendar-event"

import type { CalendarSelectOption } from "../controls/CalendarSelectControl"

export type AdjustSeatsSectionRow = {
  id: string
  section: string
  price: string
  seats: string
  showOnWeb: boolean
}

export type AdjustSeatsSectionFormValues = {
  sectionId: string
  price: string
  seatCount: string
  showOnWeb: boolean
  hub: boolean
  showAppearing: boolean
}

export type AdjustSeatsDialogData = {
  eventId: string
  sectionOptions: CalendarSelectOption[]
  sections: AdjustSeatsSectionRow[]
  sectionForm: AdjustSeatsSectionFormValues
}

export type AdjustSeatsFormValues = {
  sections: AdjustSeatsSectionRow[]
  sectionForm: AdjustSeatsSectionFormValues
}

const SECTION_OPTIONS: CalendarSelectOption[] = [
  { value: "regular", label: "Regular" },
  { value: "vip", label: "VIP" },
  { value: "balcony", label: "Balcony" },
  { value: "front", label: "Front" },
  { value: "back", label: "Back" },
]

function createEmptySectionForm(): AdjustSeatsSectionFormValues {
  return {
    sectionId: "",
    price: "",
    seatCount: "",
    showOnWeb: true,
    hub: false,
    showAppearing: false,
  }
}

function getSectionLabel(sectionId: string, options: CalendarSelectOption[]) {
  return options.find((option) => option.value === sectionId)?.label ?? sectionId
}

export function createAdjustSeatsFormValues(
  data: AdjustSeatsDialogData
): AdjustSeatsFormValues {
  return {
    sections: data.sections,
    sectionForm: data.sectionForm,
  }
}

export function applySectionFormChange(
  current: AdjustSeatsSectionFormValues,
  field: keyof AdjustSeatsSectionFormValues,
  value: AdjustSeatsSectionFormValues[keyof AdjustSeatsSectionFormValues]
): AdjustSeatsSectionFormValues {
  return {
    ...current,
    [field]: value,
  }
}

export function resetSectionForm(): AdjustSeatsSectionFormValues {
  return createEmptySectionForm()
}

export function applySectionUpdate(
  current: AdjustSeatsFormValues,
  sectionOptions: CalendarSelectOption[]
): AdjustSeatsFormValues {
  const { sectionForm, sections } = current

  if (!sectionForm.sectionId.trim()) {
    return current
  }

  const sectionLabel = getSectionLabel(sectionForm.sectionId, sectionOptions)
  const existingIndex = sections.findIndex((row) => row.id === sectionForm.sectionId)
  const nextRow: AdjustSeatsSectionRow = {
    id: sectionForm.sectionId,
    section: sectionLabel,
    price: sectionForm.price || "0.00",
    seats: sectionForm.seatCount || "0",
    showOnWeb: sectionForm.showOnWeb,
  }

  if (existingIndex === -1) {
    return {
      sections: [...sections, nextRow],
      sectionForm: createEmptySectionForm(),
    }
  }

  const nextSections = [...sections]
  nextSections[existingIndex] = nextRow

  return {
    sections: nextSections,
    sectionForm: createEmptySectionForm(),
  }
}

export async function getAdjustSeatsDialogData(
  event: CalendarEvent
): Promise<AdjustSeatsDialogData> {
  await new Promise((resolve) => window.setTimeout(resolve, 150))

  void event

  return {
    eventId: event.id,
    sectionOptions: SECTION_OPTIONS,
    sections: [
      {
        id: "regular",
        section: "Regular",
        price: "10.00",
        seats: "0",
        showOnWeb: true,
      },
    ],
    sectionForm: createEmptySectionForm(),
  }
}

export async function saveAdjustSeats(
  eventId: string,
  values: AdjustSeatsFormValues
): Promise<void> {
  await new Promise((resolve) => window.setTimeout(resolve, 200))

  void eventId
  void values
}
