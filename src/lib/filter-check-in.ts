import type { CheckInRecord } from "@/types/check-in"

type CheckInSearchCriteria = {
  lastName: string
  firstName: string
  ccLast4: string
  tableNo: string
  phoneNo: string
}

// Client-side check-in table filter by name and table (ccLast4/phone reserved for API).
export function filterCheckInRecords(
  records: CheckInRecord[],
  criteria: CheckInSearchCriteria
) {
  const lastName = criteria.lastName.trim().toLowerCase()
  const firstName = criteria.firstName.trim().toLowerCase()
  const tableNo = criteria.tableNo.trim().toLowerCase()
  const phoneNo = criteria.phoneNo.trim().toLowerCase()

  // No criteria entered — show all records for the current show
  if (!lastName && !firstName && !tableNo && !phoneNo && !criteria.ccLast4.trim()) {
    return records
  }

  return records.filter((record) => {
    if (lastName && !record.lastName.toLowerCase().includes(lastName)) return false
    if (firstName && !record.firstName.toLowerCase().includes(firstName)) return false
    if (tableNo && !record.tables.toLowerCase().includes(tableNo)) return false
    return true
  })
}
