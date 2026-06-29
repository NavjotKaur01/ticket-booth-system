import { cn } from "@/lib/utils"

// ─── API shape ────────────────────────────────────────────────────────────────

type PaymentEntry = { Amount?: number; CCType?: string }
type PromoEntry = {
  Promo?: string
  PartyNo?: number
  TixPaid?: number
  TixComp?: number
  TixDisc?: number
  CheckedIn?: number
  CheckInPaid?: number
  CheckInComp?: number
  CheckInDisc?: number
  ScannerIn?: number
  ScannerInPaid?: number
  ScannerInComp?: number
  ScannerInDisc?: number
}
type ShowSectionEntry = { PartyNo?: number; ShowSection?: string; TotalAmount?: number }
type PromoSourceEntry = { Promo?: string; Ressource?: string; SourceParty?: number }
type OriginEntry = { Origin?: string; Party?: number; Seated?: number; Paid?: number }

export type ManagerCheckoutApiShow = {
  ShowId?: string
  Location?: string
  DateStr?: string
  TimeStr?: string
  Comic?: string
  Booked?: number
  PreSeated?: number
  SubTot?: number | string
  Service?: number | string
  Discount?: number | string
  Total?: number | string
  SaleTax?: number
  Fee?: number
  TicketPrice?: (number | string)[]
  CashForCashDrawer?: PaymentEntry[]
  CashFoRefund?: PaymentEntry[]
  CashForPOS?: PaymentEntry[]
  CashForWeb?: PaymentEntry[]
  CashForWebRefunds?: PaymentEntry[]
  FillPromoList?: PromoEntry[]
  BookedShowSectionList?: ShowSectionEntry[]
  PromoSourceList?: PromoSourceEntry[]
  OriginSourceList?: OriginEntry[]
}

// ─── Payment helpers ───────────────────────────────────────────────────────────

const PAYMENT_COLS = ["cash", "amex", "discover", "mastercard", "visa", "giftcard", "giftcert", "webgiftcert", "other"] as const
type PayCol = (typeof PAYMENT_COLS)[number]

const PAYMENT_LABELS: Record<PayCol, string> = {
  cash: "Cash",
  amex: "AmEx",
  discover: "Discover",
  mastercard: "MasterCard",
  visa: "Visa",
  giftcard: "Gift Card",
  giftcert: "Gift Cert",
  webgiftcert: "WebGiftCert",
  other: "Other",
}

function normalizeCC(ccType = ""): PayCol {
  const t = ccType.trim().toUpperCase()
  if (t === "CASH") return "cash"
  if (["AMERICAN EXPRESS", "AMX", "AMEX"].includes(t)) return "amex"
  if (t === "DISCOVER") return "discover"
  if (["MASTERCARD", "MC", "MASTER CARD"].includes(t)) return "mastercard"
  if (t === "VISA") return "visa"
  if (["GIFT CARD", "GIFTCARD"].includes(t)) return "giftcard"
  if (["GIFT CERT", "GIFTCERT", "GIFT CERTIFICATE"].includes(t)) return "giftcert"
  if (["WEB GIFT CERT", "WEBGIFTCERT", "WEB GIFT CERTIFICATE", "WEBGIFTCERTIFICATE"].includes(t)) return "webgiftcert"
  return "other"
}

function mapPayments(items: PaymentEntry[] = []): Record<PayCol, number> {
  const result = {} as Record<PayCol, number>
  for (const item of items) {
    const key = normalizeCC(item.CCType)
    result[key] = (result[key] ?? 0) + (item.Amount ?? 0)
  }
  return result
}

function rowSubtotal(row: Record<PayCol, number>): number {
  return PAYMENT_COLS.reduce((s, c) => s + (row[c] ?? 0), 0)
}

function sumCols(rows: Record<PayCol, number>[]): Record<PayCol, number> {
  const out = {} as Record<PayCol, number>
  for (const c of PAYMENT_COLS) {
    out[c] = rows.reduce((s, r) => s + (r[c] ?? 0), 0)
  }
  return out
}

function fmt(v: number | undefined | null): string {
  if (v == null || v === 0) return "$0.00"
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v)
}

function n(v: number | undefined | null): number {
  return v ?? 0
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
      {children}
    </div>
  )
}

function Th({ children, right, className }: { children: React.ReactNode; right?: boolean; className?: string }) {
  return (
    <th
      className={cn(
        "border border-border bg-muted/50 px-2 py-1 text-[11px] font-semibold tracking-wide text-muted-foreground whitespace-nowrap",
        right && "text-right",
        className
      )}
    >
      {children}
    </th>
  )
}

function Td({
  children,
  right,
  bold,
  red,
  className,
}: {
  children: React.ReactNode
  right?: boolean
  bold?: boolean
  red?: boolean
  className?: string
}) {
  return (
    <td
      className={cn(
        "border border-border px-2 py-1 text-xs whitespace-nowrap",
        right && "text-right tabular-nums",
        bold && "font-semibold",
        red && "text-red-600",
        className
      )}
    >
      {children}
    </td>
  )
}

function fmtZero(v: number): string {
  return v === 0 ? "$0.00" : fmt(v)
}

// ─── Payment breakdown table ───────────────────────────────────────────────────

function PaymentTable({ show }: { show: ManagerCheckoutApiShow }) {
  const cashDrawer = mapPayments(show.CashForCashDrawer)
  const refund = mapPayments(show.CashFoRefund)
  const pos = mapPayments(show.CashForPOS)
  const web = mapPayments(show.CashForWeb)
  const webRefund = mapPayments(show.CashForWebRefunds)
  const posRefund = {} as Record<PayCol, number>

  const cashDrawerSub = rowSubtotal(cashDrawer)
  const refundSub = rowSubtotal(refund)
  const posSub = rowSubtotal(pos)
  const webSub = rowSubtotal(web)
  const webRefundSub = rowSubtotal(webRefund)

  const totals = sumCols([cashDrawer, refund, pos, posRefund, web, webRefund])
  const totalsSub = rowSubtotal(totals)

  const refundTotal = cashDrawerSub + refundSub
  const posTotal = posSub + 0
  const webRefundTotal = webSub + webRefundSub
  const totalCash = refundTotal + posTotal + webRefundTotal

  const saleTax = n(show.SaleTax)
  const fee = n(show.Fee)
  const netSales = totalCash - saleTax
  const revenue = netSales - fee

  const rows: { label: string; data: Record<PayCol, number>; sub: number; total?: number }[] = [
    { label: "Cash Drawer", data: cashDrawer, sub: cashDrawerSub, total: refundTotal },
    { label: "Refund", data: refund, sub: refundSub },
    { label: "POS", data: pos, sub: posSub, total: posTotal },
    { label: "Refund", data: posRefund, sub: 0 },
    { label: "Web", data: web, sub: webSub, total: webRefundTotal },
    { label: "Web/Refund", data: webRefund, sub: webRefundSub },
  ]

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr>
            <Th className="min-w-22">Type</Th>
            {PAYMENT_COLS.map((c) => (
              <Th key={c} right>{PAYMENT_LABELS[c]}</Th>
            ))}
            <Th right>SubTotal</Th>
            <Th right>Total</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
              <Td bold={row.label === "Totals"}>{row.label}</Td>
              {PAYMENT_COLS.map((c) => (
                <Td key={c} right red={(row.data[c] ?? 0) < 0}>
                  {(row.data[c] ?? 0) !== 0 ? fmt(row.data[c]) : ""}
                </Td>
              ))}
              <Td right>{row.sub !== 0 ? fmt(row.sub) : ""}</Td>
              <Td right bold>{row.total != null ? fmt(row.total) : ""}</Td>
            </tr>
          ))}
          {/* Totals row */}
          <tr className="bg-muted/40">
            <Td bold>Totals</Td>
            {PAYMENT_COLS.map((c) => (
              <Td key={c} right bold>{(totals[c] ?? 0) !== 0 ? fmt(totals[c]) : "$0.00"}</Td>
            ))}
            <Td right bold>{fmt(totalsSub)}</Td>
            <Td right bold>{fmt(totalCash)}</Td>
          </tr>
        </tbody>
      </table>

      {/* Financial summary */}
      <div className="mt-1 flex justify-end">
        <table className="border-collapse text-xs">
          <tbody>
            {[
              { label: "Saletax", value: saleTax },
              { label: "Net Sales", value: netSales },
              { label: "Fee", value: fee },
              { label: "Revenue", value: revenue },
            ].map(({ label, value }) => (
              <tr key={label}>
                <td className="border border-border bg-muted/20 px-3 py-0.5 text-right text-xs font-medium text-muted-foreground">
                  {label}
                </td>
                <td className="border border-border px-3 py-0.5 text-right text-xs tabular-nums font-semibold">
                  {fmt(value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Checked-In + Source tables ────────────────────────────────────────────────

function CheckedInTable({ show }: { show: ManagerCheckoutApiShow }) {
  const promos = show.FillPromoList ?? []
  const sources = show.PromoSourceList ?? []

  const sumParty = promos.reduce((s, p) => s + n(p.PartyNo), 0)
  const sumCheckedIn = promos.reduce((s, p) => s + n(p.CheckedIn), 0)
  const sumPaid = promos.reduce((s, p) => s + n(p.CheckInPaid), 0)
  const sumComp = promos.reduce((s, p) => s + n(p.CheckInComp), 0)
  const sumDisc = promos.reduce((s, p) => s + n(p.CheckInDisc), 0)
  const sumScanned = promos.reduce((s, p) => s + n(p.ScannerIn), 0)
  const sumScanPaid = promos.reduce((s, p) => s + n(p.ScannerInPaid), 0)
  const sumScanComp = promos.reduce((s, p) => s + n(p.ScannerInComp), 0)
  const sumScanDisc = promos.reduce((s, p) => s + n(p.ScannerInDisc), 0)

  function getSources(promo: string) {
    const filtered = sources.filter((s) => s.Promo?.trim() === promo.trim())
    let phone = 0, walkup = 0, web = 0
    for (const s of filtered) {
      const r = s.Ressource?.trim().toUpperCase()
      if (r === "SRC01") phone = n(s.SourceParty)
      if (r === "SRC02") walkup = n(s.SourceParty)
      if (r === "SRC03") web = n(s.SourceParty)
    }
    return { phone, walkup, web }
  }

  const totalPhone = promos.reduce((s, p) => s + getSources(p.Promo ?? "").phone, 0)
  const totalWalkup = promos.reduce((s, p) => s + getSources(p.Promo ?? "").walkup, 0)
  const totalWeb = promos.reduce((s, p) => s + getSources(p.Promo ?? "").web, 0)

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
      <div className="overflow-x-auto">
        <p className="mb-1 text-center text-xs font-semibold text-muted-foreground">Checked-In</p>
        <table className="border-collapse text-xs">
          <thead>
            <tr>
              <Th>Promotion</Th>
              <Th right>Party</Th>
              <Th right>Seated</Th>
              <Th right>Paid</Th>
              <Th right>Comp</Th>
              <Th right>Disc</Th>
              <Th right>Scanned</Th>
              <Th right>ScanPaid</Th>
              <Th right>ScanComp</Th>
              <Th right>ScanDisc</Th>
            </tr>
          </thead>
          <tbody>
            {promos.map((p, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                <Td>{p.Promo || "-"}</Td>
                <Td right>{n(p.PartyNo)}</Td>
                <Td right>{n(p.CheckedIn)}</Td>
                <Td right>{n(p.CheckInPaid)}</Td>
                <Td right>{n(p.CheckInComp)}</Td>
                <Td right>{n(p.CheckInDisc)}</Td>
                <Td right>{n(p.ScannerIn)}</Td>
                <Td right>{n(p.ScannerInPaid)}</Td>
                <Td right>{n(p.ScannerInComp)}</Td>
                <Td right>{n(p.ScannerInDisc)}</Td>
              </tr>
            ))}
            <tr className="bg-muted/40">
              <Td bold>Total</Td>
              <Td right bold>{sumParty}</Td>
              <Td right bold>{sumCheckedIn}</Td>
              <Td right bold>{sumPaid}</Td>
              <Td right bold>{sumComp}</Td>
              <Td right bold>{sumDisc}</Td>
              <Td right bold>{sumScanned}</Td>
              <Td right bold>{sumScanPaid}</Td>
              <Td right bold>{sumScanComp}</Td>
              <Td right bold>{sumScanDisc}</Td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Phone-In / Walkup / Web side table */}
      <div className="overflow-x-auto">
        <table className="border-collapse text-xs">
          <thead>
            <tr>
              <Th right>Phone-In</Th>
              <Th right>Walkup</Th>
              <Th right>Web</Th>
            </tr>
          </thead>
          <tbody>
            {promos.map((p, i) => {
              const { phone, walkup, web } = getSources(p.Promo ?? "")
              return (
                <tr key={i} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                  <Td right>{phone}</Td>
                  <Td right>{walkup}</Td>
                  <Td right>{web}</Td>
                </tr>
              )
            })}
            <tr className="bg-muted/40">
              <Td right bold>{totalPhone}</Td>
              <Td right bold>{totalWalkup}</Td>
              <Td right bold>{totalWeb}</Td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Origin + Show Sections tables ─────────────────────────────────────────────

function OriginTable({ show }: { show: ManagerCheckoutApiShow }) {
  const origins = (show.OriginSourceList ?? []).filter(
    (o) => o.Origin && (n(o.Party) !== 0 || n(o.Seated) !== 0 || n(o.Paid) !== 0)
  )

  const totalParty = origins.reduce((s, o) => s + n(o.Party), 0)
  const totalSeated = origins.reduce((s, o) => s + n(o.Seated), 0)
  const totalPaid = origins.reduce((s, o) => s + n(o.Paid), 0)

  return (
    <table className="border-collapse text-xs">
      <thead>
        <tr>
          <Th>Origin</Th>
          <Th right>Party</Th>
          <Th right>(Pre)Seated</Th>
          <Th right>Paid</Th>
        </tr>
      </thead>
      <tbody>
        {origins.map((o, i) => (
          <tr key={i} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
            <Td>{o.Origin}</Td>
            <Td right>{n(o.Party)}</Td>
            <Td right>{n(o.Seated)}</Td>
            <Td right>{fmt(n(o.Paid))}</Td>
          </tr>
        ))}
        <tr className="bg-muted/40">
          <Td bold>Total</Td>
          <Td right bold>{totalParty}</Td>
          <Td right bold>{totalSeated}</Td>
          <Td right bold>{fmt(totalPaid)}</Td>
        </tr>
      </tbody>
    </table>
  )
}

function ShowSectionsTable({ show }: { show: ManagerCheckoutApiShow }) {
  const sections = show.BookedShowSectionList ?? []
  if (!sections.length) return null

  return (
    <table className="border-collapse text-xs">
      <thead>
        <tr>
          <Th>Show Section</Th>
          <Th right>Party</Th>
          <Th right>Total Amount</Th>
        </tr>
      </thead>
      <tbody>
        {sections.map((s, i) => (
          <tr key={i} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
            <Td>{s.ShowSection || "-"}</Td>
            <Td right>{n(s.PartyNo)}</Td>
            <Td right>{fmt(n(s.TotalAmount))}</Td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

type ManagerCheckoutViewProps = {
  rawData: unknown
  subtitle: string
  generatedAt: string
}

export function ManagerCheckoutView({ rawData, subtitle, generatedAt }: ManagerCheckoutViewProps) {
  const shows = Array.isArray(rawData) ? (rawData as ManagerCheckoutApiShow[]) : []

  if (!shows.length) {
    return (
      <div className="flex min-h-64 items-center justify-center text-sm text-muted-foreground">
        No records found
      </div>
    )
  }

  return (
    <div className="space-y-3 p-4">
      {/* Report header */}
      <div className="flex flex-wrap items-end justify-between gap-2 rounded-xl border border-border/70 bg-muted/10 px-4 py-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Manager Checkout</h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <p className="text-xs text-muted-foreground">Generated {generatedAt}</p>
      </div>

      {shows.map((show, idx) => {
        const ticketPriceStr = (show.TicketPrice ?? []).map((p) => `$${p}`).join(", ") || "N/A"

        return (
          <div key={show.ShowId ?? idx} className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
            {/* Show header */}
            <SectionLabel>{show.Location || "—"} — Manager Checkout</SectionLabel>
            <div className="grid grid-cols-2 gap-x-6 gap-y-0.5 px-3 py-2 text-xs sm:grid-cols-3">
              <div className="flex gap-2">
                <span className="font-medium text-muted-foreground">Show Date:</span>
                <span>{show.DateStr || "—"}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium text-muted-foreground">Show Time:</span>
                <span>{show.TimeStr || "—"}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium text-muted-foreground">Booked:</span>
                <span>{n(show.Booked)}</span>
                <span className="font-medium text-muted-foreground ml-3">(Pre) Seat:</span>
                <span>{n(show.PreSeated)}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium text-muted-foreground">Comic Name:</span>
                <span className="font-medium">{show.Comic || "—"}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium text-muted-foreground">Ticket Price:</span>
                <span>{ticketPriceStr}</span>
              </div>
            </div>

            <div className="space-y-4 p-3">
              {/* 1 — Payment breakdown */}
              <PaymentTable show={show} />

              {/* 2 — Checked-In + Phone/Walkup/Web */}
              <CheckedInTable show={show} />

              {/* 3 — Origin + Show Sections */}
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                <OriginTable show={show} />
                <ShowSectionsTable show={show} />
              </div>
            </div>
          </div>
        )
      })}

      <p className="text-right text-xs text-muted-foreground">
        {shows.length} show{shows.length !== 1 ? "s" : ""}
      </p>
    </div>
  )
}
