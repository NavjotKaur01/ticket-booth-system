import type { ApiSystemDefaultItem } from "@/types/api/system-defaults"

function normalizeDefaultText(value: string | null | undefined) {
  return value?.trim() ?? ""
}

function findSystemDefault(
  defaults: ApiSystemDefaultItem[],
  screen: string,
  field: string
) {
  const normalizedScreen = screen.toLowerCase()
  const normalizedField = field.toLowerCase()

  return defaults.find((item) => {
    return (
      normalizeDefaultText(item.Screen).toLowerCase() === normalizedScreen &&
      normalizeDefaultText(item.Field).toLowerCase() === normalizedField
    )
  })
}

function readYesNoNavVisible(
  defaults: ApiSystemDefaultItem[],
  screen: string,
  field: string,
  enabledWhenMissing: boolean
) {
  const match = findSystemDefault(defaults, screen, field)
  if (!match) {
    return enabledWhenMissing
  }

  const value = normalizeDefaultText(match.DefValue).toUpperCase()
  if (!value) {
    return enabledWhenMissing
  }

  return value !== "N"
}

/** Desktop MainWindow.cbTicketbooth_DropDownOpened — GiftCard/lblGiftCard. */
export function readGiftCardNavVisible(defaults: ApiSystemDefaultItem[]) {
  return readYesNoNavVisible(defaults, "GiftCard", "lblGiftCard", true)
}

/** GiftCert/cmdGiftCardRef — web gift certificate module (opt-in per venue). */
export function readGiftCertificateNavVisible(defaults: ApiSystemDefaultItem[]) {
  return readYesNoNavVisible(defaults, "GiftCert", "cmdGiftCardRef", false)
}
