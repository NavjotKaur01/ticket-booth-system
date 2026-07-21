import type { ApiPaymentDetail } from '@/types/api/reservation-payment-actions'

function readValue(record: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    const value = record[key]
    if (value != null && value !== '') {
      return value
    }
  }

  const normalized = new Set(keys.map((key) => key.toLowerCase()))
  for (const [key, value] of Object.entries(record)) {
    if (normalized.has(key.toLowerCase()) && value != null && value !== '') {
      return value
    }
  }

  return undefined
}

function readString(record: Record<string, unknown>, keys: string[]): string {
  const value = readValue(record, keys)
  if (value == null) {
    return ''
  }
  return String(value).trim()
}

function readNumber(record: Record<string, unknown>, keys: string[]): number | null {
  const value = readValue(record, keys)
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

/** Normalizes GetPaymentById (desktop PaymentModel) into our subset. */
export function mapPaymentDetail(response: unknown): ApiPaymentDetail {
  const record = (response && typeof response === 'object'
    ? (response as Record<string, unknown>)
    : {}) as Record<string, unknown>

  return {
    PaymentID: readString(record, ['PaymentID', 'paymentID', 'paymentId']),
    ReservationID: readString(record, ['ReservationID', 'reservationID', 'reservationId']) || null,
    CustomerID: readString(record, ['CustomerID', 'customerID', 'customerId']) || null,
    PymtStatus: readString(record, ['PymtStatus', 'pymtStatus']) || null,
    PymtType: readString(record, ['PymtType', 'pymtType']) || null,
    // GetPaymentById returns raw DB columns: the type/status CODES live in
    // PymtType / PymtStatus (e.g. "PYMT05", "PSTAT01"), while PaymentTypeCode /
    // PaymentStatusCode come back null. Desktop reads PymtType / PymtStatus, so
    // fall back to them here.
    PaymentTypeCode:
      readString(record, ['PaymentTypeCode', 'paymentTypeCode']) ||
      readString(record, ['PymtType', 'pymtType']) ||
      null,
    PaymentStatusCode:
      readString(record, ['PaymentStatusCode', 'paymentStatusCode']) ||
      readString(record, ['PymtStatus', 'pymtStatus']) ||
      null,
    PromoCode: readString(record, ['PromoCode', 'promoCode']) || null,
    CCType: readString(record, ['CCType', 'ccType', 'cCType']) || null,
    CCTypeCode: readString(record, ['CCTypeCode', 'ccTypeCode', 'cCTypeCode']) || null,
    CardNum: readString(record, ['CardNum', 'cardNum']) || null,
    DecryptCardNum: readString(record, ['DecryptCardNum', 'decryptCardNum']) || null,
    ExpMo: readString(record, ['ExpMo', 'expMo', 'ExpMonth', 'expMonth']) || null,
    ExpYr: readString(record, ['ExpYr', 'expYr', 'ExpYear', 'expYear']) || null,
    Auth: readString(record, ['Auth', 'auth']) || null,
    PNREF: readString(record, ['PNREF', 'Pnref', 'pnref']) || null,
    Amount: readNumber(record, ['Amount', 'amount']),
    SVC: readNumber(record, ['SVC', 'Svc', 'svc']),
    LastName: readString(record, ['LastName', 'lastName']) || null,
    FirstName: readString(record, ['FirstName', 'firstName']) || null,
  }
}
