/**
 * Desktop CheckInVM.BookFixedPartyTables — fixed party size for booth/table sections.
 * Returns null when valid; otherwise the alert message and required party.
 */
export function validateBookFixedPartyTables({
  showSec,
  party,
}: {
  showSec: string | null | undefined
  party: number
}): { message: string; requiredParty: number } | null {
  const code = showSec?.trim().toUpperCase() ?? ""
  if (!code) {
    return null
  }

  if (["SECT12", "SECT16", "SECT15", "SECT05"].includes(code)) {
    if (party !== 2) {
      return {
        message: "Party must be 2 for selected section",
        requiredParty: 2,
      }
    }
  } else if (["SECT13", "SECT17"].includes(code)) {
    if (party !== 4) {
      return {
        message: "Party must be 4 for selected section",
        requiredParty: 4,
      }
    }
  } else if (code === "SECT10") {
    if (party !== 6) {
      return {
        message: "Party must be 6 for selected section",
        requiredParty: 6,
      }
    }
  }

  return null
}

/** Desktop SaveSalesTransaction: show date cannot be prior to today. */
export function isExpressShowDateAllowed(showDate: string | undefined) {
  if (!showDate?.trim()) {
    return true
  }

  const show = new Date(`${showDate}T00:00:00`)
  if (Number.isNaN(show.getTime())) {
    return false
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return show.getTime() >= today.getTime()
}
