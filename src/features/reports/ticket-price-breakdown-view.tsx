import dayjs from "dayjs"

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
          <h2 className="text-base font-semibold text-foreground">Ticket Price Breakdown</h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <p className="text-xs text-muted-foreground">Generated {generatedAt}</p>
      </div>

      <div className="space-y-3">
        {shows.map((show, showIdx) => {
          const totalAvail = show.SectionList?.reduce((s, r) => s + num(r.Available), 0) ?? 0
          const totalSold  = show.SectionList?.reduce((s, r) => s + num(r.Sold), 0) ?? 0
          const totalScan  = show.SectionList?.reduce((s, r) => s + num(r.Scanned), 0) ?? 0
          const totalPaid  = show.SectionList?.reduce((s, r) => s + num(r.Paid), 0) ?? 0
          const grandTotal = show.SectionList?.reduce((s, r) => s + num(r.GrandTotal), 0) ?? 0

          return (
            <div
              key={showIdx}
              className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm"
            >
              {/* Show header */}
              <div className="flex flex-wrap items-center gap-3 border-b border-border bg-muted/20 px-4 py-2.5">
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
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr>
                      {["Section", "Available", "Sold", "Scanned", "Paid", "Grand Total"].map((h, i) => (
                        <th
                          key={i}
                          className={`border border-border bg-muted/30 px-3 py-2 text-[11px] font-semibold tracking-wide text-muted-foreground whitespace-nowrap ${i > 0 ? "text-right" : "text-left"}`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(show.SectionList ?? []).map((sec, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                        <td className="border border-border px-3 py-2 text-xs">{sec.ShowSection ?? "—"}</td>
                        <td className="border border-border px-3 py-2 text-right text-xs tabular-nums">{num(sec.Available)}</td>
                        <td className="border border-border px-3 py-2 text-right text-xs tabular-nums">{num(sec.Sold)}</td>
                        <td className="border border-border px-3 py-2 text-right text-xs tabular-nums">{num(sec.Scanned)}</td>
                        <td className="border border-border px-3 py-2 text-right text-xs tabular-nums">{num(sec.Paid)}</td>
                        <td className="border border-border px-3 py-2 text-right text-xs tabular-nums">{fmtCurrency(num(sec.GrandTotal))}</td>
                      </tr>
                    ))}
                    {/* Subtotal row */}
                    <tr className="bg-muted/40 font-semibold">
                      <td className="border border-border px-3 py-2 text-xs">Total</td>
                      <td className="border border-border px-3 py-2 text-right text-xs tabular-nums">{totalAvail}</td>
                      <td className="border border-border px-3 py-2 text-right text-xs tabular-nums">{totalSold}</td>
                      <td className="border border-border px-3 py-2 text-right text-xs tabular-nums">{totalScan}</td>
                      <td className="border border-border px-3 py-2 text-right text-xs tabular-nums">{totalPaid}</td>
                      <td className="border border-border px-3 py-2 text-right text-xs tabular-nums">{fmtCurrency(grandTotal)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-right text-xs text-muted-foreground">
        {shows.length} show{shows.length !== 1 ? "s" : ""}
      </p>
    </div>
  )
}
