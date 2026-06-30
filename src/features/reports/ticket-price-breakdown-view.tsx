import dayjs from "dayjs"
import {
  ReportCard,
  ReportEmpty,
  ReportHeader,
  ReportShowHeader,
  ReportTable,
  ReportTableScroll,
  ReportTd,
  ReportTh,
  ReportViewShell,
  reportRowClass,
} from "@/features/reports/report-ui"

type SectionRow = {
  ShowSection?: string
  Available?: number
  Sold?: number
  Scanned?: number
  Paid?: number
  GrandTotal?: number
}

type ShowRow = {
  ShowId?: string | number
  ShowDate?: string
  ShowTime?: string
  ComicStageName?: string
  ComicFirstName?: string
  ComicLastName?: string
  TotalSeat?: number
  SectionList?: SectionRow[]
} & SectionRow

type Props = {
  rawData: unknown
  subtitle: string
  generatedAt: string
}

function fmtDate(v: string | undefined): string {
  if (!v) return "—"
  const d = dayjs(v)
  return d.isValid() ? d.format("MM/DD/YYYY") : v
}

function num(v: number | undefined | null): number {
  return v ?? 0
}

function fmtCurrency(v: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v)
}

function groupByShow(rawData: unknown): ShowRow[] {
  if (!Array.isArray(rawData)) return []

  const map = new Map<string | number, ShowRow>()
  for (const row of rawData as ShowRow[]) {
    const id = row.ShowId ?? `${row.ShowDate}-${row.ShowTime}`
    if (!map.has(id)) {
      map.set(id, {
        ShowId: id,
        ShowDate: row.ShowDate,
        ShowTime: row.ShowTime,
        ComicStageName: row.ComicStageName ?? `${row.ComicFirstName ?? ""} ${row.ComicLastName ?? ""}`.trim(),
        TotalSeat: row.TotalSeat,
        SectionList: [],
      })
    }
    const show = map.get(id)!
    if (row.ShowSection) {
      show.SectionList!.push({
        ShowSection: row.ShowSection,
        Available: row.Available,
        Sold: row.Sold,
        Scanned: row.Scanned,
        Paid: row.Paid,
        GrandTotal: row.GrandTotal,
      })
    }
  }

  return Array.from(map.values())
}

export function TicketPriceBreakdownView({ rawData, subtitle, generatedAt }: Props) {
  const shows = groupByShow(rawData)

  if (!shows.length) {
    return <ReportEmpty />
  }

  return (
    <ReportViewShell>
      <ReportHeader title="Ticket Price Breakdown" subtitle={subtitle} generatedAt={generatedAt} />

      <div className="space-y-3">
        {shows.map((show, showIdx) => {
          const totalAvail = show.SectionList?.reduce((s, r) => s + num(r.Available), 0) ?? 0
          const totalSold  = show.SectionList?.reduce((s, r) => s + num(r.Sold), 0) ?? 0
          const totalScan  = show.SectionList?.reduce((s, r) => s + num(r.Scanned), 0) ?? 0
          const totalPaid  = show.SectionList?.reduce((s, r) => s + num(r.Paid), 0) ?? 0
          const grandTotal = show.SectionList?.reduce((s, r) => s + num(r.GrandTotal), 0) ?? 0

          return (
            <ReportCard key={showIdx}>
              <ReportShowHeader>
                <span className="font-semibold text-sm text-foreground">
                  {fmtDate(show.ShowDate)}
                </span>
                <span className="text-xs text-muted-foreground">{show.ShowTime}</span>
                <span className="text-xs font-medium text-foreground">{show.ComicStageName}</span>
                {show.TotalSeat != null && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {show.TotalSeat} total seats
                  </span>
                )}
              </ReportShowHeader>

              <ReportTableScroll>
                <ReportTable>
                  <thead>
                    <tr>
                      <ReportTh>Section</ReportTh>
                      <ReportTh right>Available</ReportTh>
                      <ReportTh right>Sold</ReportTh>
                      <ReportTh right>Scanned</ReportTh>
                      <ReportTh right>Paid</ReportTh>
                      <ReportTh right>Grand Total</ReportTh>
                    </tr>
                  </thead>
                  <tbody>
                    {(show.SectionList ?? []).map((sec, i) => (
                      <tr key={i} className={reportRowClass(i)}>
                        <ReportTd>{sec.ShowSection ?? "—"}</ReportTd>
                        <ReportTd right>{num(sec.Available)}</ReportTd>
                        <ReportTd right>{num(sec.Sold)}</ReportTd>
                        <ReportTd right>{num(sec.Scanned)}</ReportTd>
                        <ReportTd right>{num(sec.Paid)}</ReportTd>
                        <ReportTd right>{fmtCurrency(num(sec.GrandTotal))}</ReportTd>
                      </tr>
                    ))}
                    <tr className="bg-muted/40 font-semibold">
                      <ReportTd bold>Total</ReportTd>
                      <ReportTd right bold>{totalAvail}</ReportTd>
                      <ReportTd right bold>{totalSold}</ReportTd>
                      <ReportTd right bold>{totalScan}</ReportTd>
                      <ReportTd right bold>{totalPaid}</ReportTd>
                      <ReportTd right bold>{fmtCurrency(grandTotal)}</ReportTd>
                    </tr>
                  </tbody>
                </ReportTable>
              </ReportTableScroll>
            </ReportCard>
          )
        })}
      </div>

      <p className="text-right text-xs text-muted-foreground">
        {shows.length} show{shows.length !== 1 ? "s" : ""}
      </p>
    </ReportViewShell>
  )
}
