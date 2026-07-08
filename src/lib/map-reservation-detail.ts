import type {
  ReservationDetail,
  ReservationDetailPaymentItem,
} from '@/types/api/reservation-detail'

function readRecordValue(
  record: Record<string, unknown>,
  keys: string[]
): unknown {
  for (const key of keys) {
    const value = record[key]
    if (value != null && value !== '') {
      return value
    }
  }

  const normalizedKeys = new Set(keys.map((key) => key.toLowerCase()))
  for (const [key, value] of Object.entries(record)) {
    if (normalizedKeys.has(key.toLowerCase()) && value != null && value !== '') {
      return value
    }
  }

  return undefined
}

function readString(record: Record<string, unknown>, keys: string[]) {
  const value = readRecordValue(record, keys)
  if (typeof value === 'string') {
    return value.trim()
  }

  if (value == null) {
    return ''
  }

  return String(value).trim()
}

function readNumber(record: Record<string, unknown>, keys: string[]) {
  const value = readRecordValue(record, keys)
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

function readBoolean(record: Record<string, unknown>, keys: string[]) {
  const value = readRecordValue(record, keys)
  return value === true
}

function resolveAuthAndPnref(
  record: Record<string, unknown>,
  paymentId: string
) {
  const auth = readString(record, ['Auth', 'auth', 'AUTH', 'Authorization'])
  const pnref = readString(record, ['PNREF', 'Pnref', 'pnref', 'PnRef', 'PNRef'])

  if (auth && pnref) {
    return { auth, pnref }
  }

  if (auth) {
    return { auth, pnref: pnref || auth }
  }

  if (pnref) {
    return { auth: pnref, pnref }
  }

  if (paymentId) {
    return { auth: paymentId, pnref: paymentId }
  }

  return { auth: '', pnref: '' }
}

export function mapReservationDetailPayment(
  raw: unknown
): ReservationDetailPaymentItem {
  if (!raw || typeof raw !== 'object') {
    return { PaymentID: '' }
  }

  const record = raw as Record<string, unknown>
  const paymentId = readString(record, ['PaymentID', 'paymentID', 'paymentId'])
  const { auth, pnref } = resolveAuthAndPnref(record, paymentId)

  return {
    PaymentID: paymentId,
    ReservationID: readString(record, ['ReservationID', 'reservationID', 'reservationId']) || null,
    CustomerID: readString(record, ['CustomerID', 'customerID', 'customerId']) || null,
    PymtStatus: readString(record, ['PymtStatus', 'pymtStatus']) || null,
    PymtType: readString(record, ['PymtType', 'pymtType']) || null,
    CCType: readString(record, ['CCType', 'ccType', 'cCType']) || null,
    CardNum: readString(record, ['CardNum', 'cardNum']) || null,
    Amount: readNumber(record, ['Amount', 'amount']),
    Auth: auth || null,
    PNREF: pnref || null,
    Split: readString(record, ['Split', 'split']) || null,
    LastName: readString(record, ['LastName', 'lastName']) || null,
    FirstName: readString(record, ['FirstName', 'firstName']) || null,
    PaymentTypeCode: readString(record, ['PaymentTypeCode', 'paymentTypeCode']) || null,
    PaymentStatusCode:
      readString(record, ['PaymentStatusCode', 'paymentStatusCode']) || null,
    IsSelected: readBoolean(record, ['IsSelected', 'isSelected']),
  }
}

export function mapReservationDetail(response: unknown): ReservationDetail {
  if (!response || typeof response !== 'object') {
    return {}
  }

  const record = response as Record<string, unknown>
  const paymentListRaw = readRecordValue(record, [
    'PaymentList',
    'paymentList',
    'Payments',
    'payments',
  ])

  return {
    ReservationID: readString(record, ['ReservationID', 'reservationID', 'reservationId']) || undefined,
    CustomerID: readString(record, ['CustomerID', 'customerID', 'customerId']) || null,
    ShowId: readString(record, ['ShowId', 'ShowID', 'showId', 'showID']) || null,
    ShowDetID: readString(record, ['ShowDetID', 'showDetID', 'showDetId']) || null,
    PartyNo: readNumber(record, ['PartyNo', 'partyNo']),
    OrigPartyNo: readNumber(record, ['OrigPartyNo', 'origPartyNo']),
    CheckedIn: readNumber(record, ['CheckedIn', 'checkedIn']),
    ResSec: readString(record, ['ResSec', 'resSec']) || null,
    Sources: readString(record, ['Sources', 'sources']) || null,
    ResSource: readString(record, ['ResSource', 'resSource']) || null,
    Promo: readString(record, ['Promo', 'promo']) || null,
    NumPasses: readNumber(record, ['NumPasses', 'numPasses']),
    SubTotal: readNumber(record, ['SubTotal', 'SubTot', 'subTotal', 'subTot']),
    SVC: readNumber(record, ['SVC', 'Svc', 'svc']),
    Discount: readNumber(record, ['Discount', 'discount']),
    SalesTax: readNumber(record, ['SalesTax', 'salesTax']),
    Total: readNumber(record, ['Total', 'total']),
    Dinner: readString(record, ['Dinner', 'dinner']) || null,
    VIP: readString(record, ['VIP', 'vip']) || null,
    ResPayments: readNumber(record, ['ResPayments', 'resPayments', 'ResPymts', 'resPymts']),
    CustFirstName: readString(record, ['CustFirstName', 'custFirstName']) || null,
    CustLastName: readString(record, ['CustLastName', 'custLastName']) || null,
    busName: readString(record, ['busName', 'BusName']) || null,
    busFirstName: readString(record, ['busFirstName', 'BusFirstName']) || null,
    busLastName: readString(record, ['busLastName', 'BusLastName']) || null,
    Note: readString(record, ['Note', 'note']) || null,
    ReservationNotes:
      readString(record, ['ReservationNotes', 'reservationNotes']) || null,
    PaymentList: Array.isArray(paymentListRaw)
      ? paymentListRaw.map(mapReservationDetailPayment)
      : [],
  }
}
