import { computeCheckInStatus } from "@/lib/compute-check-in-status"
import type { CheckInRecord } from "@/types/check-in"
import type { Reservation } from "@/types/reservation"

/** Maps a live reservation row into the Check-in table record shape. */
export function mapReservationToCheckInRecord(
  reservation: Reservation
): CheckInRecord {
  const totalAmount = reservation.totalAmount ?? 0
  const paidAmount = reservation.paidAmount ?? 0

  return {
    id: reservation.id,
    status: computeCheckInStatus({
      party: reservation.qty,
      checkedIn: reservation.seated,
      total: totalAmount,
      paid: paidAmount,
      promoPayments: reservation.promoPayments ?? 0,
    }),
    lastName: reservation.lastName,
    firstName: reservation.firstName,
    section: reservation.section,
    email: reservation.email,
    source: reservation.source,
    tables: reservation.tables,
    notes: reservation.notes,
    promo: reservation.promo,
    din: reservation.din,
    qty: reservation.qty,
    seatNo: reservation.seatNo,
    seated: reservation.seated,
    scanner: reservation.scanner,
    total: reservation.total,
    paid: reservation.paid,
    createdBy: reservation.createdBy,
    createdDt: reservation.createdDt,
    lastUpdateDt: reservation.lastUpdateDt,
    lastUpdateBy: reservation.lastUpdateBy,
    phoneNo: reservation.phoneNo,
    lastFourCardDigit: reservation.lastFourCardDigit ?? "",
    isCancelled: reservation.isCancelled,
    resStatus: reservation.resStatus,
    oldReservationId: reservation.oldReservationId ?? "",
  }
}

export function mapReservationsToCheckInRecords(
  reservations: Reservation[]
): CheckInRecord[] {
  return reservations.map(mapReservationToCheckInRecord)
}
