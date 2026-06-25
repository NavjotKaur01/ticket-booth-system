import type { ReservationSectionOption } from '@/types/reservation'

export function resolveReservationBooking ({
  sectionId,
  partyBySection,
  sections
}: {
  sectionId: string
  partyBySection: Record<string, number>
  sections: ReservationSectionOption[]
}) {
  const selectedSection =
    sections.find(option => option.id === sectionId) ?? null

  let partySize = sectionId ? partyBySection[sectionId] ?? 0 : 0
  let resolvedSection = selectedSection
  let resolvedSectionId = sectionId

  if (partySize <= 0) {
    const sectionWithParty = sections.find(
      option => (partyBySection[option.id] ?? 0) > 0
    )

    if (sectionWithParty) {
      resolvedSection = sectionWithParty
      resolvedSectionId = sectionWithParty.id
      partySize = partyBySection[sectionWithParty.id] ?? 0
    }
  }

  return {
    sectionId: resolvedSectionId,
    partySize,
    selectedSection: resolvedSection
  }
}
