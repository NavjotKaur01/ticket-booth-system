import type { CheckInRecord } from "@/types/check-in"

type CheckInSearchCriteria = {
  lastName: string
  firstName: string
  ccLast4: string
  tableNo: string
  phoneNo: string
}

function includesNormalized(value: string, query: string) {
  if (!query) {
    return true
  }

  return value.toLowerCase().includes(query)
}

/**
 * Desktop SearchReservation — client-side AND contains filters.
 * Empty fields are ignored.
 */
export function filterCheckInRecords(
  records: CheckInRecord[],
  criteria: CheckInSearchCriteria
) {
  const lastName = criteria.lastName.trim().toLowerCase()
  const firstName = criteria.firstName.trim().toLowerCase()
  const tableNo = criteria.tableNo.trim().toLowerCase()
  const phoneNo = criteria.phoneNo.trim().toLowerCase()
  const ccLast4 = criteria.ccLast4.trim().toLowerCase()

  if (!lastName && !firstName && !tableNo && !phoneNo && !ccLast4) {
    return records
  }

  return records.filter((record) => {
    if (!includesNormalized(record.lastName, lastName)) return false
    if (!includesNormalized(record.firstName, firstName)) return false
    if (!includesNormalized(record.tables, tableNo)) return false
    if (!includesNormalized(record.phoneNo, phoneNo)) return false
    if (!includesNormalized(record.lastFourCardDigit, ccLast4)) return false
    return true
  })
}
