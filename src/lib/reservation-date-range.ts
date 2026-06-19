/** ISO date input value (yyyy-mm-dd) to MM/dd/yyyy for ClubMan reservation APIs. */
function toApiDatePart(isoDate: string) {
  const [year, month, day] = isoDate.split("-")
  if (!year || !month || !day) {
    return isoDate
  }

  return `${month}/${day}/${year}`
}

/** Selected calendar day from midnight through end of day. */
export function buildReservationDayRange(isoDate: string) {
  const datePart = toApiDatePart(isoDate)

  return {
    startDate: `${datePart} 12:00:00 AM`,
    endDate: `${datePart} 11:59:59 PM`,
  }
}
