import { cn } from "@/lib/utils"
import dayjs from "dayjs"

// ─── Types ────────────────────────────────────────────────────────────────────

type SaleByShowPromo = {
  promo: string
  party: number
  checkedIn: number
  checkinPaid: number
  checkinComp: number
  checkinDisc: number
}

type SaleByShowShow = {
  showId: string
  showTm: string
  comicName: string
  showPrice: number
  party: number
  checkedIn: number
  checkinPaid: number
  checkinComp: number
  checkinDisc: number
  discount: number
  dailyPaid: number
  defCollected: number
  net: number
  promos: SaleByShowPromo[]
  partyTotal: number
  checkedInTotal: number
  checkinPaidTotal: number
  checkinCompTotal: number
  checkinDiscTotal: number
}

export type SaleByShowDateGroup = {
  showDate: string
  locName: string
  shows: SaleByShowShow[]
}

type ApiRow = Record<string, unknown>

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

function fmtSaleByShowHeaderDate(v: unknown): string {
  if (!v) return "—"
  const d = dayjs(String(v))
  return d.isValid() ? d.format("M/D/YYYY h:mm:ss A") : String(v)
}

function fmtShowTm(v: unknown): string {
  if (v == null || v === "") return "—"
  const str = String(v).trim()
  if (/^\d{1,2}:\d{2}\s?(AM|PM)$/i.test(str) || /^\d{1,2}:\d{2}(AM|PM)$/i.test(str)) {
    return str
  }
  const parsed = dayjs(str)
  if (!parsed.isValid()) return str
  if (parsed.year() <= 1) return str
  return parsed.format("h:mm A").replace(" ", "")
}

function mapPromo(row: ApiRow): SaleByShowPromo {
  return {
    promo: String(row.Promo ?? ""),
    party: toNum(row.Party),
    checkedIn: toNum(row.CheckedIn),
    checkinPaid: toNum(row.CheckinPaid),
    checkinComp: toNum(row.CheckinComp),
    checkinDisc: toNum(row.CheckinDisc),
  }
}

/** Mirrors WPF ReportVM.GetSalesByShow(). */
export function buildSalesByShowData(raw: unknown): SaleByShowDateGroup[] {
  if (!Array.isArray(raw)) return []

  return (raw as ApiRow[]).map((parent) => {
    const showList = Array.isArray(parent.ShowAndComedianList)
      ? (parent.ShowAndComedianList as ApiRow[])
      : Array.isArray(parent.SaleByShowDateData)
        ? (parent.SaleByShowDateData as ApiRow[])
        : []

    const shows: SaleByShowShow[] = showList.map((item) => {
      const promoData = (item.PromoNewCountData ?? item) as ApiRow
      const promos = Array.isArray(item.SaleByShowPromoList)
        ? (item.SaleByShowPromoList as ApiRow[]).map(mapPromo)
        : []

      const dailyPaid = toNum(item.DailyPaid)
      const defCollected = toNum(item.DefCollected)

      return {
        showId: String(item.ShowID ?? item.ShowId ?? ""),
        showTm: fmtShowTm(item.ShowTm ?? item.ShowTimeStr),
        comicName: String(item.ComicName ?? ""),
        showPrice: toNum(item.ShowPrice),
        party: toNum(promoData.Party),
        checkedIn: toNum(promoData.CheckedIn),
        checkinPaid: toNum(promoData.CheckinPaid),
        checkinComp: toNum(promoData.CheckinComp),
        checkinDisc: toNum(promoData.CheckinDisc),
        discount: toNum(item.Discount),
        dailyPaid,
        defCollected,
        net: dailyPaid + defCollected,
        promos,
        partyTotal: promos.reduce((s, p) => s + p.party, 0),
        checkedInTotal: promos.reduce((s, p) => s + p.checkedIn, 0),
        checkinPaidTotal: promos.reduce((s, p) => s + p.checkinPaid, 0),
        checkinCompTotal: promos.reduce((s, p) => s + p.checkinComp, 0),
        checkinDiscTotal: promos.reduce((s, p) => s + p.checkinDisc, 0),
      }
    })

    return {
      showDate: fmtSaleByShowHeaderDate(parent.ShowDate),
      locName: String(parent.LocName ?? parent.LocsName ?? ""),
      shows,
    }
  })
}

// ─── Table primitives ─────────────────────────────────────────────────────────

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={cn(
      "border border-border bg-muted/40 px-2 py-1 text-left text-[11px] font-semibold text-muted-foreground whitespace-nowrap",
      className
    )}>
      {children}
    </th>
  )
}

function Td({ children, className, right, blue, bold }: {
  children: React.ReactNode; className?: string; right?: boolean; blue?: boolean; bold?: boolean
}) {
  return (
    <td className={cn(
      "border border-border px-2 py-1 text-xs whitespace-nowrap",
      right && "text-right tabular-nums",
      blue && "text-blue-600 font-medium",
      bold && "font-semibold",
      className
    )}>
      {children}
    </td>
  )
}

// ─── Show block ───────────────────────────────────────────────────────────────

function ShowBlock({ show }: { show: SaleByShowShow }) {
  return (
    <div className="border-b border-border last:border-b-0">
      {/* Main show row */}
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr>
            <Th>Show Time</Th>
            <Th>Comedian</Th>
            <Th right>Price</Th>
            <Th right>Booked</Th>
            <Th right>Seated</Th>
            <Th right>F-Paid</Th>
            <Th right>Comp</Th>
            <Th right>Disc</Th>
            <Th right>Disc Val</Th>
            <Th right>Show Day</Th>
            <Th right>Deffered Coll</Th>
            <Th right>Tax</Th>
            <Th right>Net Door</Th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <Td>{show.showTm}</Td>
            <Td>{show.comicName}</Td>
            <Td right>{fmtMoney(show.showPrice)}</Td>
            <Td right>{show.party}</Td>
            <Td right>{show.checkedIn}</Td>
            <Td right>{show.checkinPaid}</Td>
            <Td right>{show.checkinComp}</Td>
            <Td right>{show.checkinDisc}</Td>
            <Td right>{fmtMoney(show.discount)}</Td>
            <Td right>{fmtMoney(show.dailyPaid)}</Td>
            <Td right>{fmtMoney(show.defCollected)}</Td>
            <Td right />
            <Td right>{fmtMoney(show.net)}</Td>
          </tr>
        </tbody>
      </table>

      {/* Promo sub-table */}
      <div className="overflow-x-auto pl-8 pb-2">
        <table className="border-collapse text-xs">
          <thead>
            <tr>
              <Th className="min-w-24">Promotion</Th>
              <Th right className="min-w-16">Party</Th>
              <Th right className="min-w-16">Seated</Th>
              <Th right className="min-w-16">Paid</Th>
              <Th right className="min-w-16">Comp</Th>
              <Th right className="min-w-16">Disc</Th>
            </tr>
          </thead>
          <tbody>
            {show.promos.length === 0 ? (
              <tr>
                <Td colSpan={6} className="text-muted-foreground">—</Td>
              </tr>
            ) : (
              show.promos.map((p, i) => (
                <tr key={i}>
                  <Td>{p.promo || "—"}</Td>
                  <Td right>{p.party}</Td>
                  <Td right>{p.checkedIn}</Td>
                  <Td right>{p.checkinPaid}</Td>
                  <Td right>{p.checkinComp}</Td>
                  <Td right>{p.checkinDisc}</Td>
                </tr>
              ))
            )}
            {/* Totals row */}
            <tr className="bg-muted/20">
              <Td />
              <Td right bold>{show.partyTotal}</Td>
              <Td right bold>{show.checkedInTotal}</Td>
              <Td right bold blue>{show.checkinPaidTotal}</Td>
              <Td right bold blue>{show.checkinCompTotal}</Td>
              <Td right bold blue>{show.checkinDiscTotal}</Td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Date group ───────────────────────────────────────────────────────────────

function DateGroupCard({ group }: { group: SaleByShowDateGroup }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
      <div className="bg-[#155abb] px-3 py-1.5 text-xs font-semibold text-white">
        Sales Show for : {group.showDate}
        {group.locName ? ` — ${group.locName}` : ""}
      </div>
      <div className="bg-neutral-400/30 px-3 py-1 text-center text-xs font-medium text-foreground">
        Number of Items
      </div>
      <div className="divide-y divide-border">
        {group.shows.map((show) => (
          <ShowBlock key={show.showId || `${show.showTm}-${show.comicName}`} show={show} />
        ))}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

type Props = {
  rawData: unknown
  subtitle: string
  generatedAt: string
}

export function SalesByShowView({ rawData, subtitle, generatedAt }: Props) {
  const groups = buildSalesByShowData(rawData)

  if (!groups.length || groups.every((g) => !g.shows.length)) {
    return (
      <div className="flex min-h-64 items-center justify-center text-sm text-muted-foreground">
        No records found
      </div>
    )
  }

  const showCount = groups.reduce((s, g) => s + g.shows.length, 0)

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-wrap items-end justify-between gap-2 rounded-xl border border-border/70 bg-muted/10 px-4 py-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Sales By Show</h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <p className="text-xs text-muted-foreground">Generated {generatedAt}</p>
      </div>

      {groups.map((group, i) => (
        <DateGroupCard key={`${group.showDate}-${i}`} group={group} />
      ))}

      <p className="text-right text-xs text-muted-foreground">
        {showCount} show{showCount !== 1 ? "s" : ""} across {groups.length} date group{groups.length !== 1 ? "s" : ""}
      </p>
    </div>
  )
}
