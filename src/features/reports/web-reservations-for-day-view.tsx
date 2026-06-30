import { cn } from "@/lib/utils"
import dayjs from "dayjs"

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

  // Pre-grouped parent rows with WebReservationChildList
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

  // Flat API list — group by show date AND show time (WPF child filter uses both)
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

  // Preserve first-seen order from API (same as WPF iteration)
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

// ─── Table primitives ─────────────────────────────────────────────────────────

function Th({ children, className, center, right }: {
  children?: React.ReactNode; className?: string; center?: boolean; right?: boolean
}) {
  return (
    <th className={cn(
      "border-b border-border px-2 py-1.5 text-[13px] font-bold text-foreground whitespace-nowrap",
      center && "text-center",
      right && "text-right",
      className
    )}>
      {children}
    </th>
  )
}

function Td({ children, className, center, right, colSpan }: {
  children?: React.ReactNode; className?: string; center?: boolean; right?: boolean; colSpan?: number
}) {
  return (
    <td
      colSpan={colSpan}
      className={cn(
      "border-b border-border/60 px-2 py-2 text-[13px] whitespace-nowrap",
      center && "text-center",
      right && "text-right tabular-nums",
      className
    )}>
      {children}
    </td>
  )
}

// ─── Show section ─────────────────────────────────────────────────────────────

function ShowSection({ group }: { group: WebReservationShowGroup }) {
  return (
    <div className="border-b border-border py-4 last:border-b-0">
      <p className="text-center text-sm font-semibold text-foreground">
        Web Reservation For Shows On: {group.showDate}
      </p>
      <p className="mt-1 text-center text-sm font-semibold text-foreground">
        For: {group.showTime}, {group.comicName}
      </p>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr>
              <Th className="w-[28%]">Customer Name</Th>
              <Th center className="w-[12%]">C\C Type</Th>
              <Th center className="w-[12%]">Promotion</Th>
              <Th center className="w-[14%]">Section</Th>
              <Th center className="w-[10%]">Dinner</Th>
              <Th center className="w-[12%]"># in Party</Th>
              <Th right className="w-[12%]">Total</Th>
            </tr>
          </thead>
          <tbody>
            {group.reservations.map((row, i) => (
              <tr key={i} className={i % 2 === 1 ? "bg-muted/15" : undefined}>
                <Td>{row.customerName}</Td>
                <Td center>{row.ccType || "—"}</Td>
                <Td center>{row.promotion || ""}</Td>
                <Td center>{row.section || "—"}</Td>
                <Td center>{row.dinner || "—"}</Td>
                <Td center>{row.inParty}</Td>
                <Td right>$ {fmtMoney(row.total)}</Td>
              </tr>
            ))}
            <tr className="bg-muted/10">
              <Td colSpan={4} />
              <Td center className="font-bold">Total</Td>
              <Td center className="font-bold">{group.totalInParty}</Td>
              <Td right className="font-bold">$ {fmtMoney(group.totalAmount)}</Td>
            </tr>
          </tbody>
        </table>
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
    return (
      <div className="flex min-h-64 items-center justify-center text-sm text-muted-foreground">
        No records found
      </div>
    )
  }

  const reservationCount = groups.reduce((s, g) => s + g.reservations.length, 0)

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-wrap items-end justify-between gap-2 rounded-xl border border-border/70 bg-muted/10 px-4 py-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Web Reservations for Day</h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <p className="text-xs text-muted-foreground">Generated {generatedAt}</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
        <p className="border-b border-border py-3 text-center text-xl font-bold text-foreground">
          CLUB Name: {clubName}
        </p>
        <div className="px-4">
          {groups.map((group, i) => (
            <ShowSection key={`${group.showDate}-${group.showTime}-${i}`} group={group} />
          ))}
        </div>
      </div>

      <p className="text-right text-xs text-muted-foreground">
        {reservationCount} reservation{reservationCount !== 1 ? "s" : ""} across {groups.length} show{groups.length !== 1 ? "s" : ""}
      </p>
    </div>
  )
}
