import dayjs from "dayjs"
import {
  ReportCard,
  ReportCenteredHeading,
  ReportEmpty,
  ReportHeader,
  ReportTable,
  ReportTableScroll,
  ReportTd,
  ReportTh,
  ReportViewShell,
  reportRowClass,
} from "@/features/reports/report-ui"

// ─── Types ────────────────────────────────────────────────────────────────────

type WebReservationRow = {
  customerName: string
  ccType: string
  promotion: string
  section: string
  dinner: string
  inParty: number
  total: number
}

export type WebReservationShowGroup = {
  showDate: string
  showTime: string
  comicName: string
  reservations: WebReservationRow[]
  totalInParty: number
  totalAmount: number
}

type ApiRow = Record<string, unknown>

type FlatReservation = WebReservationRow & {
  showDate: unknown
  showTime: unknown
  comicName: string
  groupKey: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toNum(v: unknown): number {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? "0"))
  return Number.isFinite(n) ? n : 0
}

function fmtMoney(v: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v)
}

function fmtShowDateHeader(v: unknown): string {
  if (!v) return "—"
  const d = dayjs(String(v))
  return d.isValid() ? d.format("dddd, MMMM D, YYYY") : String(v)
}

function fmtShowTimeHeader(v: unknown): string {
  if (v == null || v === "") return "—"
  const str = String(v).trim()
  const parsed = dayjs(str)
  if (parsed.isValid() && parsed.year() > 1) {
    return parsed.format("hh:mm A")
  }
  if (/^\d{1,2}:\d{2}\s?(AM|PM)$/i.test(str)) return str.toUpperCase()
  return str
}

function buildGroupKey(showDate: unknown, showTime: unknown): string {
  const dateKey = dayjs(String(showDate)).isValid()
    ? dayjs(String(showDate)).format("YYYY-MM-DD")
    : String(showDate ?? "")
  const timeKey = dayjs(String(showTime)).isValid()
    ? dayjs(String(showTime)).format("HH:mm:ss")
    : String(showTime ?? "")
  return `${dateKey}|${timeKey}`
}

function mapCustomerName(row: ApiRow): string {
  const direct = String(row.CustomerName ?? "").trim()
  if (direct) return direct
  const composed = `${String(row.LastName ?? "").trim()} ${String(row.FirstName ?? "").trim()}`.trim()
  return composed || "—"
}

function mapReservationRow(row: ApiRow): WebReservationRow {
  return {
    customerName: mapCustomerName(row),
    ccType: String(row.CCType ?? ""),
    promotion: String(row.Promotion ?? ""),
    section: String(row.Section ?? ""),
    dinner: String(row.Dinner ?? ""),
    inParty: toNum(row.InParty),
    total: toNum(row.Total),
  }
}

function buildGroup(
  showDate: unknown,
  showTime: unknown,
  comicName: string,
  reservations: WebReservationRow[],
  totals?: { inParty: number; total: number }
): WebReservationShowGroup {
  return {
    showDate: fmtShowDateHeader(showDate),
    showTime: fmtShowTimeHeader(showTime),
    comicName,
    reservations,
    totalInParty: totals?.inParty ?? reservations.reduce((s, r) => s + r.inParty, 0),
    totalAmount: totals?.total ?? reservations.reduce((s, r) => s + r.total, 0),
  }
}

/** Mirrors WPF ReportVM.GetWebReservationForDayData(), grouping by show date + time. */
export function buildWebReservationsForDayData(raw: unknown): WebReservationShowGroup[] {
  if (!Array.isArray(raw) || raw.length === 0) return []

  if (raw.some((item) => Array.isArray((item as ApiRow).WebReservationChildList))) {
    return (raw as ApiRow[]).map((parent) => {
      const childList = (parent.WebReservationChildList as ApiRow[]) ?? []
      const footer = childList.find((c) => String(c.FooterVisibilty) === "Visible")
      const reservations = childList
        .filter((c) => String(c.FooterVisibilty ?? "Collapsed") !== "Visible")
        .map(mapReservationRow)

      return buildGroup(
        parent.ShowDate,
        parent.ShowTime,
        String(parent.ComicName ?? ""),
        reservations,
        footer ? { inParty: toNum(footer.InParty), total: toNum(footer.Total) } : undefined
      )
    })
  }

  const flat: FlatReservation[] = (raw as ApiRow[]).map((row) => ({
    ...mapReservationRow(row),
    showDate: row.ShowDate,
    showTime: row.ShowTime ?? row.ShowTimeStr,
    comicName: String(row.ComicName ?? ""),
    groupKey: buildGroupKey(row.ShowDate, row.ShowTime ?? row.ShowTimeStr),
  }))

  const grouped = new Map<string, FlatReservation[]>()
  for (const row of flat) {
    if (!grouped.has(row.groupKey)) grouped.set(row.groupKey, [])
    grouped.get(row.groupKey)!.push(row)
  }

  const seen = new Set<string>()
  const groups: WebReservationShowGroup[] = []

  for (const row of flat) {
    if (seen.has(row.groupKey)) continue
    seen.add(row.groupKey)

    const members = grouped.get(row.groupKey) ?? []
    groups.push(
      buildGroup(
        row.showDate,
        row.showTime,
        members[0]?.comicName ?? row.comicName,
        members.map((m) => ({
          customerName: m.customerName,
          ccType: m.ccType,
          promotion: m.promotion,
          section: m.section,
          dinner: m.dinner,
          inParty: m.inParty,
          total: m.total,
        }))
      )
    )
  }

  return groups
}

// ─── Show section ─────────────────────────────────────────────────────────────

function ShowSection({ group }: { group: WebReservationShowGroup }) {
  return (
    <div className="border-b border-border py-4 last:border-b-0">
      <ReportCenteredHeading>
        Web Reservation For Shows On: {group.showDate}
      </ReportCenteredHeading>
      <p className="mt-1 text-center text-sm font-semibold text-foreground">
        For: {group.showTime}, {group.comicName}
      </p>

      <div className="mt-3">
        <ReportTableScroll>
          <ReportTable className="min-w-[720px] table-fixed">
            <colgroup>
              <col style={{ width: "28%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "12%" }} />
            </colgroup>
            <thead>
              <tr>
                <ReportTh>Customer Name</ReportTh>
                <ReportTh center>C\C Type</ReportTh>
                <ReportTh center>Promotion</ReportTh>
                <ReportTh center>Section</ReportTh>
                <ReportTh center>Dinner</ReportTh>
                <ReportTh center># in Party</ReportTh>
                <ReportTh right>Total</ReportTh>
              </tr>
            </thead>
            <tbody>
              {group.reservations.map((row, i) => (
                <tr key={i} className={reportRowClass(i)}>
                  <ReportTd>{row.customerName}</ReportTd>
                  <ReportTd center>{row.ccType || "—"}</ReportTd>
                  <ReportTd center>{row.promotion || ""}</ReportTd>
                  <ReportTd center>{row.section || "—"}</ReportTd>
                  <ReportTd center>{row.dinner || "—"}</ReportTd>
                  <ReportTd center>{row.inParty}</ReportTd>
                  <ReportTd right>$ {fmtMoney(row.total)}</ReportTd>
                </tr>
              ))}
              <tr className="bg-muted/30">
                <ReportTd colSpan={4} />
                <ReportTd center bold>Total</ReportTd>
                <ReportTd center bold>{group.totalInParty}</ReportTd>
                <ReportTd right bold>$ {fmtMoney(group.totalAmount)}</ReportTd>
              </tr>
            </tbody>
          </ReportTable>
        </ReportTableScroll>
      </div>
    </div>
  )
}

// ─── Main view ────────────────────────────────────────────────────────────────

type Props = {
  rawData: unknown
  subtitle: string
  generatedAt: string
}

export function WebReservationsForDayView({ rawData, subtitle, generatedAt }: Props) {
  const groups = buildWebReservationsForDayData(rawData)
  const clubName = subtitle.split(" · ")[0] || subtitle

  if (!groups.length) {
    return <ReportEmpty />
  }

  const reservationCount = groups.reduce((s, g) => s + g.reservations.length, 0)

  return (
    <ReportViewShell>
      <ReportHeader title="Web Reservations for Day" subtitle={subtitle} generatedAt={generatedAt} />

      <ReportCard>
        <p className="border-b border-border px-4 py-3 text-center text-base font-semibold text-foreground">
          CLUB Name: {clubName}
        </p>
        <div className="px-4">
          {groups.map((group, i) => (
            <ShowSection key={`${group.showDate}-${group.showTime}-${i}`} group={group} />
          ))}
        </div>
      </ReportCard>

      <p className="text-right text-xs text-muted-foreground">
        {reservationCount} reservation{reservationCount !== 1 ? "s" : ""} across {groups.length} show{groups.length !== 1 ? "s" : ""}
      </p>
    </ReportViewShell>
  )
}
