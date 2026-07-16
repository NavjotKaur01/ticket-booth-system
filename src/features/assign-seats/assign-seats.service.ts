import type {
  ApiAssignSeatDetail,
  ApiClubsAssignSeatChartTable,
  ApiClubsAssignSeatDetail,
  ApiColumbusAssignSeatNumber,
  ApiReservationToAssignSeat,
} from "@/types/api/assign-seats"
import {
  chartImageBytesToUrl,
  isColumbusStyleConnection,
  resolveAssignSeatChartUrl,
  shouldShowChartDOverlay,
  columbusChart,
} from "@/features/assign-seats/assign-seats-chart-assets"
import {
  COLUMBUS_CHART_COORDS,
  packChartOverlayCoords,
} from "@/features/assign-seats/assign-seats-chart-layout"
import type {
  AssignSeatCell,
  AssignSeatChartOverlayCell,
  AssignSeatChartState,
  AssignSeatColorFlag,
  AssignSeatFloorLayout,
  AssignSeatFloorSeat,
  AssignSeatReservationRow,
  AssignSeatTableRow,
  AssignSeatsWorkspace,
} from "@/features/assign-seats/assign-seats.types"

const EMPTY_GUID = "00000000-0000-0000-0000-000000000000"
const SEAT_GROUPS = ["A", "A", "B", "B", "", "", "", "", "", ""]

function readString(
  record: Record<string, unknown>,
  keys: string[],
  fallback = ""
) {
  for (const key of keys) {
    const value = record[key]
    if (value == null) {
      continue
    }
    const text = String(value).trim()
    if (text) {
      return text
    }
  }
  return fallback
}

function readNumber(
  record: Record<string, unknown>,
  keys: string[],
  fallback = 0
) {
  for (const key of keys) {
    const value = record[key]
    if (value == null || value === "") {
      continue
    }
    const numeric = Number(value)
    if (Number.isFinite(numeric)) {
      return numeric
    }
  }
  return fallback
}

function readFlag(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value
  }
  if (value == null) {
    return false
  }
  const text = String(value).trim().toLowerCase()
  return text === "y" || text === "yes" || text === "true" || text === "1"
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {}
}

function usableReservationId(id: string | null | undefined) {
  if (!id?.trim()) {
    return null
  }
  const normalized = id.trim()
  if (normalized.toLowerCase() === EMPTY_GUID) {
    return null
  }
  return normalized
}

/** GUID compare — API/desktop casing often differs from web session IDs. */
export function sameReservationId(
  left?: string | null,
  right?: string | null
): boolean {
  const a = usableReservationId(left)
  const b = usableReservationId(right)
  if (!a || !b) {
    return false
  }
  return a.toLowerCase() === b.toLowerCase()
}

/** Desktop SeatNum is often "Seat1"…"Seat10". */
export function parseSeatNum(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.floor(value)
  }
  const text = String(value ?? "").trim()
  if (!text) {
    return 0
  }
  const match = text.match(/(\d+)/)
  if (!match) {
    return 0
  }
  const n = Number(match[1])
  return Number.isFinite(n) && n > 0 ? n : 0
}

function resolveColor({
  isDinner,
  isWeb,
  isPromo,
  source,
  promo,
}: {
  isDinner: boolean
  isWeb: boolean
  isPromo: boolean
  source: string
  promo: string
}): AssignSeatColorFlag {
  if (isDinner) {
    return "dinner"
  }
  if (
    isWeb ||
    source.toLowerCase().includes("web") ||
    source.toUpperCase() === "SRC03"
  ) {
    return "web"
  }
  if (isPromo || promo.trim().length > 0) {
    return "promo"
  }
  return "none"
}

function tableNumeric(value: string) {
  const match = String(value).match(/(\d+)/)
  return match ? Number(match[1]) : Number.NaN
}

function compareTableNos(a: string, b: string) {
  const na = tableNumeric(a)
  const nb = tableNumeric(b)
  if (Number.isFinite(na) && Number.isFinite(nb) && na !== nb) {
    return na - nb
  }
  return String(a).localeCompare(String(b), undefined, { numeric: true })
}

function isWalkupTable(tableNo: string) {
  const n = tableNumeric(tableNo)
  return Number.isFinite(n) && n >= 181 && n <= 198
}

function isLightGrayColor(value: unknown) {
  const text = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
  return (
    text === "lightgray" ||
    text === "lightgrey" ||
    text === "#d3d3d3" ||
    text === "gray" ||
    text === "grey"
  )
}

function emptySeat(
  tableNo: string,
  seatNo: number,
  readOnly: boolean
): AssignSeatCell {
  return {
    tableNo,
    seatNo,
    seatGroup: SEAT_GROUPS[seatNo - 1] || undefined,
    reservationId: null,
    displayName: "",
    color: "none",
    isHold: false,
    readOnly,
  }
}

function buildTableRow(
  tableNo: string,
  maxSeats: number,
  seatsPerTable = 10,
  readOnlyFlags?: boolean[]
): AssignSeatTableRow {
  // Desktop Columbus tables are typically MaxSeats=4 (Seat5–10 LightGray).
  const capacity = Math.max(
    0,
    Math.min(maxSeats > 0 ? maxSeats : 4, seatsPerTable)
  )
  return {
    tableNo,
    maxSeats: capacity,
    seats: Array.from({ length: seatsPerTable }, (_, index) => {
      const seatNo = index + 1
      const fromFlag = readOnlyFlags?.[index]
      const readOnly =
        typeof fromFlag === "boolean" ? fromFlag : seatNo > capacity
      return emptySeat(tableNo, seatNo, readOnly)
    }),
  }
}

/**
 * Desktop Columbus chart schematic fallback (walk-up strip + markers).
 * Primary STAGE UI is chart image + ChartD overlay.
 */
export function buildDefaultColumbusLayout(
  tableNos: string[],
  seatsPerTable = 10,
  maxSeatsByTable?: Map<string, number>
): {
  tables: AssignSeatTableRow[]
  floor: AssignSeatFloorLayout
} {
  const defaults =
    tableNos.length > 0
      ? [...tableNos].sort(compareTableNos)
      : [
          ...Array.from({ length: 18 }, (_, index) => String(11 + index)),
          ...Array.from({ length: 20 }, (_, index) => String(111 + index)),
          ...Array.from({ length: 18 }, (_, index) => String(181 + index)),
        ]

  // Desktop left TableNums includes walk-up 181–198 (Tampa ChartTableList / GetTempaTableNumber).
  // Walk-up is only a floor-map concept; do not omit those rows from the assign grid.
  const gridTables = defaults
  const walkupSeats = defaults
    .filter((tableNo) => isWalkupTable(tableNo))
    .map((tableNo) => tableNumeric(tableNo))
    .filter((n) => Number.isFinite(n))

  const tables: AssignSeatTableRow[] = gridTables.map((tableNo) =>
    buildTableRow(
      tableNo,
      maxSeatsByTable?.get(tableNo) ?? 4,
      seatsPerTable
    )
  )

  const floorSeats: AssignSeatFloorSeat[] = []
  const front = gridTables.filter((n) => {
    const num = tableNumeric(n)
    return Number.isFinite(num) && num < 100
  })
  const mid = gridTables.filter((n) => {
    const num = tableNumeric(n)
    return Number.isFinite(num) && num >= 100 && num < 181
  })
  const other = gridTables.filter(
    (n) => !front.includes(n) && !mid.includes(n)
  )

  function placeRow(
    items: string[],
    startY: number,
    cols: number,
    rowGap: number
  ) {
    items.forEach((tableNo, tableIndex) => {
      const col = tableIndex % cols
      const row = Math.floor(tableIndex / cols)
      const countInRow = Math.min(cols, items.length - row * cols)
      const rowWidth = countInRow * 12
      const startX = Math.max(4, (100 - rowWidth) / 2)
      floorSeats.push({
        id: `${tableNo}-marker`,
        tableNo,
        seatNo: 1,
        x: startX + col * 12,
        y: startY + row * rowGap,
        w: 10,
        h: 5.5,
      })
    })
  }

  placeRow(front, 16, 7, 9)
  placeRow(mid, 42, 8, 8)
  placeRow(other, 68, 8, 8)

  return {
    tables,
    floor: {
      seats: floorSeats,
      walkupSeats:
        walkupSeats.length > 0
          ? walkupSeats
          : Array.from({ length: 18 }, (_, index) => 181 + index),
    },
  }
}

function readTableMeta(item: unknown): {
  tableNo: string
  maxSeats: number
  tabX1: number | null
  tabY1: number | null
  readOnlyFlags: boolean[]
} | null {
  const record = asRecord(item)
  const tableNo = readString(record, [
    "TableNo",
    "TableNum",
    "Table",
    "tableNo",
    "TableNumber",
  ])
  if (!tableNo) {
    return null
  }

  const maxSeats = Math.max(
    0,
    readNumber(record, ["MaxSeats", "SeatCount", "Seats", "maxSeats"], 4)
  )

  const tabX1Raw = readNumber(record, ["TabX1", "tabX1", "Row", "row"], 0)
  const tabY1Raw = readNumber(record, ["TabY1", "tabY1", "Col", "col"], 0)
  const tabX1 = tabX1Raw >= 1 ? tabX1Raw : null
  const tabY1 = tabY1Raw >= 1 ? tabY1Raw : null

  const readOnlyFlags = Array.from({ length: 10 }, (_, index) => {
    const seatNo = index + 1
    const colorKey = `ColorSeat${seatNo}`
    const readOnlyKey = `ReadOnlySeat${seatNo}`
    if (readFlag(record[readOnlyKey]) || isLightGrayColor(record[colorKey])) {
      return true
    }
    return seatNo > Math.min(maxSeats || 10, 10)
  })

  return {
    tableNo,
    maxSeats: Math.min(maxSeats || 10, 10),
    tabX1,
    tabY1,
    readOnlyFlags,
  }
}

export function mapColumbusAssignSeatNumbers(
  raw: ApiColumbusAssignSeatNumber[] | number[] | string[]
): {
  tables: AssignSeatTableRow[]
  floor: AssignSeatFloorLayout
  coords: Map<string, { row: number; col: number }>
} {
  if (!raw.length) {
    const layout = buildDefaultColumbusLayout([])
    const coords = packChartOverlayCoords(
      layout.tables.map((t) => t.tableNo),
      COLUMBUS_CHART_COORDS,
      { packUnknown: false }
    )
    return { ...layout, coords }
  }

  if (typeof raw[0] === "number" || typeof raw[0] === "string") {
    const tableNos = [...new Set(raw.map((item) => String(item).trim()))]
      .filter(Boolean)
      .sort(compareTableNos)
    const layout = buildDefaultColumbusLayout(tableNos)
    const coords = packChartOverlayCoords(tableNos, COLUMBUS_CHART_COORDS, {
      packUnknown: false,
    })
    return { ...layout, coords }
  }

  const records = raw as ApiColumbusAssignSeatNumber[]
  const metas = records
    .map((item) => readTableMeta(item))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))

  if (metas.length === 0) {
    const layout = buildDefaultColumbusLayout([])
    const coords = packChartOverlayCoords(
      layout.tables.map((t) => t.tableNo),
      COLUMBUS_CHART_COORDS,
      { packUnknown: false }
    )
    return { ...layout, coords }
  }

  const maxSeatsByTable = new Map(
    metas.map((meta) => [meta.tableNo, meta.maxSeats])
  )
  const tableNos = [...new Set(metas.map((meta) => meta.tableNo))].sort(
    compareTableNos
  )
  const layout = buildDefaultColumbusLayout(tableNos, 10, maxSeatsByTable)

  const byMeta = new Map(metas.map((meta) => [meta.tableNo, meta]))
  layout.tables = layout.tables.map((table) => {
    const meta = byMeta.get(table.tableNo)
    if (!meta) {
      return table
    }
    return {
      ...table,
      maxSeats: meta.maxSeats,
      seats: table.seats.map((seat, index) => ({
        ...seat,
        readOnly: meta.readOnlyFlags[index] ?? seat.seatNo > meta.maxSeats,
      })),
    }
  })

  const known: Record<string, { row: number; col: number }> = {
    ...COLUMBUS_CHART_COORDS,
  }
  for (const meta of metas) {
    if (meta.tabX1 != null && meta.tabY1 != null) {
      known[meta.tableNo] = {
        row: meta.tabX1 - 1,
        col: meta.tabY1 - 1,
      }
    }
  }

  const coords = packChartOverlayCoords(tableNos, known, { packUnknown: false })
  return { ...layout, coords }
}

export function extractClubsAssignSeatDetail(
  value: unknown
): ApiClubsAssignSeatDetail | null {
  if (!value || typeof value !== "object") {
    return null
  }

  const record = value as Record<string, unknown>
  const nestedKeys = ["Data", "data", "Result", "result", "Value", "value"]
  for (const key of nestedKeys) {
    const nested = record[key]
    if (nested && typeof nested === "object" && !Array.isArray(nested)) {
      const fromNested = extractClubsAssignSeatDetail(nested)
      if (fromNested) {
        return fromNested
      }
    }
  }

  const hasChartImage =
    record.ChartImage != null ||
    record.ByteImgSource != null ||
    record.chartImage != null
  const chartImageSource =
    (record.ChartImageSource as string | null | undefined) ??
    (record.chartImageSource as string | null | undefined) ??
    null
  const tableList = record.ChartTableList ?? record.chartTableList
  const hasTables = Array.isArray(tableList) && tableList.length > 0

  if (!hasChartImage && !hasTables && !chartImageSource) {
    return null
  }

  return {
    ChartImage:
      (record.ChartImage as ApiClubsAssignSeatDetail["ChartImage"]) ??
      (record.ByteImgSource as ApiClubsAssignSeatDetail["ChartImage"]) ??
      (record.chartImage as ApiClubsAssignSeatDetail["ChartImage"]),
    ByteImgSource:
      (record.ByteImgSource as ApiClubsAssignSeatDetail["ByteImgSource"]) ??
      (record.ChartImage as ApiClubsAssignSeatDetail["ByteImgSource"]),
    ChartImageSource: chartImageSource,
    ChartTableList: Array.isArray(tableList)
      ? (tableList as ApiClubsAssignSeatChartTable[])
      : null,
    ChartGridOpacity:
      (record.ChartGridOpacity as ApiClubsAssignSeatDetail["ChartGridOpacity"]) ??
      (record.chartGridOpacity as ApiClubsAssignSeatDetail["ChartGridOpacity"]),
    ChartFillUpVisibility:
      (record.ChartFillUpVisibility as ApiClubsAssignSeatDetail["ChartFillUpVisibility"]) ??
      (record.chartFillUpVisibility as ApiClubsAssignSeatDetail["ChartFillUpVisibility"]),
  }
}

export function mapClubsAssignSeatDetail(
  detail: ApiClubsAssignSeatDetail | null | undefined,
  connectionName: string
): {
  tables: AssignSeatTableRow[]
  floor: AssignSeatFloorLayout
  chart: AssignSeatChartState
  coords: Map<string, { row: number; col: number }>
} {
  const record = asRecord(detail)
  const tableList = Array.isArray(detail?.ChartTableList)
    ? detail.ChartTableList
    : Array.isArray(record.ChartTableList)
      ? (record.ChartTableList as ApiClubsAssignSeatChartTable[])
      : []

  const metas = tableList
    .map((item) => readTableMeta(item))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))

  const tableNos = metas.map((meta) => meta.tableNo).sort(compareTableNos)
  const maxSeatsByTable = new Map(
    metas.map((meta) => [meta.tableNo, meta.maxSeats])
  )
  const layout =
    tableNos.length > 0
      ? buildDefaultColumbusLayout(tableNos, 10, maxSeatsByTable)
      : buildDefaultColumbusLayout([])

  const byMeta = new Map(metas.map((meta) => [meta.tableNo, meta]))
  layout.tables = layout.tables.map((table) => {
    const meta = byMeta.get(table.tableNo)
    if (!meta) {
      return table
    }
    return {
      ...table,
      maxSeats: meta.maxSeats,
      seats: table.seats.map((seat, index) => ({
        ...seat,
        readOnly: meta.readOnlyFlags[index] ?? seat.seatNo > meta.maxSeats,
      })),
    }
  })

  const known: Record<string, { row: number; col: number }> = {}
  for (const meta of metas) {
    if (meta.tabX1 != null && meta.tabY1 != null) {
      known[meta.tableNo] = {
        row: meta.tabX1 - 1,
        col: meta.tabY1 - 1,
      }
    }
  }
  const coords = packChartOverlayCoords(
    layout.tables.map((t) => t.tableNo),
    known,
    { packUnknown: false }
  )

  const chartImage =
    detail?.ChartImage ?? detail?.ByteImgSource ?? record.ChartImage
  const chartImageSource =
    detail?.ChartImageSource ?? record.ChartImageSource ?? null
  const imageUrl = resolveAssignSeatChartUrl({
    connectionName,
    chartImage,
    chartImageSource,
  })

  const opacityRaw = Number(
    detail?.ChartGridOpacity ?? record.ChartGridOpacity ?? 0.7
  )
  // Desktop Tampa/API uses 0.3 — do not raise above the API value.
  const opacity = Number.isFinite(opacityRaw)
    ? Math.min(1, Math.max(0.2, opacityRaw))
    : 0.7

  const fillVisibility = String(
    detail?.ChartFillUpVisibility ?? record.ChartFillUpVisibility ?? "Visible"
  )

  return {
    ...layout,
    coords,
    chart: {
      imageUrl,
      opacity,
      fillVisible: shouldShowChartDOverlay({
        connectionName,
        fillVisibility,
        hasApiChartImage: Boolean(chartImageBytesToUrl(chartImage)),
      }),
      overlay: [],
    },
  }
}

function countSeatNumbers(seatNumbers: string) {
  const text = seatNumbers.trim()
  if (!text) {
    return 0
  }
  // Desktop: count of ',' or '|' + 1
  return (text.match(/[,|]/g)?.length ?? 0) + 1
}

/**
 * Desktop ReservationPayment → AssignSeats passes ReservationList locally
 * (CheckInVM.GetReservationsToAssignSeats with resList) instead of relying on
 * GetReservationsToAssignSeats API. Rem = Party − form SeatNumbers count.
 */
export function buildPaymentAssignSeatSeed({
  reservationId,
  firstName,
  lastName,
  businessName = "",
  qty,
  seatNumbers = "",
  section = "",
  source = "",
  promo = "",
  notes = "",
  dinner = false,
  createDt = "",
  resStatus = "",
}: {
  reservationId: string
  firstName: string
  lastName: string
  businessName?: string
  qty: number
  seatNumbers?: string
  section?: string
  source?: string
  promo?: string
  notes?: string
  dinner?: boolean | string
  createDt?: string
  resStatus?: string
}): ApiReservationToAssignSeat | null {
  const id = usableReservationId(reservationId)
  if (!id) {
    return null
  }

  const party = Math.max(0, Math.floor(qty) || 0)
  const seated = countSeatNumbers(seatNumbers)
  const bus = businessName.trim()
  const last = bus || lastName.trim()
  const first = bus ? "" : firstName.trim()
  const name =
    [first, last].filter(Boolean).join(" ").trim() ||
    [lastName, firstName].filter(Boolean).join(", ").trim() ||
    "Guest"

  return {
    ReservationId: id,
    ReservationID: id,
    Name: name,
    LastName: last,
    FirstName: first,
    CreateDt: createDt,
    Qty: party,
    Party: party,
    Rem: Math.max(0, party - seated),
    SeatNumbers: seatNumbers.trim(),
    Section: section,
    Source: source,
    SourceDesc: source,
    Promo: promo,
    Notes: notes,
    Note: notes,
    Dinner: readFlag(dinner) ? "Y" : "N",
    ResStatus: resStatus,
  }
}

export function mapReservationsToAssignSeats(
  raw: ApiReservationToAssignSeat[],
  filterReservationId?: string | null
): AssignSeatReservationRow[] {
  let rows = raw
    .map((item) => {
      const record = asRecord(item)
      const id =
        usableReservationId(
          readString(record, ["ReservationId", "ReservationID", "reservationId"])
        ) ?? ""
      const lastName = readString(record, ["LastName", "lastName"])
      const firstName = readString(record, ["FirstName", "firstName"])
      const name =
        readString(record, ["Name", "GuestName", "guestName"]) ||
        [lastName, firstName].filter(Boolean).join(", ") ||
        "Guest"
      const qty = readNumber(record, ["Qty", "Quantity", "Party", "party"], 1)
      const seatNumbers = readString(record, [
        "SeatNumbers",
        "SeatNums",
        "seatNumbers",
      ])
      const hasRemField =
        record.Rem != null ||
        record.Remaining != null ||
        record.remaining != null ||
        record.RemQty != null
      const rem = hasRemField
        ? readNumber(record, ["Rem", "Remaining", "remaining", "RemQty"], 0)
        : Math.max(0, qty - countSeatNumbers(seatNumbers))
      const source =
        readString(record, [
          "SourceDesc",
          "Source",
          "ResSource",
          "source",
        ]) || ""
      const promo = readString(record, ["Promo", "Promotion", "promo"])
      const dinner = readFlag(
        record.Dinner ??
          record.IsDinner ??
          record.dinner ??
          record.isDinner ??
          record.ShowDinner
      )
      const resStatus = readString(record, ["ResStatus", "Status", "resStatus"])

      return {
        id,
        name,
        createDt: readString(record, ["CreateDt", "CreatedDt", "createDt"]),
        qty,
        rem: Math.max(0, rem),
        promo,
        section: readString(record, ["Section", "section"]),
        source,
        notes: readString(record, ["Notes", "Note", "notes"]),
        isDinner: dinner,
        resStatus,
      }
    })
    .filter((row) => Boolean(row.id))

  // Desktop GetReservationsToAssignSeats filter:
  // ReservationId empty → remove cancelled (RSTATE11)
  // ReservationId set → only that guest
  if (filterReservationId) {
    rows = rows.filter((row) =>
      sameReservationId(row.id, filterReservationId)
    )
  } else {
    rows = rows.filter((row) => row.resStatus !== "RSTATE11")
  }

  return rows.map(({ resStatus: _status, ...row }) => row)
}

function cellKey(tableNo: string, seatNo: number) {
  return `${tableNo}:${seatNo}`
}

/** Desktop FillAssignedSeats display: "LastName- 1". */
function formatAssignedSeatLabel(lastName: string, seatNo: number) {
  const name = lastName.trim()
  if (!name) {
    return ""
  }
  if (/-\s*\d+\s*$/.test(name)) {
    return name
  }
  return `${name}- ${seatNo}`
}

function lookupReservation(
  reservationLookup: Map<string, AssignSeatReservationRow>,
  reservationId: string | null
): AssignSeatReservationRow | undefined {
  if (!reservationId) {
    return undefined
  }
  const direct = reservationLookup.get(reservationId)
  if (direct) {
    return direct
  }
  const needle = reservationId.toLowerCase()
  for (const [key, row] of reservationLookup) {
    if (key.toLowerCase() === needle) {
      return row
    }
  }
  return undefined
}

export function applyAssignSeatDetails(
  tables: AssignSeatTableRow[],
  details: ApiAssignSeatDetail[],
  reservationLookup: Map<string, AssignSeatReservationRow>
): AssignSeatTableRow[] {
  const byCell = new Map<string, ApiAssignSeatDetail>()

  for (const detail of details) {
    const record = asRecord(detail)
    const tableNo = readString(record, [
      "TableNo",
      "TableNum",
      "Table",
      "tableNo",
    ])
    const seatNo = parseSeatNum(
      record.SeatNum ?? record.SeatNo ?? record.Seat ?? record.seatNo
    )
    if (!tableNo || seatNo < 1) {
      continue
    }
    byCell.set(cellKey(tableNo, seatNo), detail)
  }

  return tables.map((table) => {
    const seats = table.seats.map((seat) => {
      const detail = byCell.get(cellKey(table.tableNo, seat.seatNo))
      if (!detail) {
        return {
          ...seat,
          reservationId: null,
          displayName: "",
          color: "none" as AssignSeatColorFlag,
          isHold: false,
        }
      }

      const record = asRecord(detail)
      const reservationId = usableReservationId(
        readString(record, ["ReservationId", "ReservationID", "reservationId"])
      )
      const matched = lookupReservation(reservationLookup, reservationId)
      const lastName = readString(record, ["LastName", "lastName"])
      const firstName = readString(record, ["FirstName", "firstName"])
      const rawName =
        lastName ||
        readString(record, ["Name", "GuestName", "guestName"]) ||
        [lastName, firstName].filter(Boolean).join(", ") ||
        matched?.name ||
        ""
      const displayName = formatAssignedSeatLabel(rawName, seat.seatNo)
      const source =
        readString(record, ["Source", "ResSource", "source"]) ||
        matched?.source ||
        ""
      const promo =
        readString(record, ["Promo", "Promotion", "promo"]) ||
        (reservationId
          ? reservationLookup.get(reservationId)?.promo ?? ""
          : "")
      const isDinner = readFlag(
        record.Dinner ?? record.IsDinner ?? matched?.isDinner
      )
      const isWeb = readFlag(record.Web ?? record.IsWeb)
      const isPromo = readFlag(record.Promo ?? record.IsPromo) || Boolean(promo)

      return {
        ...seat,
        reservationId,
        displayName,
        color: resolveColor({
          isDinner,
          isWeb,
          isPromo,
          source,
          promo,
        }),
        isHold: false,
        // Assigned seats are interactive even if previously greyed.
        readOnly: false,
      }
    })

    return {
      ...table,
      seats,
    }
  })
}

export function buildChartOverlay(
  tables: AssignSeatTableRow[],
  coords: Map<string, { row: number; col: number }>
): AssignSeatChartOverlayCell[] {
  return tables
    .map((table) => {
      const coord = coords.get(table.tableNo)
      if (!coord) {
        return null
      }
      const assigned = table.seats.filter(
        (seat) => seat.reservationId || seat.isHold || seat.displayName
      ).length
      const isFull = assigned >= table.maxSeats && table.maxSeats > 0
      return {
        tableNo: table.tableNo,
        row: coord.row,
        col: coord.col,
        isFull,
      } satisfies AssignSeatChartOverlayCell
    })
    .filter((cell): cell is AssignSeatChartOverlayCell => Boolean(cell))
}

export function buildAssignSeatsWorkspace({
  columbus,
  clubsDetail,
  details,
  reservations,
  connectionName,
  filterReservationId,
  /**
   * Desktop payment Assign Seats: Rem comes from form SeatNumbers, not chart fill.
   * Keep seed Rem so the guest stays visible (AssignSeatsRemainningConverter).
   */
  preserveSeedRem = false,
}: {
  columbus?: ApiColumbusAssignSeatNumber[] | number[] | string[] | null
  clubsDetail?: ApiClubsAssignSeatDetail | null
  details: ApiAssignSeatDetail[]
  reservations: ApiReservationToAssignSeat[]
  connectionName: string
  filterReservationId?: string | null
  preserveSeedRem?: boolean
}): AssignSeatsWorkspace {
  const mappedReservations = mapReservationsToAssignSeats(
    reservations,
    filterReservationId
  )
  const lookup = new Map(mappedReservations.map((row) => [row.id, row]))

  let tables: AssignSeatTableRow[]
  let floor: AssignSeatFloorLayout
  let coords: Map<string, { row: number; col: number }>
  let chartBase: AssignSeatChartState

  if (clubsDetail) {
    const mapped = mapClubsAssignSeatDetail(clubsDetail, connectionName)
    tables = mapped.tables
    floor = mapped.floor
    coords = mapped.coords
    chartBase = mapped.chart
  } else if (isColumbusStyleConnection(connectionName)) {
    const mapped = mapColumbusAssignSeatNumbers(columbus ?? [])
    tables = mapped.tables
    floor = mapped.floor
    coords = mapped.coords
    chartBase = {
      imageUrl: columbusChart,
      opacity: 0.7,
      fillVisible: true,
      overlay: [],
    }
  } else {
    // Non-Columbus club with no assign-seat detail: do not invent Columbus.jpg
    // or Columbus default table rows (that is what made Standupmedia look wrong).
    // Still resolve a static pack chart when ConnectionName maps to one (e.g. Standupmedia → Tampa).
    tables = []
    floor = { seats: [], walkupSeats: [] }
    coords = new Map()
    chartBase = {
      imageUrl: resolveAssignSeatChartUrl({ connectionName }),
      opacity: 1,
      fillVisible: false,
      overlay: [],
    }
  }

  tables = applyAssignSeatDetails(tables, details, lookup)
  const overlay = buildChartOverlay(tables, coords)
  const seatCount = tables[0]?.seats.length ?? 10

  return {
    tables,
    reservations: mappedReservations.map((row) => {
      if (preserveSeedRem) {
        return row
      }
      const assigned = tables.reduce(
        (count, table) =>
          count +
          table.seats.filter((seat) =>
            sameReservationId(seat.reservationId, row.id)
          ).length,
        0
      )
      const rem =
        assigned > 0 ? Math.max(0, row.qty - assigned) : Math.max(0, row.rem)
      return {
        ...row,
        rem,
      }
    }),
    floor,
    chart: {
      ...chartBase,
      overlay,
    },
    seatCount,
  }
}

/** Desktop: grey readonly empty cell → unlock (White, MaxSeats++). */
export function unlockSeatCell(
  tables: AssignSeatTableRow[],
  tableNo: string,
  seatNo: number
) {
  return tables.map((table) => {
    if (table.tableNo !== tableNo) {
      return table
    }
    const nextMax = Math.max(table.maxSeats, seatNo)
    return {
      ...table,
      maxSeats: nextMax,
      seats: table.seats.map((seat) => {
        if (seat.seatNo !== seatNo) {
          return {
            ...seat,
            readOnly: seat.readOnly && seat.seatNo > nextMax,
          }
        }
        return {
          ...seat,
          readOnly: false,
        }
      }),
    }
  })
}

export function assignSeatToCell(
  tables: AssignSeatTableRow[],
  reservations: AssignSeatReservationRow[],
  tableNo: string,
  seatNo: number,
  reservationId: string
): {
  tables: AssignSeatTableRow[]
  reservations: AssignSeatReservationRow[]
  error?: string
} {
  const reservation = reservations.find((row) =>
    sameReservationId(row.id, reservationId)
  )
  if (!reservation) {
    return { tables, reservations, error: "Select a reservation first." }
  }

  const resolvedReservationId = reservation.id

  let workingTables = tables
  const target = workingTables
    .flatMap((table) => table.seats)
    .find((seat) => seat.tableNo === tableNo && seat.seatNo === seatNo)

  if (!target) {
    return { tables, reservations, error: "Seat not found." }
  }

  // Desktop: double-click greyed readonly empty → unlock.
  if (target.readOnly && !target.reservationId && !target.isHold) {
    workingTables = unlockSeatCell(workingTables, tableNo, seatNo)
  }

  const unlocked = workingTables
    .flatMap((table) => table.seats)
    .find((seat) => seat.tableNo === tableNo && seat.seatNo === seatNo)

  if (unlocked?.readOnly) {
    return {
      tables: workingTables,
      reservations,
      error: "This seat is not available.",
    }
  }

  const currentAssigned = workingTables.reduce(
    (count, table) =>
      count +
      table.seats.filter((seat) =>
        sameReservationId(seat.reservationId, resolvedReservationId)
      ).length,
    0
  )

  const replacingOwnSeat = sameReservationId(
    unlocked?.reservationId,
    resolvedReservationId
  )
  const needsNewSlot = !replacingOwnSeat
  if (needsNewSlot && currentAssigned >= reservation.qty) {
    return {
      tables: workingTables,
      reservations,
      error: "No remaining seats for this reservation.",
    }
  }

  const color = resolveColor({
    isDinner: reservation.isDinner,
    isWeb: reservation.source.toLowerCase().includes("web"),
    isPromo: Boolean(reservation.promo.trim()),
    source: reservation.source,
    promo: reservation.promo,
  })

  const lastName =
    reservation.name.split(",")[0]?.trim() ||
    reservation.name.split(" ")[0]?.trim() ||
    reservation.name.trim()

  const nextTables = workingTables.map((table) => {
    if (table.tableNo !== tableNo) {
      return table
    }
    return {
      ...table,
      status: "A",
      seats: table.seats.map((seat) => {
        if (seat.tableNo === tableNo && seat.seatNo === seatNo) {
          return {
            ...seat,
            reservationId: resolvedReservationId,
            displayName: formatAssignedSeatLabel(lastName, seatNo),
            color,
            isHold: false,
            readOnly: false,
          }
        }
        return seat
      }),
    }
  })

  const nextReservations = reservations.map((row) => {
    if (!sameReservationId(row.id, resolvedReservationId)) {
      return row
    }
    const assigned = nextTables.reduce(
      (count, table) =>
        count +
        table.seats.filter((seat) =>
          sameReservationId(seat.reservationId, row.id)
        ).length,
      0
    )
    return { ...row, rem: Math.max(0, row.qty - assigned) }
  })

  return { tables: nextTables, reservations: nextReservations }
}

export function clearSeatCell(
  tables: AssignSeatTableRow[],
  reservations: AssignSeatReservationRow[],
  tableNo: string,
  seatNo: number
) {
  const nextTables = tables.map((table) => {
    if (table.tableNo !== tableNo) {
      return table
    }
    return {
      ...table,
      status: "A",
      seats: table.seats.map((seat) => {
        if (seat.tableNo === tableNo && seat.seatNo === seatNo) {
          return {
            ...seat,
            reservationId: null,
            displayName: "",
            color: "none" as AssignSeatColorFlag,
            isHold: false,
          }
        }
        return seat
      }),
    }
  })

  const nextReservations = reservations.map((row) => {
    const assigned = nextTables.reduce(
      (count, table) =>
        count +
        table.seats.filter((seat) =>
          sameReservationId(seat.reservationId, row.id)
        ).length,
      0
    )
    return { ...row, rem: Math.max(0, row.qty - assigned) }
  })

  return { tables: nextTables, reservations: nextReservations }
}

export function clearAllAssignments(
  tables: AssignSeatTableRow[],
  reservations: AssignSeatReservationRow[]
) {
  const nextTables = tables.map((table) => ({
    ...table,
    status: "A",
    seats: table.seats.map((seat) => ({
      ...seat,
      reservationId: null,
      displayName: "",
      color: "none" as AssignSeatColorFlag,
      isHold: false,
    })),
  }))

  const nextReservations = reservations.map((row) => ({
    ...row,
    rem: row.qty,
  }))

  return { tables: nextTables, reservations: nextReservations }
}

export function collectAssignments(tables: AssignSeatTableRow[]) {
  return tables.flatMap((table) =>
    table.seats
      .filter((seat) => seat.reservationId)
      .map((seat) => ({
        ReservationId: seat.reservationId as string,
        TableNo: seat.tableNo,
        SeatNo: seat.seatNo,
        Name: seat.displayName,
      }))
  )
}

/** Aggregate table numbers per reservation for UpdateTableNumberReservation. */
export function collectTableNumsByReservation(
  tables: AssignSeatTableRow[],
  options?: {
    /**
     * Desktop SaveTableNumberInReservation: only reservations touched by
     * Status=="A" / remove lists. When set, still scans the full grid for
     * each touched guest's current table nums.
     */
    onlyReservationIds?: string[] | null
  }
) {
  const onlyIds = options?.onlyReservationIds
  const onlySet =
    onlyIds && onlyIds.length > 0
      ? new Set(onlyIds.map((id) => id.trim().toLowerCase()))
      : null

  const byReservation = new Map<string, Set<string>>()

  for (const table of tables) {
    for (const seat of table.seats) {
      if (!seat.reservationId) {
        continue
      }
      if (
        onlySet &&
        !onlySet.has(seat.reservationId.trim().toLowerCase())
      ) {
        continue
      }
      const set = byReservation.get(seat.reservationId) ?? new Set<string>()
      set.add(seat.tableNo)
      byReservation.set(seat.reservationId, set)
    }
  }

  return [...byReservation.entries()].map(([reservationId, tablesSet]) => ({
    reservationId,
    tableNums: [...tablesSet]
      .sort((a, b) => compareTableNos(a, b))
      .join(", "),
  }))
}

/** Reservation IDs present on Status=="A" tables (desktop touched guests). */
export function collectTouchedReservationIds(tables: AssignSeatTableRow[]) {
  const ids = new Set<string>()
  for (const table of tables) {
    if (table.status !== "A") {
      continue
    }
    for (const seat of table.seats) {
      if (seat.reservationId) {
        ids.add(seat.reservationId)
      }
    }
  }
  return [...ids]
}

export function cellColorClass(color: AssignSeatColorFlag, filled: boolean) {
  if (!filled) {
    return "bg-background text-foreground hover:bg-muted/80"
  }

  switch (color) {
    case "dinner":
      return "bg-orange-400 text-black"
    case "web":
      return "bg-red-500 text-white"
    case "promo":
      return "bg-blue-500 text-white"
    default:
      return "bg-muted text-foreground"
  }
}

export function holdSeatCell(
  tables: AssignSeatTableRow[],
  tableNo: string,
  seatNo: number
) {
  return {
    tables: tables.map((table) => {
      if (table.tableNo !== tableNo) {
        return table
      }
      return {
        ...table,
        status: "A",
        seats: table.seats.map((seat) => {
          if (seat.tableNo === tableNo && seat.seatNo === seatNo) {
            return {
              ...seat,
              reservationId: null,
              displayName: "<Hold>",
              color: "none" as AssignSeatColorFlag,
              isHold: true,
              readOnly: false,
            }
          }
          return seat
        }),
      }
    }),
  }
}

export function removeSeatsFromTable(
  tables: AssignSeatTableRow[],
  reservations: AssignSeatReservationRow[],
  tableNo: string
) {
  const nextTables = tables.map((table) => {
    if (table.tableNo !== tableNo) {
      return table
    }
    return {
      ...table,
      status: "A",
      seats: table.seats.map((seat) => ({
        ...seat,
        reservationId: null,
        displayName: "",
        color: "none" as AssignSeatColorFlag,
        isHold: false,
      })),
    }
  })

  const nextReservations = reservations.map((row) => {
    const assigned = nextTables.reduce(
      (count, table) =>
        count +
        table.seats.filter((seat) =>
          sameReservationId(seat.reservationId, row.id)
        ).length,
      0
    )
    return { ...row, rem: Math.max(0, row.qty - assigned) }
  })

  return { tables: nextTables, reservations: nextReservations }
}

export function removeReservationFromSeats(
  tables: AssignSeatTableRow[],
  reservations: AssignSeatReservationRow[],
  reservationId: string
) {
  const nextTables = tables.map((table) => {
    const touched = table.seats.some((seat) =>
      sameReservationId(seat.reservationId, reservationId)
    )
    if (!touched) {
      return table
    }
    return {
      ...table,
      status: "A",
      seats: table.seats.map((seat) => {
        if (!sameReservationId(seat.reservationId, reservationId)) {
          return seat
        }
        return {
          ...seat,
          reservationId: null,
          displayName: "",
          color: "none" as AssignSeatColorFlag,
          isHold: false,
        }
      }),
    }
  })

  const nextReservations = reservations.map((row) => {
    if (!sameReservationId(row.id, reservationId)) {
      return row
    }
    return { ...row, rem: row.qty }
  })

  return { tables: nextTables, reservations: nextReservations }
}

/** Rebuild ChartD fullness colors after table mutations. */
export function refreshChartOverlay(
  chart: AssignSeatChartState,
  tables: AssignSeatTableRow[],
  coords: Map<string, { row: number; col: number }>
): AssignSeatChartState {
  return {
    ...chart,
    overlay: buildChartOverlay(tables, coords),
  }
}
