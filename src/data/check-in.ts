import type { CheckInCounts, CheckInRecord } from "@/types/check-in"

// Static check-in mock data — replace with API when backend is wired up.

/** Live seat counts for the currently selected show. */
export const checkInCounts: CheckInCounts = {
  seats: 200,
  reservation: 1,
  available: 199,
  seated: 0,
  scanned: 0,
}

/** Guest rows shown in the check-in table for the active show. */
export const checkInRecords: CheckInRecord[] = [
  {
    id: "1",
    status: "paid-not-seated",
    lastName: "Rider",
    firstName: "Max",
    section: "Regular",
    email: "sandeepchilana467@gmail.com",
    source: "Web",
    tables: "",
    notes: "",
    promo: "",
    din: "N",
    qty: 1,
    seatNo: "",
    seated: 0,
    scanner: 0,
    total: "$11.50",
    paid: "$11.50",
    createdBy: "sandeepchilana4",
    createdDt: "6/18/2026 2:28:55 AM",
    lastUpdateDt: "",
    lastUpdateBy: "",
  },
]
