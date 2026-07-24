import { useMemo } from 'react'

import { parseReservationMoney } from '@/lib/calculate-reservation-totals'
import type { ReservationDetailPaymentItem } from '@/types/api/reservation-detail'
import type { ReservationPrintProperties } from '@/types/api/reservation-print'
import type { Reservation } from '@/types/reservation'
import type { ReservationTransactionRow } from '@/types/reservation-transaction'

function maskCardNumber(cardNum: string | null | undefined) {
  if (!cardNum) {
    return ''
  }

  const digits = cardNum.trim()
  return digits.length <= 4 ? `************${digits}` : digits
}

/**
 * Payment/transaction ledger rows for a reservation. `PaymentList` on
 * GetReservationDetailById (already used elsewhere, e.g. signature-print
 * validation) is a real per-payment ledger with Auth/PNREF/Split — so this is
 * wired to real data when available. Falls back to a single best-effort row
 * derived from the reservation + GetReservationPrintProperties only when the
 * ledger is empty/unavailable.
 */
export function useReservationTransactions({
  reservation,
  paymentList,
  printProperties
}: {
  reservation: Reservation | null
  paymentList?: ReservationDetailPaymentItem[] | null
  printProperties?: ReservationPrintProperties | null
}): ReservationTransactionRow[] {
  return useMemo(() => {
    if (!reservation) {
      return []
    }

   

    if (paymentList && paymentList.length > 0) {
      return paymentList.map((payment, index) => ({
        id: payment.PaymentID || `${reservation.id}-${index}`,
        // Desktop Transactions grid Transaction column binds PymtStatus.
        transaction: payment.PymtStatus?.trim() || '',
        lastName: payment.LastName ?? reservation.lastName,
        firstName: payment.FirstName ?? reservation.firstName,
        payment: payment.PymtType ?? '',
        cardType: payment.CCType ?? '',
        cardNumber: maskCardNumber(payment.CardNum),
        amount: payment.Amount ?? 0,
        authorization: payment.Auth ?? '',
        pnref: payment.PNREF ?? '',
        paymentTypeCode: payment.PaymentTypeCode ?? '',
        // API Split flag: "X" = split payment → display Y; null/empty → N
        isSplit: payment.Split?.trim().toUpperCase() === 'X',
        dueAmt: payment?.dueAmt ?? 0,
        billAddr: payment.BillAddr ?? '',
        billZip: payment.BillZip ?? '',
        expYr: payment.ExpYr ?? '',
        expMo: payment.ExpMo ?? ''
      }))
    }

    const amount = parseReservationMoney(reservation.paid)

    if (amount <= 0) {
      return []
    }

    return [
      {
        id: reservation.id,
        transaction: 'Payment',
        lastName: reservation.lastName,
        firstName: reservation.firstName,
        payment: printProperties?.PaymentType ?? '',
        cardType: printProperties?.CardType ?? '',
        cardNumber: maskCardNumber(printProperties?.CardNum),
        amount,
        authorization: printProperties?.Auth ?? '',
        pnref: printProperties?.PNREF ?? '',
        // Print-properties fallback has no code; keep empty (hold detection also
        // checks the display name).
        paymentTypeCode: '',
        isSplit: false,
        dueAmt: printProperties?.DueAmount ?? 0,
        billAddr: '',
        billZip: '',
        expYr: '',
        expMo: ''
      }
    ]
  }, [paymentList, printProperties, reservation])
}
