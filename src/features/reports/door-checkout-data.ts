import dayjs from "dayjs"

export type DoorCheckoutApiRow = {
  ShowId?: string
  Showdt?: string
  CreatedDate?: string
  ComicName?: string
  PymtType?: string
  CCType?: string
  PymtStatus?: string
  Total?: number
  /** Set when "Separate by users" is active */
  _userLabel?: string
}

export type CollapsedPay = { type: string; payments: number; refunds: number; total: number }

export type DoorCheckoutShowDetail = {
  showId: string
  showdt: string
  comicName: string
  paymentLines: { type: string; payments: number; refunds: number; total: number }[]
  totalPayments: number
  totalRefunds: number
  total: number
}

export type DoorCheckoutCardBucket = "cash" | "amex" | "discover" | "master" | "visa"

export type DoorCheckoutShowLine = {
  showLabel: string
  paymentType: string
  payments: number
  refunds: number
  total: number
}

function toNum(v: unknown): number {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? "0"))
  return Number.isFinite(n) ? n : 0
}

function normalizeCheckoutDate(value: string): string {
  if (!value) return "Unknown"
  const d = dayjs(value)
  return d.isValid() ? d.format("M/D/YYYY") : value
}

function formatCcLabel(cc: string): string {
  const key = cc.trim().toLowerCase()
  if (key === "mastercard") return "MasterCard"
  if (key === "americanexpress" || key === "american express") return "American Express"
  if (key === "visa") return "Visa"
  if (key === "discover") return "Discover"
  return cc.trim()
}

function resolvePaymentDisplayName(row: DoorCheckoutApiRow): string {
  const pymt = (row.PymtType ?? "").trim().toLowerCase()
  const cc = (row.CCType ?? "").trim().toLowerCase()

  if (pymt === "credit card payment" && cc) {
    return formatCcLabel(cc)
  }
  if (pymt === "cash" || cc === "cash") return "Cash"
  if (pymt === "gift card") return "Gift Card"
  if (pymt === "gift certificate") return "Gift Certificate"
  if (["visa", "mastercard", "discover", "americanexpress", "american express"].includes(cc)) {
    return formatCcLabel(cc)
  }
  if (row.PymtType?.trim()) {
    const raw = row.PymtType.trim()
    return raw.charAt(0).toUpperCase() + raw.slice(1)
  }
  if (row.CCType?.trim()) return formatCcLabel(row.CCType)
  return "Unknown"
}

export function isRefund(row: DoorCheckoutApiRow): boolean {
  return (row.PymtStatus ?? "").trim() === "PSTAT21" && (row.Total ?? 0) < 0
}

export function fmtAmount(v: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v)
}

export function normalizeDoorCheckoutRows(raw: unknown): DoorCheckoutApiRow[] {
  if (!Array.isArray(raw)) return []
  return (raw as Record<string, unknown>[]).map((row) => ({
    ShowId: String(row.ShowId ?? row.showid ?? ""),
    Showdt: String(row.Showdt ?? row.showdt ?? ""),
    CreatedDate: normalizeCheckoutDate(String(row.CreatedDate ?? row.createddate ?? row.CreatedDt ?? "")),
    ComicName: String(row.ComicName ?? row.comicname ?? ""),
    PymtType: String(row.PymtType ?? row.pymttype ?? ""),
    CCType: String(row.CCType ?? row.cctype ?? ""),
    PymtStatus: String(row.PymtStatus ?? row.pymtstatus ?? ""),
    Total: toNum(row.Total ?? row.total),
    _userLabel: row._userLabel != null ? String(row._userLabel) : undefined,
  }))
}

function showLinePaymentLabel(row: DoorCheckoutApiRow): string {
  const cc = row.CCType?.trim()
  if (cc) return cc
  return resolvePaymentDisplayName(row)
}

type PayDetail = {
  payCctype: string
  paymentType: string
  payPayments: number
  payRefund: number
}

function rowToPayDetail(row: DoorCheckoutApiRow): PayDetail {
  const total = row.Total ?? 0
  const detail: PayDetail = {
    payCctype: row.CCType ?? "",
    paymentType: row.PymtType ?? "",
    payPayments: 0,
    payRefund: 0,
  }
  if (isRefund(row)) detail.payRefund = total
  else detail.payPayments = total
  return detail
}

function addToPay(target: CollapsedPay, item: PayDetail) {
  target.payments += item.payPayments
  target.refunds += item.payRefund
  target.total = target.payments + target.refunds
}

function collapseMainPayments(details: PayDetail[]): CollapsedPay[] {
  const cash = { type: "", payments: 0, refunds: 0, total: 0 }
  const visa = { type: "visa", payments: 0, refunds: 0, total: 0 }
  const master = { type: "mastercard", payments: 0, refunds: 0, total: 0 }
  const discover = { type: "discover", payments: 0, refunds: 0, total: 0 }
  const amex = { type: "americanexpress", payments: 0, refunds: 0, total: 0 }
  const giftCard = { type: "Gift Card", payments: 0, refunds: 0, total: 0 }
  const giftCert = { type: "Gift Certificate", payments: 0, refunds: 0, total: 0 }

  for (const item of details) {
    const pymt = item.paymentType.toLowerCase()
    const cc = item.payCctype.toLowerCase()

    switch (pymt) {
      case "cash":
        if (!cash.type) cash.type = item.payCctype || "Cash"
        addToPay(cash, item)
        break
      case "credit card payment":
        switch (cc) {
          case "visa":
            addToPay(visa, item)
            break
          case "mastercard":
            addToPay(master, item)
            break
          case "discover":
            addToPay(discover, item)
            break
          case "americanexpress":
          case "american express":
            addToPay(amex, item)
            break
        }
        break
      case "gift card":
        addToPay(giftCard, item)
        break
      case "gift certificate":
        addToPay(giftCert, item)
        break
    }
  }

  return [cash, master, visa, discover, amex, giftCert, giftCard].filter(
    (r) => r.total !== 0 || r.payments !== 0 || r.refunds !== 0
  )
}

function collapseUserPayments(details: PayDetail[]): CollapsedPay[] {
  const cash = { type: "cash", payments: 0, refunds: 0, total: 0 }
  const visa = { type: "visa", payments: 0, refunds: 0, total: 0 }
  const master = { type: "mastercard", payments: 0, refunds: 0, total: 0 }
  const discover = { type: "discover", payments: 0, refunds: 0, total: 0 }
  const amex = { type: "americanexpress", payments: 0, refunds: 0, total: 0 }

  for (const item of details) {
    switch (item.payCctype.toLowerCase()) {
      case "cash":
        addToPay(cash, item)
        break
      case "visa":
        addToPay(visa, item)
        break
      case "mastercard":
        addToPay(master, item)
        break
      case "discover":
        addToPay(discover, item)
        break
      case "americanexpress":
      case "american express":
        addToPay(amex, item)
        break
    }
  }

  return [cash, master, visa, discover, amex].filter(
    (r) => r.total !== 0 || r.payments !== 0 || r.refunds !== 0
  )
}

export function buildPaymentSummary(rows: DoorCheckoutApiRow[]): CollapsedPay[] {
  const details = rows.map(rowToPayDetail)
  const isUserSection = rows.some((r) => r._userLabel)
  return isUserSection ? collapseUserPayments(details) : collapseMainPayments(details)
}

export function buildShowDetails(rows: DoorCheckoutApiRow[]): DoorCheckoutShowDetail[] {
  const map = new Map<
    string,
    { showId: string; showdt: string; comicName: string; payments: Map<string, { payments: number; refunds: number }> }
  >()
  for (const row of rows) {
    const key = row.ShowId ?? row.Showdt ?? "unknown"
    if (!map.has(key)) {
      map.set(key, {
        showId: row.ShowId ?? "",
        showdt: row.Showdt ?? "—",
        comicName: row.ComicName ?? "—",
        payments: new Map(),
      })
    }
    const show = map.get(key)!
    const pymtKey = showLinePaymentLabel(row)
    if (!show.payments.has(pymtKey)) show.payments.set(pymtKey, { payments: 0, refunds: 0 })
    const p = show.payments.get(pymtKey)!
    if (isRefund(row)) p.refunds += row.Total ?? 0
    else p.payments += row.Total ?? 0
  }
  return Array.from(map.values()).map((show) => ({
    showId: show.showId,
    showdt: show.showdt,
    comicName: show.comicName,
    paymentLines: Array.from(show.payments.entries()).map(([type, { payments, refunds }]) => ({
      type,
      payments,
      refunds,
      total: payments + refunds,
    })),
    totalPayments: Array.from(show.payments.values()).reduce((s, v) => s + v.payments, 0),
    totalRefunds: Array.from(show.payments.values()).reduce((s, v) => s + v.refunds, 0),
    total: Array.from(show.payments.values()).reduce((s, v) => s + v.payments + v.refunds, 0),
  }))
}

export function groupDoorCheckoutByDate(rows: DoorCheckoutApiRow[]): [string, DoorCheckoutApiRow[]][] {
  const map = new Map<string, DoorCheckoutApiRow[]>()
  for (const row of rows) {
    const key = row.CreatedDate ?? "Unknown"
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(row)
  }
  return Array.from(map.entries())
}

export function classifyPaymentBucket(paymentType: string): DoorCheckoutCardBucket | null {
  const t = paymentType.trim().toLowerCase()
  if (t === "cash" || t.includes("cash")) return "cash"
  if (t.includes("amex") || t.includes("american")) return "amex"
  if (t.includes("discover")) return "discover"
  if (t.includes("master")) return "master"
  if (t.includes("visa")) return "visa"
  return null
}

const CARD_BUCKET_ORDER: DoorCheckoutCardBucket[] = ["cash", "amex", "discover", "master", "visa"]

export function buildShowDetailsByCardBucket(rows: DoorCheckoutApiRow[]) {
  const showDetails = buildShowDetails(rows)
  const buckets: Record<DoorCheckoutCardBucket, DoorCheckoutShowLine[]> = {
    cash: [],
    amex: [],
    discover: [],
    master: [],
    visa: [],
  }

  for (const show of showDetails) {
    const showLabel = `${show.showdt}-${show.comicName}`
    for (const line of show.paymentLines) {
      const bucket = classifyPaymentBucket(line.type)
      if (!bucket) continue
      buckets[bucket].push({
        showLabel,
        paymentType: line.type,
        payments: line.payments,
        refunds: line.refunds,
        total: line.total,
      })
    }
  }

  const bucketTotals = Object.fromEntries(
    CARD_BUCKET_ORDER.map((key) => {
      const lines = buckets[key]
      return [
        key,
        {
          payments: lines.reduce((s, line) => s + line.payments, 0),
          refunds: lines.reduce((s, line) => s + line.refunds, 0),
          total: lines.reduce((s, line) => s + line.total, 0),
        },
      ]
    })
  ) as Record<DoorCheckoutCardBucket, { payments: number; refunds: number; total: number }>

  return { buckets, bucketTotals, bucketOrder: CARD_BUCKET_ORDER }
}

export function formatCheckoutDateHeading(date: string): string {
  const parsed = dayjs(date, "M/D/YYYY")
  if (parsed.isValid()) return parsed.format("dddd, MMMM D, YYYY")
  const fallback = dayjs(date)
  return fallback.isValid() ? fallback.format("dddd, MMMM D, YYYY") : date
}

export type DoorCheckoutExportSection = {
  userLabel?: string
  checkoutDate: string
  checkoutDateHeading: string
  paymentSummary: CollapsedPay[]
  showBuckets: Record<DoorCheckoutCardBucket, DoorCheckoutShowLine[]>
  bucketTotals: Record<DoorCheckoutCardBucket, { payments: number; refunds: number; total: number }>
  paymentTotal: number
  refundTotal: number
  totalsTotal: number
}

export function buildDoorCheckoutExportSections(rawData: unknown): DoorCheckoutExportSection[] {
  const rows = normalizeDoorCheckoutRows(rawData)
  if (!rows.length) return []

  const sections: DoorCheckoutExportSection[] = []

  function addSectionsForRows(targetRows: DoorCheckoutApiRow[], userLabel?: string) {
    for (const [date, dateRows] of groupDoorCheckoutByDate(targetRows)) {
      const paymentSummary = buildPaymentSummary(dateRows)
      const { buckets, bucketTotals } = buildShowDetailsByCardBucket(dateRows)
      const paymentTotal = paymentSummary.reduce((s, row) => s + row.payments, 0)
      const refundTotal = paymentSummary.reduce((s, row) => s + row.refunds, 0)
      sections.push({
        userLabel,
        checkoutDate: date,
        checkoutDateHeading: formatCheckoutDateHeading(date),
        paymentSummary,
        showBuckets: buckets,
        bucketTotals,
        paymentTotal,
        refundTotal,
        totalsTotal: paymentTotal + refundTotal,
      })
    }
  }

  const summaryRows = rows.filter((r) => !r._userLabel)
  const userRows = rows.filter((r) => r._userLabel)
  const isSeparateByUsers = userRows.length > 0

  if (isSeparateByUsers && summaryRows.length > 0) {
    addSectionsForRows(summaryRows)
  }

  if (isSeparateByUsers) {
    const userMap = new Map<string, DoorCheckoutApiRow[]>()
    for (const row of userRows) {
      const key = row._userLabel ?? ""
      if (!userMap.has(key)) userMap.set(key, [])
      userMap.get(key)!.push(row)
    }
    for (const [userName, perUserRows] of userMap.entries()) {
      addSectionsForRows(perUserRows, userName || "(unknown)")
    }
  } else {
    addSectionsForRows(rows)
  }

  return sections
}
