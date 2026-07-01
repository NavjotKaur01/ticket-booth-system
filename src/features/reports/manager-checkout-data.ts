import type { ManagerCheckoutApiShow } from "@/features/reports/manager-checkout-view"

export type ManagerCheckoutPaymentBucket = {
  cash: number
  amex: number
  discover: number
  mastercard: number
  visa: number
  giftCard: number
  giftCert: number
  webGiftCert: number
  other: number
  subTotal: number
  total: number
}

export type ManagerCheckoutPromoRow = {
  promo: string
  party: number
  seated: number
  paid: number
  comp: number
  disc: number
  scanned: number
  scanPaid: number
  scanComp: number
  scanDisc: number
}

export type ManagerCheckoutPromoSourceRow = {
  phoneIn: number
  walkup: number
  web: number
}

export type ManagerCheckoutOriginRow = {
  origin: string
  party: number
  seated: number
  paid: number
}

export type ManagerCheckoutShowSection = {
  section: string
  party: number
  totalAmount: number
}

export type ManagerCheckoutWebGiftCertRow = {
  date: string
  number: number
  amount: number
}

export type ManagerCheckoutWebGiftCertPaymentRow = {
  date: string
  amex: number
  discover: number
  mastercard: number
  visa: number
  total: number
}

export type ManagerCheckoutShowDocument = {
  showId: string
  location: string
  date: string
  time: string
  comic: string
  booked: number
  preSeated: number
  strTicketPrice: string
  cashDrawer: ManagerCheckoutPaymentBucket
  refund: ManagerCheckoutPaymentBucket
  pos: ManagerCheckoutPaymentBucket
  posRefund: ManagerCheckoutPaymentBucket
  web: ManagerCheckoutPaymentBucket
  webRefund: ManagerCheckoutPaymentBucket
  columnTotals: Omit<ManagerCheckoutPaymentBucket, "subTotal" | "total">
  subTotal: number
  refundTotal: number
  refundTotal2: number
  webRefundTotal: number
  totalCash: number
  saleTax: number
  netSales: number
  fees: number
  revenue: number
  promos: ManagerCheckoutPromoRow[]
  promoSources: ManagerCheckoutPromoSourceRow[]
  sumParty: number
  sumCheckedIn: number
  sumPaid: number
  sumComp: number
  sumDisc: number
  sumScanned: number
  sumScanPaid: number
  sumScanComp: number
  sumScanDisc: number
  sumPhoneIn: number
  sumWalkup: number
  sumWeb: number
  origins: ManagerCheckoutOriginRow[]
  allPartySum: number
  allSeatedSum: number
  allPaidSum: number
  showSections: ManagerCheckoutShowSection[]
  webGiftCertificateList: ManagerCheckoutWebGiftCertRow[]
  webGiftCertificatePaymentList: ManagerCheckoutWebGiftCertPaymentRow[]
}

export type ManagerCheckoutGiftCertApiRow = {
  CreatedDate?: string
  GiftCertificateCount?: number
  Amount?: number
  CCType?: string
}

type PaymentEntry = { Amount?: number; CCType?: string; PymtType?: string }

function emptyBucket(): ManagerCheckoutPaymentBucket {
  return {
    cash: 0,
    amex: 0,
    discover: 0,
    mastercard: 0,
    visa: 0,
    giftCard: 0,
    giftCert: 0,
    webGiftCert: 0,
    other: 0,
    subTotal: 0,
    total: 0,
  }
}

function n(value: unknown): number {
  const num = typeof value === "number" ? value : parseFloat(String(value ?? "0"))
  return Number.isFinite(num) ? num : 0
}

function applyDesktopPayments(
  payments: PaymentEntry[],
  bucket: ManagerCheckoutPaymentBucket,
  trackTotal = true
) {
  for (const item of payments) {
    const amount = n(item.Amount)
    let matched = false
    const ccType = String(item.CCType ?? "").toLowerCase()

    switch (ccType) {
      case "visa":
        bucket.visa = amount
        bucket.subTotal += amount
        if (trackTotal) bucket.total += amount
        matched = true
        break
      case "mastercard":
        bucket.mastercard = amount
        bucket.subTotal += amount
        if (trackTotal) bucket.total += amount
        matched = true
        break
      case "american express":
        bucket.amex = amount
        bucket.subTotal += amount
        if (trackTotal) bucket.total += amount
        matched = true
        break
      case "discover":
        bucket.discover = amount
        bucket.subTotal += amount
        if (trackTotal) bucket.total += amount
        matched = true
        break
      default:
        break
    }

    if (matched) continue

    switch (String(item.PymtType ?? "").toLowerCase()) {
      case "cash":
        bucket.cash = amount
        bucket.subTotal += amount
        if (trackTotal) bucket.total += amount
        break
      case "gift card":
        bucket.giftCard = amount
        bucket.subTotal += amount
        if (trackTotal) bucket.total += amount
        break
      case "gift certificate":
        bucket.giftCert = amount
        bucket.subTotal += amount
        if (trackTotal) bucket.total += amount
        break
      case "web gift cert":
        bucket.webGiftCert = amount
        bucket.subTotal += amount
        if (trackTotal) bucket.total += amount
        break
      default:
        bucket.other = amount
        bucket.subTotal += amount
        if (trackTotal) bucket.total += amount
        break
    }
  }
}

function formatTicketPrices(prices: (number | string)[] | undefined): string {
  if (!prices?.length) return ""
  return prices.map((price) => `$${price}`).join(",")
}

function buildPromoRows(show: ManagerCheckoutApiShow): ManagerCheckoutPromoRow[] {
  return (show.FillPromoList ?? []).map((promo) => ({
    promo: String(promo.Promo ?? ""),
    party: n(promo.PartyNo),
    seated: n(promo.CheckedIn),
    paid: n(promo.CheckInPaid),
    comp: n(promo.CheckInComp),
    disc: n(promo.CheckInDisc),
    scanned: n(promo.ScannerIn),
    scanPaid: n(promo.ScannerInPaid),
    scanComp: n(promo.ScannerInComp),
    scanDisc: n(promo.ScannerInDisc),
  }))
}

function buildPromoSourceRows(show: ManagerCheckoutApiShow, promos: ManagerCheckoutPromoRow[]) {
  const sources = show.PromoSourceList ?? []
  return promos.map((promo) => {
    const filtered = sources.filter((entry) => entry.Promo?.trim() === promo.promo.trim())
    let phoneIn = 0
    let walkup = 0
    let web = 0
    for (const entry of filtered) {
      const resource = String(entry.Ressource ?? "").trim().toUpperCase()
      if (resource === "SRC01") phoneIn = n(entry.SourceParty)
      if (resource === "SRC02") walkup = n(entry.SourceParty)
      if (resource === "SRC03") web = n(entry.SourceParty)
    }
    return { phoneIn, walkup, web }
  })
}

function buildOriginRows(show: ManagerCheckoutApiShow): ManagerCheckoutOriginRow[] {
  const raw =
    (show as ManagerCheckoutApiShow & { OriginShowList?: ManagerCheckoutApiShow["OriginSourceList"] })
      .OriginShowList ??
    show.OriginSourceList ??
    []

  const rows: ManagerCheckoutOriginRow[] = []
  for (const entry of raw) {
    const origin = String(entry.Origin ?? "").trim()
    if (!origin) continue
    rows.push({
      origin,
      party: n(entry.Party),
      seated: n(entry.Seated),
      paid: n(entry.Paid),
    })
  }
  return rows
}

function buildShowDocument(show: ManagerCheckoutApiShow): ManagerCheckoutShowDocument {
  const cashDrawer = emptyBucket()
  const refund = emptyBucket()
  const pos = emptyBucket()
  const posRefund = emptyBucket()
  const web = emptyBucket()
  const webRefund = emptyBucket()

  applyDesktopPayments(show.CashForCashDrawer ?? [], cashDrawer)
  applyDesktopPayments(show.CashFoRefund ?? [], refund)
  applyDesktopPayments(show.CashForPOS ?? [], pos)
  applyDesktopPayments(show.CashForWeb ?? [], web)
  applyDesktopPayments(show.CashForWebRefunds ?? [], webRefund, true)

  const promos = buildPromoRows(show)
  const promoSources = buildPromoSourceRows(show, promos)

  const sumParty = promos.reduce((sum, row) => sum + row.party, 0)
  const sumCheckedIn = promos.reduce((sum, row) => sum + row.seated, 0)
  const sumPaid = promos.reduce((sum, row) => sum + row.paid, 0)
  const sumComp = promos.reduce((sum, row) => sum + row.comp, 0)
  const sumDisc = promos.reduce((sum, row) => sum + row.disc, 0)
  const sumScanned = promos.reduce((sum, row) => sum + row.scanned, 0)
  const sumScanPaid = promos.reduce((sum, row) => sum + row.scanPaid, 0)
  const sumScanComp = promos.reduce((sum, row) => sum + row.scanComp, 0)
  const sumScanDisc = promos.reduce((sum, row) => sum + row.scanDisc, 0)
  const sumPhoneIn = promoSources.reduce((sum, row) => sum + row.phoneIn, 0)
  const sumWalkup = promoSources.reduce((sum, row) => sum + row.walkup, 0)
  const sumWeb = promoSources.reduce((sum, row) => sum + row.web, 0)

  const origins = buildOriginRows(show)
  const allPartySum = origins.reduce((sum, row) => sum + row.party, 0)
  const allSeatedSum = origins.reduce((sum, row) => sum + row.seated, 0)
  const allPaidSum = origins.reduce((sum, row) => sum + row.paid, 0)

  const showSections = (show.BookedShowSectionList ?? []).map((section) => ({
    section: String(section.ShowSection ?? ""),
    party: n(section.PartyNo),
    totalAmount: n(section.TotalAmount),
  }))

  const refundTotal = cashDrawer.subTotal + refund.subTotal
  const refundTotal2 = pos.subTotal + posRefund.subTotal
  const webRefundTotal = web.subTotal + webRefund.subTotal
  const totalCash = refundTotal + refundTotal2 + webRefundTotal
  const saleTax = n(show.SaleTax)
  const fees = n(show.Fee)
  const netSales = totalCash - saleTax
  const revenue = netSales - fees

  const columnTotals = {
    cash:
      cashDrawer.cash +
      refund.cash +
      pos.cash +
      posRefund.cash +
      web.cash +
      webRefund.cash,
    amex:
      cashDrawer.amex +
      refund.amex +
      pos.amex +
      posRefund.amex +
      web.amex +
      webRefund.amex,
    discover:
      cashDrawer.discover +
      refund.discover +
      pos.discover +
      posRefund.discover +
      web.discover +
      webRefund.discover,
    mastercard:
      cashDrawer.mastercard +
      refund.mastercard +
      pos.mastercard +
      posRefund.mastercard +
      web.mastercard +
      webRefund.mastercard,
    visa:
      cashDrawer.visa + refund.visa + pos.visa + posRefund.visa + web.visa + webRefund.visa,
    giftCard:
      cashDrawer.giftCard +
      refund.giftCard +
      pos.giftCard +
      posRefund.giftCard +
      web.giftCard +
      webRefund.giftCard,
    giftCert:
      cashDrawer.giftCert +
      refund.giftCert +
      pos.giftCert +
      posRefund.giftCert +
      web.giftCert +
      webRefund.giftCert,
    webGiftCert:
      cashDrawer.webGiftCert +
      refund.webGiftCert +
      pos.webGiftCert +
      posRefund.webGiftCert +
      web.webGiftCert +
      webRefund.webGiftCert,
    other:
      cashDrawer.other +
      refund.other +
      pos.other +
      posRefund.other +
      web.other +
      webRefund.other,
  }

  const subTotal =
    cashDrawer.subTotal +
    refund.subTotal +
    pos.subTotal +
    posRefund.subTotal +
    web.subTotal +
    webRefund.subTotal

  return {
    showId: String(show.ShowId ?? ""),
    location: String(show.Location ?? ""),
    date: String(show.DateStr ?? ""),
    time: String(show.TimeStr ?? ""),
    comic: String(show.Comic ?? ""),
    booked: n(show.Booked),
    preSeated: n(show.PreSeated),
    strTicketPrice: formatTicketPrices(show.TicketPrice),
    cashDrawer,
    refund,
    pos,
    posRefund,
    web,
    webRefund,
    columnTotals,
    subTotal,
    refundTotal,
    refundTotal2,
    webRefundTotal,
    totalCash,
    saleTax,
    netSales,
    fees,
    revenue,
    promos,
    promoSources,
    sumParty,
    sumCheckedIn,
    sumPaid,
    sumComp,
    sumDisc,
    sumScanned,
    sumScanPaid,
    sumScanComp,
    sumScanDisc,
    sumPhoneIn,
    sumWalkup,
    sumWeb,
    origins,
    allPartySum,
    allSeatedSum,
    allPaidSum,
    showSections,
    webGiftCertificateList: [],
    webGiftCertificatePaymentList: [],
  }
}

function normalizeCardType(ccType: string): "amex" | "discover" | "visa" | "mastercard" | null {
  const value = ccType.trim().toUpperCase()
  if (value === "AMERICAN EXPRESS" || value === "AMX" || value === "AMEX") return "amex"
  if (value === "DISCOVER") return "discover"
  if (value === "VISA") return "visa"
  if (value === "MASTERCARD" || value === "MC") return "mastercard"
  return null
}

export function mapWebGiftCertificateList(
  rows: ManagerCheckoutGiftCertApiRow[] | undefined
): ManagerCheckoutWebGiftCertRow[] {
  return (rows ?? []).map((row) => ({
    date: String(row.CreatedDate ?? ""),
    number: n(row.GiftCertificateCount),
    amount: n(row.Amount),
  }))
}

export function mapWebGiftCertificatePayments(
  rows: ManagerCheckoutGiftCertApiRow[] | undefined
): ManagerCheckoutWebGiftCertPaymentRow[] {
  const grouped = new Map<string, ManagerCheckoutWebGiftCertPaymentRow>()

  for (const row of rows ?? []) {
    const date = String(row.CreatedDate ?? "")
    const key = date
    const current =
      grouped.get(key) ??
      ({
        date,
        amex: 0,
        discover: 0,
        mastercard: 0,
        visa: 0,
        total: 0,
      } satisfies ManagerCheckoutWebGiftCertPaymentRow)

    const amount = n(row.Amount)
    const card = normalizeCardType(String(row.CCType ?? ""))
    if (card === "amex") current.amex += amount
    else if (card === "discover") current.discover += amount
    else if (card === "visa") current.visa += amount
    else if (card === "mastercard") current.mastercard += amount
    current.total += amount
    grouped.set(key, current)
  }

  return Array.from(grouped.values())
}

export function buildManagerCheckoutDocuments(
  rawData: unknown,
  options: {
    giftCertificateList?: ManagerCheckoutGiftCertApiRow[]
    giftCertificatePayments?: ManagerCheckoutGiftCertApiRow[]
  } = {}
): ManagerCheckoutShowDocument[] {
  const shows = Array.isArray(rawData) ? (rawData as ManagerCheckoutApiShow[]) : []
  const documents = shows.map((show) => buildShowDocument(show))

  if (documents.length > 0) {
    const last = documents[documents.length - 1]
    last.webGiftCertificateList = mapWebGiftCertificateList(options.giftCertificateList)
    last.webGiftCertificatePaymentList = mapWebGiftCertificatePayments(
      options.giftCertificatePayments
    )
  }

  return documents
}

export function formatDesktopMoney(value: number, blankZero = false): string {
  if (!value && blankZero) return ""
  return value.toFixed(2)
}
