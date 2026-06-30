import {
  ReportCard,
  ReportEmpty,
  ReportHeader,
  ReportTable,
  ReportTableScroll,
  ReportTd,
  ReportTh,
  ReportViewShell,
  reportRowClass,
} from "@/features/reports/report-ui"

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
    <div className="bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
      {children}
    </div>
  )
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
    <ReportTableScroll>
      <ReportTable>
        <thead>
          <tr>
            <ReportTh className="min-w-22">Type</ReportTh>
            {PAYMENT_COLS.map((c) => (
              <ReportTh key={c} right>{PAYMENT_LABELS[c]}</ReportTh>
            ))}
            <ReportTh right>SubTotal</ReportTh>
            <ReportTh right>Total</ReportTh>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={reportRowClass(i)}>
              <ReportTd bold={row.label === "Totals"}>{row.label}</ReportTd>
              {PAYMENT_COLS.map((c) => (
                <ReportTd key={c} right red={(row.data[c] ?? 0) < 0}>
                  {(row.data[c] ?? 0) !== 0 ? fmt(row.data[c]) : ""}
                </ReportTd>
              ))}
              <ReportTd right>{row.sub !== 0 ? fmt(row.sub) : ""}</ReportTd>
              <ReportTd right bold>{row.total != null ? fmt(row.total) : ""}</ReportTd>
            </tr>
          ))}
          <tr className="bg-muted/40">
            <ReportTd bold>Totals</ReportTd>
            {PAYMENT_COLS.map((c) => (
              <ReportTd key={c} right bold>{(totals[c] ?? 0) !== 0 ? fmt(totals[c]) : "$0.00"}</ReportTd>
            ))}
            <ReportTd right bold>{fmt(totalsSub)}</ReportTd>
            <ReportTd right bold>{fmt(totalCash)}</ReportTd>
          </tr>
        </tbody>
      </ReportTable>

      {/* Financial summary */}
      <div className="mt-1 flex justify-end">
        <ReportTable>
          <tbody>
            {[
              { label: "Saletax", value: saleTax },
              { label: "Net Sales", value: netSales },
              { label: "Fee", value: fee },
              { label: "Revenue", value: revenue },
            ].map(({ label, value }) => (
              <tr key={label}>
                <ReportTd className="bg-muted/20 text-right font-medium text-muted-foreground">
                  {label}
                </ReportTd>
                <ReportTd right bold>{fmt(value)}</ReportTd>
              </tr>
            ))}
          </tbody>
        </ReportTable>
      </div>
    </ReportTableScroll>
  )
}

// ─── Side-by-side layout (Origin + Show Sections share right column width) ─────

const MANAGER_CHECKOUT_SIDE_COL = "minmax(11rem,16rem)"

function ManagerCheckoutSplitRow({
  left,
  right,
}: {
  left: React.ReactNode
  right: React.ReactNode | null
}) {
  if (!right) {
    return <div className="min-w-0">{left}</div>
  }

  return (
    <div
      className="grid grid-cols-1 items-start gap-x-0 gap-y-3 lg:grid-cols-[minmax(0,1fr)_var(--mc-side-col)]"
      style={{ ["--mc-side-col" as string]: MANAGER_CHECKOUT_SIDE_COL }}
    >
      <div className="min-w-0">{left}</div>
      <div className="min-w-0 lg:justify-self-stretch">{right}</div>
    </div>
  )
}

// ─── Checked-In + Source tables (single table keeps row alignment) ─────────────

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
    <div className="space-y-1">
      <p className="text-center text-xs font-semibold text-muted-foreground">Checked-In</p>
      <ReportTableScroll>
        <ReportTable className="w-full">
          <colgroup>
            <col />
            <col className="w-14" />
            <col className="w-14" />
            <col className="w-14" />
            <col className="w-14" />
            <col className="w-14" />
            <col className="w-14" />
            <col className="w-16" />
            <col className="w-16" />
            <col className="w-16" />
            <col className="w-14" />
            <col className="w-14" />
            <col className="w-14" />
          </colgroup>
          <thead>
            <tr>
              <ReportTh>Promotion</ReportTh>
              <ReportTh right>Party</ReportTh>
              <ReportTh right>Seated</ReportTh>
              <ReportTh right>Paid</ReportTh>
              <ReportTh right>Comp</ReportTh>
              <ReportTh right>Disc</ReportTh>
              <ReportTh right>Scanned</ReportTh>
              <ReportTh right>ScanPaid</ReportTh>
              <ReportTh right>ScanComp</ReportTh>
              <ReportTh right>ScanDisc</ReportTh>
              <ReportTh right className="border-l-2 border-border/80 bg-muted/60">
                Phone-In
              </ReportTh>
              <ReportTh right className="bg-muted/60">Walkup</ReportTh>
              <ReportTh right className="bg-muted/60">Web</ReportTh>
            </tr>
          </thead>
          <tbody>
            {promos.map((p, i) => {
              const { phone, walkup, web } = getSources(p.Promo ?? "")
              return (
                <tr key={i} className={reportRowClass(i)}>
                  <ReportTd>{p.Promo || "-"}</ReportTd>
                  <ReportTd right>{n(p.PartyNo)}</ReportTd>
                  <ReportTd right>{n(p.CheckedIn)}</ReportTd>
                  <ReportTd right>{n(p.CheckInPaid)}</ReportTd>
                  <ReportTd right>{n(p.CheckInComp)}</ReportTd>
                  <ReportTd right>{n(p.CheckInDisc)}</ReportTd>
                  <ReportTd right>{n(p.ScannerIn)}</ReportTd>
                  <ReportTd right>{n(p.ScannerInPaid)}</ReportTd>
                  <ReportTd right>{n(p.ScannerInComp)}</ReportTd>
                  <ReportTd right>{n(p.ScannerInDisc)}</ReportTd>
                  <ReportTd right className="border-l-2 border-border/80">{phone}</ReportTd>
                  <ReportTd right>{walkup}</ReportTd>
                  <ReportTd right>{web}</ReportTd>
                </tr>
              )
            })}
            <tr className="bg-muted/40">
              <ReportTd bold>Total</ReportTd>
              <ReportTd right bold>{sumParty}</ReportTd>
              <ReportTd right bold>{sumCheckedIn}</ReportTd>
              <ReportTd right bold>{sumPaid}</ReportTd>
              <ReportTd right bold>{sumComp}</ReportTd>
              <ReportTd right bold>{sumDisc}</ReportTd>
              <ReportTd right bold>{sumScanned}</ReportTd>
              <ReportTd right bold>{sumScanPaid}</ReportTd>
              <ReportTd right bold>{sumScanComp}</ReportTd>
              <ReportTd right bold>{sumScanDisc}</ReportTd>
              <ReportTd right bold className="border-l-2 border-border/80">{totalPhone}</ReportTd>
              <ReportTd right bold>{totalWalkup}</ReportTd>
              <ReportTd right bold>{totalWeb}</ReportTd>
            </tr>
          </tbody>
        </ReportTable>
      </ReportTableScroll>
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
    <ReportTable className="w-full">
      <thead>
        <tr>
          <ReportTh>Origin</ReportTh>
          <ReportTh right>Party</ReportTh>
          <ReportTh right>(Pre)Seated</ReportTh>
          <ReportTh right>Paid</ReportTh>
        </tr>
      </thead>
      <tbody>
        {origins.map((o, i) => (
          <tr key={i} className={reportRowClass(i)}>
            <ReportTd>{o.Origin}</ReportTd>
            <ReportTd right>{n(o.Party)}</ReportTd>
            <ReportTd right>{n(o.Seated)}</ReportTd>
            <ReportTd right>{fmt(n(o.Paid))}</ReportTd>
          </tr>
        ))}
        <tr className="bg-muted/40">
          <ReportTd bold>Total</ReportTd>
          <ReportTd right bold>{totalParty}</ReportTd>
          <ReportTd right bold>{totalSeated}</ReportTd>
          <ReportTd right bold>{fmt(totalPaid)}</ReportTd>
        </tr>
      </tbody>
    </ReportTable>
  )
}

function ShowSectionsTable({ show }: { show: ManagerCheckoutApiShow }) {
  const sections = show.BookedShowSectionList ?? []
  if (!sections.length) return null

  return (
    <ReportTable className="w-full">
      <thead>
        <tr>
          <ReportTh>Show Section</ReportTh>
          <ReportTh right>Party</ReportTh>
          <ReportTh right>Total Amount</ReportTh>
        </tr>
      </thead>
      <tbody>
        {sections.map((s, i) => (
          <tr key={i} className={reportRowClass(i)}>
            <ReportTd>{s.ShowSection || "-"}</ReportTd>
            <ReportTd right>{n(s.PartyNo)}</ReportTd>
            <ReportTd right>{fmt(n(s.TotalAmount))}</ReportTd>
          </tr>
        ))}
      </tbody>
    </ReportTable>
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
    return <ReportEmpty />
  }

  return (
    <ReportViewShell>
      <ReportHeader title="Manager Checkout" subtitle={subtitle} generatedAt={generatedAt} />

      {shows.map((show, idx) => {
        const ticketPriceStr = (show.TicketPrice ?? []).map((p) => `$${p}`).join(", ") || "N/A"

        return (
          <ReportCard key={show.ShowId ?? idx}>
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

              {/* 2 — Checked-In + Phone/Walkup/Web (single table) */}
              <CheckedInTable show={show} />

              {/* 3 — Origin + Show Sections (aligned side column) */}
              <ManagerCheckoutSplitRow
                left={
                  <ReportTableScroll>
                    <OriginTable show={show} />
                  </ReportTableScroll>
                }
                right={
                  show.BookedShowSectionList?.length ? (
                    <ReportTableScroll>
                      <ShowSectionsTable show={show} />
                    </ReportTableScroll>
                  ) : null
                }
              />
            </div>
          </ReportCard>
        )
      })}

      <p className="text-right text-xs text-muted-foreground">
        {shows.length} show{shows.length !== 1 ? "s" : ""}
      </p>
    </ReportViewShell>
  )
}
