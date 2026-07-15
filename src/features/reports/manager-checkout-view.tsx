import { useState } from "react"
import { cn } from "@/lib/utils"
import type { ReportDrillContext } from "@/features/reports/reports.service"
import { ReportDrillDialog } from "@/features/reports/report-drill-dialog"
import type { DrillColumn } from "@/features/reports/report-drill-dialog"

// ─── API shape ────────────────────────────────────────────────────────────────

type PaymentEntry = { Amount?: number; CCType?: string; PymtType?: string }
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
  TotalReceipts?: string | number
  TotalRecipts?: string | number
  FillPromoList?: PromoEntry[]
  BookedShowSectionList?: ShowSectionEntry[]
  PromoSourceList?: PromoSourceEntry[]
  OriginSourceList?: OriginEntry[]
  OriginShowList?: OriginEntry[]
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
  if (["CASH", "CASH DRAWER"].includes(t)) return "cash"
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
    // Prefer CCType for card-column resolution (e.g. "Visa", "MasterCard").
    // Fall back to PymtType only when CCType is blank — this handles the
    // "Cash" / "CASH DRAWER" case where PymtType is "Cash" and CCType is "".
    const key = normalizeCC(item.CCType || item.PymtType)
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
    <div className="bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground break-words">
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

// ─── Payment drill-down helpers ────────────────────────────────────────────────

type DrillKey = {
  drillType: string
  type: string
  web: "Y" | "N"
}

function resolveDrillKey(rowLabel: string, col: PayCol): DrillKey | null {
  const isWeb = rowLabel === "Web" || rowLabel === "Web/Refund"
  const isRefund = rowLabel === "Refund" || rowLabel === "Web/Refund"
  const isDrawerOrPos = rowLabel === "Cash Drawer" || rowLabel === "POS" || rowLabel === "Refund"

  // Only Cash Drawer, POS, Web, and their Refund rows are drillable
  if (!isWeb && !isDrawerOrPos) return null

  const webFlag = isWeb ? "Y" : "N"

  if (col === "cash") {
    return { drillType: "PYMT05", type: isRefund ? "Refund" : "Payment", web: webFlag }
  } else if (col === "giftcard") {
    return { drillType: "PYMT03", type: isRefund ? "Refund" : "Payment", web: webFlag }
  } else if (col === "giftcert" || col === "webgiftcert") {
    return { drillType: "PYMT04", type: isRefund ? "Refund" : "Payment", web: webFlag }
  } else if (col === "amex") {
    return { drillType: "CCTYPE01", type: isRefund ? "CRefund" : "Fill", web: webFlag }
  } else if (col === "discover") {
    return { drillType: "CCTYPE02", type: isRefund ? "CRefund" : "Fill", web: webFlag }
  } else if (col === "mastercard") {
    return { drillType: "CCTYPE03", type: isRefund ? "CRefund" : "Fill", web: webFlag }
  } else if (col === "visa") {
    return { drillType: "CCTYPE04", type: isRefund ? "CRefund" : "Fill", web: webFlag }
  }

  return null
}

const DRILL_COLUMNS: DrillColumn[] = [
  { key: "PaymentStatus", label: "Payment Status", keys: ["PaymentStatus", "PymtStatus", "Status"] },
  { key: "PymtType",      label: "Payment Type",   keys: ["PaymentType", "paymentType", "PymtType", "pymttype", "CCType", "cctype", "Type", "type"] },
  { key: "CustLName",     label: "Cust LName",     keys: ["CustLName", "LastName", "Lname"] },
  { key: "CustFName",     label: "Cust FName",     keys: ["CustFName", "FirstName", "Fname"] },
  { key: "PymtLName",     label: "Pymt LName",     keys: ["PymtLName"] },
  { key: "PymtFName",     label: "Pymt FName",     keys: ["PymtFName"] },
  { key: "Amount",        label: "Amount",         right: true, format: "currency" },
  { key: "CreatedBy",     label: "CreatedBy",      keys: ["CreatedBy"] },
  { key: "PaymentTime",   label: "CreateDt",   format: "datetime", keys: ["PaymentTime", "paymentTime", "PaymentDate", "paymentDate", "CreateDt", "CreatedDate"] },
]

// ─── Drill cell ────────────────────────────────────────────────────────────────

function DrillCell({
  value,
  drillKey,
  drillContext,
  show,
  onDrill,
}: {
  value: number
  drillKey: DrillKey | null
  drillContext?: ReportDrillContext
  show: ManagerCheckoutApiShow
  onDrill: (params: { showId: string; dk: DrillKey }) => void
}) {
  if (!value) return null

  const canDrill = !!drillContext && !!drillKey && !!show.ShowId

  if (!canDrill) {
    return <>{fmt(value)}</>
  }

  return (
    <button
      type="button"
      className="text-blue-600 hover:underline cursor-pointer font-inherit"
      onClick={() => onDrill({ showId: show.ShowId!, dk: drillKey! })}
    >
      {fmt(value)}
    </button>
  )
}

// ─── Payment breakdown table ───────────────────────────────────────────────────

function PaymentTable({ show, drillContext }: { show: ManagerCheckoutApiShow; drillContext?: ReportDrillContext }) {
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

  // Net total per section = source - refund
  const cashDrawerNet = cashDrawerSub - refundSub
  const posNet        = posSub
  const webNet        = webSub - webRefundSub
  const totalCash     = cashDrawerNet + posNet + webNet

  const saleTax = n(show.SaleTax)
  const fee = n(show.Fee)
  const netSales = totalCash - saleTax
  const revenue = netSales - fee

  // alwaysShowSub: refund rows always render $0.00 even when empty (matches desktop)
  // total: only appears on refund rows (after subtracting refund from its source)
  const rows: { label: string; data: Record<PayCol, number>; sub: number; total?: number; alwaysShowSub?: boolean; showZero?: boolean }[] = [
    { label: "Cash Drawer", data: cashDrawer, sub: cashDrawerSub, showZero: true },
    { label: "Refund",      data: refund,     sub: refundSub,     total: cashDrawerNet, alwaysShowSub: true },
    { label: "POS",         data: pos,        sub: posSub,        showZero: true },
    { label: "Refund",      data: posRefund,  sub: 0,             total: posNet,        alwaysShowSub: true },
    { label: "Web",         data: web,        sub: webSub,        showZero: true },
    { label: "Web/Refund",  data: webRefund,  sub: webRefundSub,  total: webNet,        alwaysShowSub: true },
  ]

  const [activeDrill, setActiveDrill] = useState<{ showId: string; dk: DrillKey } | null>(null)

  return (
    <div>
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
                {PAYMENT_COLS.map((c) => {
                  const dk = resolveDrillKey(row.label, c)
                  const cellVal = row.data[c] ?? 0
                  return (
                    <Td key={c} right red={(row.data[c] ?? 0) < 0}>
                      <DrillCell
                        value={cellVal}
                        drillKey={dk}
                        drillContext={drillContext}
                        show={show}
                        onDrill={setActiveDrill}
                      />
                    </Td>
                  )
                })}
                {/* Refund rows always show $0.00 in SubTotal (red), matching desktop */}
                <Td right red={row.alwaysShowSub}>{(row.sub !== 0 || row.alwaysShowSub || row.showZero) ? fmt(row.sub) : ""}</Td>
                {/* Total only appears on Refund rows */}
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
      </div>

      {/* Financial summary */}
      <div className="mt-1 flex justify-end">
        <table className="w-full max-w-[12rem] border-collapse text-xs sm:w-auto">
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

      {activeDrill && drillContext && (
        <ReportDrillDialog
          title="Manager Checkout - Drill Down Payment Verification"
          endpoint="ManagerCheckOutDrillDown"
          body={{
            Connection: drillContext.connectionName,
            StartDate: drillContext.startDate,
            EndDate: drillContext.endDate,
            LocaltionId: drillContext.locationId,
            ShowId: activeDrill.showId,
            DrillType: activeDrill.dk.drillType,
            Type: activeDrill.dk.type,
            Web: activeDrill.dk.web,
          }}
          columns={DRILL_COLUMNS}
          footerTotals
          onClose={() => setActiveDrill(null)}
        />
      )}
    </div>
  )
}

// ─── Compact side-by-side tables (content width, aligned columns) ──────────────

const COMPACT_TABLE = "w-auto max-w-none border-collapse text-xs"

function detailRowClass(index: number) {
  return index % 2 === 0 ? "bg-background" : "bg-muted/20"
}

type CheckedInDrillConfig = {
  showId: string
  drillType: string
  isZero: boolean
}

function CheckedInDrillCell({
  value,
  drillType,
  showId,
  drillContext,
  onDrill,
}: {
  value: number
  drillType: string
  showId: string
  drillContext?: ReportDrillContext
  onDrill: (params: CheckedInDrillConfig) => void
}) {
  const canDrill = !!drillContext && !!showId

  if (!canDrill) {
    return <>{value}</>
  }

  return (
    <button
      type="button"
      className="text-blue-600 hover:text-blue-800 dark:hover:text-blue-300 font-semibold focus:outline-none transition-colors"
      onClick={() => onDrill({ showId, drillType, isZero: value === 0 })}
    >
      {value}
    </button>
  )
}

function ManagerCheckoutDetailTables({
  show,
  drillContext,
  onDrillCheckedIn,
}: {
  show: ManagerCheckoutApiShow
  drillContext?: ReportDrillContext
  onDrillCheckedIn: (params: CheckedInDrillConfig) => void
}) {
  const promos = show.FillPromoList ?? []
  const sources = show.PromoSourceList ?? []
  const sections = show.BookedShowSectionList ?? []
  const origins = (show.OriginSourceList ?? show.OriginShowList ?? []).filter(
    (o) => o.Origin && (n(o.Party) !== 0 || n(o.Seated) !== 0 || n(o.Paid) !== 0)
  )

  const sumParty = promos.reduce((s, p) => s + n(p.PartyNo), 0)
  const sumCheckedIn = promos.reduce((s, p) => s + n(p.CheckedIn), 0)
  const sumPaid = promos.reduce((s, p) => s + n(p.CheckInPaid), 0)
  const sumComp = promos.reduce((s, p) => s + n(p.CheckInComp), 0)
  const sumDisc = promos.reduce((s, p) => s + n(p.CheckInDisc), 0)
  const sumScanned = promos.reduce((s, p) => s + n(p.ScannerIn), 0)
  const sumScanPaid = promos.reduce((s, p) => s + n(p.ScannerInPaid), 0)
  const sumScanComp = promos.reduce((s, p) => s + n(p.ScannerInComp), 0)
  const sumScanDisc = promos.reduce((s, p) => s + n(p.ScannerInDisc), 0)

  const totalParty = origins.reduce((s, o) => s + n(o.Party), 0)
  const totalSeated = origins.reduce((s, o) => s + n(o.Seated), 0)
  const totalPaid = origins.reduce((s, o) => s + n(o.Paid), 0)

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
    <div className="w-fit max-w-full overflow-x-auto">
      <div className="inline-grid grid-cols-[auto_auto] items-start gap-x-0 gap-y-4">
        <p className="justify-self-center text-center text-xs font-semibold leading-4 text-muted-foreground">
          Checked-In
        </p>
        <div className="h-4" aria-hidden />

        <table className={COMPACT_TABLE}>
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
              <tr key={i} className={detailRowClass(i)}>
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
              <Td right bold>
                <CheckedInDrillCell
                  value={sumPaid}
                  drillType="CheckInPaid"
                  showId={show.ShowId ?? ""}
                  drillContext={drillContext}
                  onDrill={onDrillCheckedIn}
                />
              </Td>
              <Td right bold>
                <CheckedInDrillCell
                  value={sumComp}
                  drillType="CheckInComp"
                  showId={show.ShowId ?? ""}
                  drillContext={drillContext}
                  onDrill={onDrillCheckedIn}
                />
              </Td>
              <Td right bold>
                <CheckedInDrillCell
                  value={sumDisc}
                  drillType="CheckInDisc"
                  showId={show.ShowId ?? ""}
                  drillContext={drillContext}
                  onDrill={onDrillCheckedIn}
                />
              </Td>
              <Td right bold>{sumScanned}</Td>
              <Td right bold>
                <CheckedInDrillCell
                  value={sumScanPaid}
                  drillType="ScannerInPaid"
                  showId={show.ShowId ?? ""}
                  drillContext={drillContext}
                  onDrill={onDrillCheckedIn}
                />
              </Td>
              <Td right bold>
                <CheckedInDrillCell
                  value={sumScanComp}
                  drillType="ScannerInComp"
                  showId={show.ShowId ?? ""}
                  drillContext={drillContext}
                  onDrill={onDrillCheckedIn}
                />
              </Td>
              <Td right bold>
                <CheckedInDrillCell
                  value={sumScanDisc}
                  drillType="ScannerInDisc"
                  showId={show.ShowId ?? ""}
                  drillContext={drillContext}
                  onDrill={onDrillCheckedIn}
                />
              </Td>
            </tr>
          </tbody>
        </table>

        <table className={cn(COMPACT_TABLE, "-ml-px justify-self-end")}>
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
                <tr key={i} className={detailRowClass(i)}>
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

        <table className={COMPACT_TABLE}>
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
              <tr key={i} className={detailRowClass(i)}>
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

        {sections.length > 0 ? (
          <table className={cn(COMPACT_TABLE, "-ml-px justify-self-end")}>
            <thead>
              <tr>
                <Th>Show Section</Th>
                <Th right>Party</Th>
                <Th right>Total Amount</Th>
              </tr>
            </thead>
            <tbody>
              {sections.map((s, i) => (
                <tr key={i} className={detailRowClass(i)}>
                  <Td>{s.ShowSection || "-"}</Td>
                  <Td right>{n(s.PartyNo)}</Td>
                  <Td right>{fmt(n(s.TotalAmount))}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div />
        )}
      </div>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

type ManagerCheckoutViewProps = {
  rawData: unknown
  subtitle: string
  generatedAt: string
  drillContext?: ReportDrillContext
}

export function ManagerCheckoutView({ rawData, subtitle, generatedAt, drillContext }: ManagerCheckoutViewProps) {
  const shows = Array.isArray(rawData) ? (rawData as ManagerCheckoutApiShow[]) : []
  const [activeCheckedInDrill, setActiveCheckedInDrill] = useState<CheckedInDrillConfig | null>(null)

  if (!shows.length) {
    return (
      <div className="flex min-h-64 items-center justify-center text-sm text-muted-foreground">
        No records found
      </div>
    )
  }

  return (
    <div className="space-y-3 p-4" data-report-export-root>
      {/* Report header */}
      <div className="flex flex-wrap items-end justify-between gap-2 rounded-xl border border-border/70 bg-muted/10 px-4 py-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Manager Checkout</h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <p className="text-xs text-muted-foreground">Generated {generatedAt}</p>
      </div>

      {shows.map((show, idx) => {
        const ticketPriceStr = (show.TicketPrice ?? [])
          .map((p) => {
            const num = Number(p)
            return Number.isFinite(num) ? fmt(num) : `$${p}`
          })
          .join(", ") || "N/A"

        return (
          <div key={show.ShowId ?? idx} className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
            {/* Show header */}
            <SectionLabel>{show.Location || "—"} — Manager Checkout</SectionLabel>
            <div className="grid grid-cols-1 gap-x-6 gap-y-1.5 px-3 py-2 text-xs sm:grid-cols-2 lg:grid-cols-3">
              <div className="grid min-w-0 grid-cols-[5rem_minmax(0,1fr)] gap-2 sm:flex sm:gap-2">
                <span className="font-medium text-muted-foreground">Show Date:</span>
                <span className="min-w-0 break-words tabular-nums">{show.DateStr || "—"}</span>
              </div>
              <div className="grid min-w-0 grid-cols-[5rem_minmax(0,1fr)] gap-2 sm:flex sm:gap-2">
                <span className="font-medium text-muted-foreground">Show Time:</span>
                <span className="min-w-0 break-words">{show.TimeStr || "—"}</span>
              </div>
              <div className="flex min-w-0 flex-wrap gap-x-2 gap-y-1">
                <span className="font-medium text-muted-foreground">Booked:</span>
                <span>{n(show.Booked)}</span>
                <span className="font-medium text-muted-foreground ml-3">(Pre) Seat:</span>
                <span>{n(show.PreSeated)}</span>
              </div>
              <div className="grid min-w-0 grid-cols-[5rem_minmax(0,1fr)] gap-2 sm:flex sm:gap-2">
                <span className="font-medium text-muted-foreground">Comic Name:</span>
                <span className="min-w-0 break-words font-medium">{show.Comic || "—"}</span>
              </div>
              <div className="grid min-w-0 grid-cols-[5rem_minmax(0,1fr)] gap-2 sm:flex sm:gap-2">
                <span className="font-medium text-muted-foreground">Ticket Price:</span>
                <span className="min-w-0 break-words">{ticketPriceStr}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium text-muted-foreground">Total Receipts:</span>
                <span>{String(show.TotalReceipts ?? show.TotalRecipts ?? "N/A")}</span>
              </div>
            </div>

            <div className="space-y-4 p-3">
              {/* 1 — Payment breakdown */}
              <PaymentTable show={show} drillContext={drillContext} />

              {/* 2–3 — Checked-In, sources, origin, and show sections */}
              <ManagerCheckoutDetailTables
                show={show}
                drillContext={drillContext}
                onDrillCheckedIn={setActiveCheckedInDrill}
              />
            </div>
          </div>
        )
      })}

      <p className="text-right text-xs text-muted-foreground">
        {shows.length} show{shows.length !== 1 ? "s" : ""}
      </p>

      {activeCheckedInDrill && drillContext && (() => {
        const countKey =
          activeCheckedInDrill.drillType === "CheckInPaid" ? "PaidCount" :
          activeCheckedInDrill.drillType === "CheckInComp" ? "CompCount" :
          activeCheckedInDrill.drillType === "CheckInDisc" ? "DiscCount" :
          activeCheckedInDrill.drillType

        return (
          <ReportDrillDialog
            title="Manager CheckOut - Drill Down CheckIn Counts"
            endpoint="ManagerCheckOutDrillDown"
            body={{
              Connection: drillContext.connectionName,
              StartDate: drillContext.startDate,
              EndDate: drillContext.endDate,
              LocaltionId: drillContext.locationId,
              ShowId: activeCheckedInDrill.showId,
              DrillType: activeCheckedInDrill.drillType,
            }}
            columns={[
              { key: "CustLName", label: "Customer Last Name", keys: ["CustLName", "LastName", "Lname"] },
              { key: "CustFName", label: "Customer First Name", keys: ["CustFName", "FirstName", "Fname"] },
              {
                key: countKey,
                label: countKey,
                format: "number",
                right: true,
                keys: [countKey, "Discount", "discount", "Count", "count"]
              }
            ]}
            footerTotals
            isZero={activeCheckedInDrill.isZero}
            filterRows={(row) => {
              const val = row[countKey] ?? row["Discount"] ?? row["discount"] ?? 0
              const count = typeof val === "number" ? val : parseFloat(String(val))
              return Number.isFinite(count) && count !== 0
            }}
            onClose={() => setActiveCheckedInDrill(null)}
          />
        )
      })()}
    </div>
  )
}
