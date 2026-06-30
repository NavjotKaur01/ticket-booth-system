import dayjs from "dayjs"
import { Fragment } from "react"
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

function PromoDetailCells({ detail }: { detail: PromoDetail }) {
  return (
    <>
      <ReportTd right>{detail.made}</ReportTd>
      <ReportTd right>{detail.ci}</ReportTd>
      <ReportTd right>{detail.perc}%</ReportTd>
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
    return <ReportEmpty />
  }

  return (
    <ReportViewShell>
      <ReportHeader title="Promo Report" subtitle={subtitle} generatedAt={generatedAt} />

      <ReportCard>
        <ReportTableScroll>
          <ReportTable>
            <thead>
              <tr>
                <ReportTh className="min-w-[5.5rem]">Show Date</ReportTh>
                <ReportTh className="min-w-[6.5rem]">Comic</ReportTh>
                <ReportTh className="min-w-[3.5rem]">Day</ReportTh>
                {headers.map((h) => (
                  <ReportTh key={h.name} colSpan={3} center>
                    {h.name}
                  </ReportTh>
                ))}
              </tr>
              <tr>
                <ReportTh />
                <ReportTh />
                <ReportTh />
                {headers.map((h) => (
                  <Fragment key={h.name}>
                    <ReportTh center className="w-10">Made</ReportTh>
                    <ReportTh center className="w-10">C/I</ReportTh>
                    <ReportTh center className="w-12">Perc</ReportTh>
                  </Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.showDate} className={reportRowClass(i)}>
                  <ReportTd>{row.showDate}</ReportTd>
                  <ReportTd>{row.comic}</ReportTd>
                  <ReportTd>{row.day}</ReportTd>
                  {row.details.map((detail, di) => (
                    <PromoDetailCells key={di} detail={detail} />
                  ))}
                </tr>
              ))}
              <tr className="bg-muted/30">
                <ReportTd bold colSpan={3}>Total</ReportTd>
                {footer.map((detail, i) => (
                  <Fragment key={i}>
                    <ReportTd bold right>{detail.made}</ReportTd>
                    <ReportTd bold right>{detail.ci}</ReportTd>
                    <ReportTd bold right>{detail.perc}%</ReportTd>
                  </Fragment>
                ))}
              </tr>
            </tbody>
          </ReportTable>
        </ReportTableScroll>
      </ReportCard>

      <p className="text-right text-xs text-muted-foreground">
        {rows.length} show date{rows.length !== 1 ? "s" : ""}
      </p>
    </ReportViewShell>
  )
}
