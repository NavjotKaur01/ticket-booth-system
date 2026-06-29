import dayjs from "dayjs"
import { Fragment } from "react"
import { cn } from "@/lib/utils"

// ─── API shape (GetPromoReport) ───────────────────────────────────────────────

type PromoApiRow = {
  PromoName?: string
  Comic?: string
  ShowDate?: string | Date
  PartyOrgin?: number
  ChecekedIn?: number
  CheckedIn?: number
  Day?: string
}

type PromoDetail = { made: number; ci: number; perc: number }
type PromoHeader = { name: string }
type PromoRow = {
  showDate: string
  comic: string
  day: string
  details: PromoDetail[]
}
type PromoReportData = {
  headers: PromoHeader[]
  rows: PromoRow[]
  footer: PromoDetail[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toNum(v: unknown): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function calcPerc(ci: number, made: number): number {
  if (!made) return 0
  return Math.round(((ci / made) * 100 + Number.EPSILON) * 100) / 100
}

function fmtDate(v: string | Date | undefined): string {
  if (!v) return "—"
  const d = dayjs(v)
  return d.isValid() ? d.format("MM/DD/YYYY") : String(v)
}

function normalizeRows(raw: unknown): PromoApiRow[] {
  if (!Array.isArray(raw)) return []
  return raw as PromoApiRow[]
}

/** Mirrors WPF ReportVM.getpromoreport pivot logic. */
export function buildPromoReportData(raw: unknown): PromoReportData {
  const allPromo = normalizeRows(raw).map((row) => ({
    promoName: String(row.PromoName ?? ""),
    comic: String(row.Comic ?? ""),
    showDate: row.ShowDate,
    showDateKey: row.ShowDate ? dayjs(row.ShowDate).format("YYYY-MM-DD") : "",
    partyOrgin: toNum(row.PartyOrgin),
    checkedIn: toNum(row.ChecekedIn ?? row.CheckedIn),
    day: String(row.Day ?? ""),
  }))

  if (!allPromo.length) {
    return { headers: [], rows: [], footer: [] }
  }

  // Column headers: one per promo name (ordered by first show date) + Grand Total
  const headerNames = Array.from(
    allPromo.reduce((map, row) => {
      if (!row.promoName) return map
      if (!map.has(row.promoName)) {
        map.set(row.promoName, row.showDate ? dayjs(row.showDate).valueOf() : 0)
      }
      return map
    }, new Map<string, number>())
  )
    .sort((a, b) => a[1] - b[1])
    .map(([name]) => name)

  const headers: PromoHeader[] = [
    ...headerNames.map((name) => ({ name })),
    { name: "Grand Total" },
  ]

  // One row per show date
  const dateKeys = Array.from(
    new Set(allPromo.map((r) => r.showDateKey).filter(Boolean))
  ).sort()

  const rows: PromoRow[] = dateKeys.map((dateKey) => {
    const dateRows = allPromo.filter((r) => r.showDateKey === dateKey)
    const first = dateRows[0]
    let madeTotal = 0
    let ciTotal = 0

    const details = headers.map((header) => {
      if (header.name === "Grand Total") {
        return {
          made: madeTotal,
          ci: ciTotal,
          perc: calcPerc(ciTotal, madeTotal),
        }
      }

      const match = dateRows.find((r) => r.promoName === header.name)
      if (match) {
        madeTotal += match.partyOrgin
        ciTotal += match.checkedIn
        return {
          made: match.partyOrgin,
          ci: match.checkedIn,
          perc: calcPerc(match.checkedIn, match.partyOrgin),
        }
      }

      return { made: 0, ci: 0, perc: 0 }
    })

    return {
      showDate: fmtDate(first?.showDate),
      comic: first?.comic ?? "",
      day: first?.day ?? "",
      details,
    }
  })

  // Footer: totals per promo column + grand total (sum of row grand-total columns)
  const footerByPromo = headerNames.map((name) => {
    const promoRows = allPromo.filter((r) => r.promoName === name)
    const made = promoRows.reduce((s, r) => s + r.partyOrgin, 0)
    const ci = promoRows.reduce((s, r) => s + r.checkedIn, 0)
    return { made, ci, perc: calcPerc(ci, made) }
  })

  const grandFooter = rows.reduce(
    (acc, row) => {
      const gt = row.details[row.details.length - 1]
      return {
        made: acc.made + gt.made,
        ci: acc.ci + gt.ci,
        perc: 0,
      }
    },
    { made: 0, ci: 0, perc: 0 }
  )
  grandFooter.perc = calcPerc(grandFooter.ci, grandFooter.made)

  return {
    headers,
    rows,
    footer: [...footerByPromo, grandFooter],
  }
}

// ─── Table primitives ─────────────────────────────────────────────────────────

function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <th className={cn(
      "border border-border bg-muted/50 px-2 py-1 text-[11px] font-semibold text-muted-foreground whitespace-nowrap",
      className
    )}>
      {children}
    </th>
  )
}

function Td({ children, className, bold, colSpan }: {
  children: React.ReactNode; className?: string; bold?: boolean; colSpan?: number
}) {
  return (
    <td
      colSpan={colSpan}
      className={cn(
      "border border-border px-2 py-1.5 text-xs whitespace-nowrap tabular-nums",
      bold && "font-semibold",
      className
    )}>
      {children}
    </td>
  )
}

function PromoDetailCells({ detail }: { detail: PromoDetail }) {
  return (
    <>
      <Td>{detail.made}</Td>
      <Td>{detail.ci}</Td>
      <Td>{detail.perc}%</Td>
    </>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

type PromoReportViewProps = {
  rawData: unknown
  subtitle: string
  generatedAt: string
}

export function PromoReportView({ rawData, subtitle, generatedAt }: PromoReportViewProps) {
  const { headers, rows, footer } = buildPromoReportData(rawData)

  if (!rows.length) {
    return (
      <div className="flex min-h-64 items-center justify-center text-sm text-muted-foreground">
        No records found
      </div>
    )
  }

  return (
    <div className="space-y-3 p-4">
      <div className="flex flex-wrap items-end justify-between gap-2 rounded-xl border border-border/70 bg-muted/10 px-4 py-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Promo Report</h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <p className="text-xs text-muted-foreground">Generated {generatedAt}</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              {/* Row 1: promo group headers */}
              <tr>
                <Th className="min-w-[5.5rem]">Show Date</Th>
                <Th className="min-w-[6.5rem]">Comic</Th>
                <Th className="min-w-[3.5rem]">Day</Th>
                {headers.map((h) => (
                  <th
                    key={h.name}
                    colSpan={3}
                    className="border border-border bg-muted/50 px-2 py-1 text-center text-[11px] font-semibold text-muted-foreground whitespace-nowrap"
                  >
                    {h.name}
                  </th>
                ))}
              </tr>
              {/* Row 2: Made / C/I / Perc sub-headers */}
              <tr>
                <Th />
                <Th />
                <Th />
                {headers.map((h) => (
                  <Fragment key={h.name}>
                    <Th className="text-center w-10">Made</Th>
                    <Th className="text-center w-10">C/I</Th>
                    <Th className="text-center w-12">Perc</Th>
                  </Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.showDate} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                  <Td>{row.showDate}</Td>
                  <Td>{row.comic}</Td>
                  <Td>{row.day}</Td>
                  {row.details.map((detail, di) => (
                    <PromoDetailCells key={di} detail={detail} />
                  ))}
                </tr>
              ))}
              {/* Footer total row */}
              <tr className="bg-muted/30">
                <Td bold colSpan={3}>Total</Td>
                {footer.map((detail, i) => (
                  <Fragment key={i}>
                    <Td bold>{detail.made}</Td>
                    <Td bold>{detail.ci}</Td>
                    <Td bold>{detail.perc}%</Td>
                  </Fragment>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-right text-xs text-muted-foreground">
        {rows.length} show date{rows.length !== 1 ? "s" : ""}
      </p>
    </div>
  )
}
