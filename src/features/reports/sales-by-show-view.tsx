import { useState } from "react"
import dayjs from "dayjs"
import {
  ReportCard,
  ReportEmpty,
  ReportHeader,
  ReportSectionBar,
  ReportTable,
  ReportTd,
  ReportTh,
  ReportViewShell,
  reportRowClass,
} from "@/features/reports/report-ui"
import { ReportDrillDialog, type DrillColumn } from "@/features/reports/report-drill-dialog"
import type { ReportDrillContext } from "@/features/reports/reports.service"

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

type SalesByShowDrillType = "CheckInPaid" | "CheckInComp" | "CheckInDisc"

type SalesByShowDrillTarget = {
  showId: string
  drillType: SalesByShowDrillType
  isZero: boolean
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

function drillCountKey(drillType: SalesByShowDrillType): string {
  if (drillType === "CheckInComp") return "CompCount"
  if (drillType === "CheckInDisc") return "DiscCount"
  return "PaidCount"
}

function buildSalesByShowDrillColumns(drillType: SalesByShowDrillType): DrillColumn[] {
  const countKey = drillCountKey(drillType)
  return [
    {
      key: "CustLName",
      label: "Cust LName",
      keys: ["CustLName", "LastName", "Lname"],
    },
    {
      key: "CustFName",
      label: "Cust FName",
      keys: ["CustFName", "FirstName", "Fname"],
    },
    {
      key: countKey,
      label: countKey,
      format: "number",
      right: true,
      keys: [countKey, "Discount", "discount", "Count", "count"],
    },
  ]
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

// ─── Drill cell ───────────────────────────────────────────────────────────────

function DrillCountCell({
  value,
  drillType,
  showId,
  canDrill,
  onDrill,
}: {
  value: number
  drillType: SalesByShowDrillType
  showId: string
  canDrill: boolean
  onDrill: (target: SalesByShowDrillTarget) => void
}) {
  if (!canDrill || !showId) {
    return <>{value}</>
  }

  return (
    <button
      type="button"
      className="font-semibold text-blue-600 transition-colors hover:text-blue-800 focus:outline-none dark:hover:text-blue-300"
      onClick={() => onDrill({ showId, drillType, isZero: value === 0 })}
    >
      {value}
    </button>
  )
}

// ─── Show block ───────────────────────────────────────────────────────────────

function ShowBlock({
  show,
  canDrill,
  onDrill,
}: {
  show: SaleByShowShow
  canDrill: boolean
  onDrill: (target: SalesByShowDrillTarget) => void
}) {
  return (
    <div className="border-b border-border last:border-b-0">
      {/* Main show row */}
      <ReportTable>
        <thead>
          <tr>
            <ReportTh>Show Time</ReportTh>
            <ReportTh>Comedian</ReportTh>
            <ReportTh right>Price</ReportTh>
            <ReportTh right>Booked</ReportTh>
            <ReportTh right>Seated</ReportTh>
            <ReportTh right>F-Paid</ReportTh>
            <ReportTh right>Comp</ReportTh>
            <ReportTh right>Disc</ReportTh>
            <ReportTh right>Disc Val</ReportTh>
            <ReportTh right>Show Day</ReportTh>
            <ReportTh right>Deffered Coll</ReportTh>
            <ReportTh right>Tax</ReportTh>
            <ReportTh right>Net Door</ReportTh>
          </tr>
        </thead>
        <tbody>
          <tr>
            <ReportTd>{show.showTm}</ReportTd>
            <ReportTd>{show.comicName}</ReportTd>
            <ReportTd right>{fmtMoney(show.showPrice)}</ReportTd>
            <ReportTd right>{show.party}</ReportTd>
            <ReportTd right>{show.checkedIn}</ReportTd>
            <ReportTd right>{show.checkinPaid}</ReportTd>
            <ReportTd right>{show.checkinComp}</ReportTd>
            <ReportTd right>{show.checkinDisc}</ReportTd>
            <ReportTd right>{fmtMoney(show.discount)}</ReportTd>
            <ReportTd right>{fmtMoney(show.dailyPaid)}</ReportTd>
            <ReportTd right>{fmtMoney(show.defCollected)}</ReportTd>
            <ReportTd right />
            <ReportTd right>{fmtMoney(show.net)}</ReportTd>
          </tr>
        </tbody>
      </ReportTable>

      {/* Promo sub-table */}
      <div className="overflow-x-auto pl-8 pb-2">
        <ReportTable>
          <thead>
            <tr>
              <ReportTh className="min-w-24">Promotion</ReportTh>
              <ReportTh right className="min-w-16">Party</ReportTh>
              <ReportTh right className="min-w-16">Seated</ReportTh>
              <ReportTh right className="min-w-16">Paid</ReportTh>
              <ReportTh right className="min-w-16">Comp</ReportTh>
              <ReportTh right className="min-w-16">Disc</ReportTh>
            </tr>
          </thead>
          <tbody>
            {show.promos.length === 0 ? (
              <tr>
                <ReportTd colSpan={6} className="text-muted-foreground">—</ReportTd>
              </tr>
            ) : (
              show.promos.map((p, i) => (
                <tr key={i} className={reportRowClass(i)}>
                  <ReportTd>{p.promo || "—"}</ReportTd>
                  <ReportTd right>{p.party}</ReportTd>
                  <ReportTd right>{p.checkedIn}</ReportTd>
                  <ReportTd right>{p.checkinPaid}</ReportTd>
                  <ReportTd right>{p.checkinComp}</ReportTd>
                  <ReportTd right>{p.checkinDisc}</ReportTd>
                </tr>
              ))
            )}
            <tr className="bg-muted/20">
              <ReportTd />
              <ReportTd right bold>{show.partyTotal}</ReportTd>
              <ReportTd right bold>{show.checkedInTotal}</ReportTd>
              <ReportTd right bold blue>
                <DrillCountCell
                  value={show.checkinPaidTotal}
                  drillType="CheckInPaid"
                  showId={show.showId}
                  canDrill={canDrill}
                  onDrill={onDrill}
                />
              </ReportTd>
              <ReportTd right bold blue>
                <DrillCountCell
                  value={show.checkinCompTotal}
                  drillType="CheckInComp"
                  showId={show.showId}
                  canDrill={canDrill}
                  onDrill={onDrill}
                />
              </ReportTd>
              <ReportTd right bold blue>
                <DrillCountCell
                  value={show.checkinDiscTotal}
                  drillType="CheckInDisc"
                  showId={show.showId}
                  canDrill={canDrill}
                  onDrill={onDrill}
                />
              </ReportTd>
            </tr>
          </tbody>
        </ReportTable>
      </div>
    </div>
  )
}

// ─── Date group ───────────────────────────────────────────────────────────────

function DateGroupCard({
  group,
  canDrill,
  onDrill,
}: {
  group: SaleByShowDateGroup
  canDrill: boolean
  onDrill: (target: SalesByShowDrillTarget) => void
}) {
  return (
    <ReportCard>
      <div className="bg-[#155abb] px-3 py-1.5 text-xs font-semibold text-white">
        Sales Show for : {group.showDate}
      </div>
      <ReportSectionBar>Number of Items</ReportSectionBar>
      <div className="divide-y divide-border">
        {group.shows.map((show) => (
          <ShowBlock
            key={show.showId || `${show.showTm}-${show.comicName}`}
            show={show}
            canDrill={canDrill}
            onDrill={onDrill}
          />
        ))}
      </div>
    </ReportCard>
  )
}

type Props = {
  rawData: unknown
  subtitle: string
  generatedAt: string
  drillContext?: ReportDrillContext
}

export function SalesByShowView({
  rawData,
  subtitle,
  generatedAt,
  drillContext,
}: Props) {
  const groups = buildSalesByShowData(rawData)
  const [drillTarget, setDrillTarget] = useState<SalesByShowDrillTarget | null>(null)
  const canDrill = Boolean(drillContext)

  if (!groups.length || groups.every((g) => !g.shows.length)) {
    return <ReportEmpty />
  }

  const showCount = groups.reduce((s, g) => s + g.shows.length, 0)
  const countKey = drillTarget ? drillCountKey(drillTarget.drillType) : "PaidCount"

  return (
    <ReportViewShell>
      <ReportHeader title="Sales By Show" subtitle={subtitle} generatedAt={generatedAt} />

      {groups.map((group, i) => (
        <DateGroupCard
          key={`${group.showDate}-${i}`}
          group={group}
          canDrill={canDrill}
          onDrill={setDrillTarget}
        />
      ))}

      <p className="text-right text-xs text-muted-foreground">
        {showCount} show{showCount !== 1 ? "s" : ""} across {groups.length} date group{groups.length !== 1 ? "s" : ""}
      </p>

      {drillTarget && drillContext && (
        <ReportDrillDialog
          title="Sales By Show - Drill Down"
          endpoint="ManagerCheckOutDrillDown"
          body={{
            Connection: drillContext.connectionName,
            StartDate: drillContext.startDate,
            EndDate: drillContext.endDate,
            LocaltionId: drillContext.locationId,
            ShowId: drillTarget.showId,
            DrillType: drillTarget.drillType,
          }}
          columns={buildSalesByShowDrillColumns(drillTarget.drillType)}
          footerTotals
          isZero={drillTarget.isZero}
          filterRows={(row) => {
            const val = row[countKey] ?? row.Discount ?? row.discount ?? 0
            const count = typeof val === "number" ? val : parseFloat(String(val))
            return Number.isFinite(count) && count !== 0
          }}
          onClose={() => setDrillTarget(null)}
        />
      )}
    </ReportViewShell>
  )
}
