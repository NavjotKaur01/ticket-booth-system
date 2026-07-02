import type { MarketingFilterRecord } from "@/types/marketing-filter"

export function formatMarketingFilterName(row: MarketingFilterRecord) {
  return `${row.lastName} ${row.firstName}`.trim()
}

export function marketingFilterRecordToCustomer(row: MarketingFilterRecord) {
  const address = [row.address, row.address2].filter(Boolean).join(", ")
  const phoneNo = [row.phone, row.phone1, row.phone2].filter(Boolean).join(", ")

  return {
    id: row.id,
    lastName: row.lastName,
    firstName: row.firstName,
    email: row.email,
    password: "********",
    address,
    phoneNo,
    city: row.city,
    status: row.status || "N",
  }
}
