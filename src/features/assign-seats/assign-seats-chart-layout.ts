/**
 * Desktop ChartD overlay (AssignSeats.xaml chartGrid):
 * 13 rows × P1…P13 (TabY1 1..13).
 * Columbus FillChart — CheckInVM.cs complete TableNum → (TabX1, TabY1) map.
 */

export const CHART_ROWS = 13

/** XAML DataGridTemplateColumn Widths for P1…P13 */
export const CHART_COL_WIDTHS = [
  50, 60, 40, 50, 40, 40, 40, 40, 40, 40, 30, 30, 60,
] as const

export const CHART_COLS = CHART_COL_WIDTHS.length

export type ChartCoord = {
  /** 0-based row (TabX1 - 1). */
  row: number
  /** 0-based column P1…P13 (TabY1 - 1). */
  col: number
}

/** Desktop FillChart 107 entries — TabX1/TabY1 are 1-based in source. */
const FILL_CHART_1_BASED: Record<string, { x: number; y: number }> = {
  "231A": { x: 3, y: 1 },
  "211A": { x: 4, y: 1 },
  "212A": { x: 5, y: 1 },
  "213A": { x: 6, y: 1 },
  "214A": { x: 7, y: 1 },
  "215A": { x: 8, y: 1 },
  "216A": { x: 9, y: 1 },
  "217A": { x: 10, y: 1 },
  "218A": { x: 11, y: 1 },
  "219A": { x: 12, y: 1 },
  "241A": { x: 13, y: 1 },
  "232A": { x: 2, y: 2 },
  "221A": { x: 3, y: 2 },
  "222A": { x: 4, y: 2 },
  "223A": { x: 5, y: 2 },
  "224A": { x: 6, y: 2 },
  "225A": { x: 7, y: 2 },
  "226A": { x: 8, y: 2 },
  "227A": { x: 10, y: 2 },
  "228A": { x: 11, y: 2 },
  "229A": { x: 12, y: 2 },
  "242A": { x: 13, y: 2 },
  "233A": { x: 2, y: 3 },
  "243A": { x: 13, y: 3 },
  "19A": { x: 1, y: 4 },
  "18A": { x: 3, y: 4 },
  "17A": { x: 4, y: 4 },
  "16A": { x: 6, y: 4 },
  "15A": { x: 7, y: 4 },
  "14A": { x: 8, y: 4 },
  "13A": { x: 10, y: 4 },
  "12A": { x: 11, y: 4 },
  "11A": { x: 13, y: 4 },
  "29A": { x: 1, y: 5 },
  "28A": { x: 3, y: 5 },
  "27A": { x: 4, y: 5 },
  "26A": { x: 6, y: 5 },
  "25A": { x: 7, y: 5 },
  "24A": { x: 8, y: 5 },
  "23A": { x: 10, y: 5 },
  "22A": { x: 11, y: 5 },
  "21A": { x: 13, y: 5 },
  "39A": { x: 1, y: 6 },
  "38A": { x: 3, y: 6 },
  "37A": { x: 4, y: 6 },
  "36A": { x: 6, y: 6 },
  "35A": { x: 7, y: 6 },
  "34A": { x: 8, y: 6 },
  "33A": { x: 10, y: 6 },
  "32A": { x: 11, y: 6 },
  "31A": { x: 13, y: 6 },
  "49A": { x: 1, y: 7 },
  "48A": { x: 3, y: 7 },
  "47A": { x: 4, y: 7 },
  "46A": { x: 6, y: 7 },
  "45A": { x: 7, y: 7 },
  "44A": { x: 8, y: 7 },
  "43A": { x: 10, y: 7 },
  "42A": { x: 11, y: 7 },
  "41A": { x: 13, y: 7 },
  "59A": { x: 1, y: 8 },
  "58A": { x: 3, y: 8 },
  "57A": { x: 4, y: 8 },
  "56A": { x: 6, y: 8 },
  "55A": { x: 7, y: 8 },
  "54A": { x: 8, y: 8 },
  "53A": { x: 10, y: 8 },
  "52A": { x: 11, y: 8 },
  "51A": { x: 13, y: 8 },
  "69A": { x: 1, y: 9 },
  "68A": { x: 3, y: 9 },
  "67A": { x: 4, y: 9 },
  "66A": { x: 6, y: 9 },
  "65A": { x: 7, y: 9 },
  "64A": { x: 8, y: 9 },
  "63A": { x: 10, y: 9 },
  "62A": { x: 11, y: 9 },
  "61A": { x: 12, y: 9 },
  "79A": { x: 1, y: 10 },
  "78A": { x: 3, y: 10 },
  "77A": { x: 4, y: 10 },
  "76A": { x: 6, y: 10 },
  "75A": { x: 7, y: 10 },
  "74A": { x: 8, y: 10 },
  "73A": { x: 10, y: 10 },
  "72A": { x: 11, y: 10 },
  "71A": { x: 12, y: 10 },
  "87B": { x: 2, y: 11 },
  "86B": { x: 4, y: 11 },
  "85B": { x: 5, y: 11 },
  "84B": { x: 7, y: 11 },
  "83B": { x: 8, y: 11 },
  "82B": { x: 10, y: 11 },
  "81B": { x: 11, y: 11 },
  "87F": { x: 2, y: 12 },
  "86F": { x: 4, y: 12 },
  "85F": { x: 5, y: 12 },
  "84F": { x: 7, y: 12 },
  "83F": { x: 8, y: 12 },
  "82F": { x: 10, y: 12 },
  "81F": { x: 11, y: 12 },
  Comics: { x: 1, y: 13 },
  "95A": { x: 4, y: 13 },
  "94A": { x: 5, y: 13 },
  "93A": { x: 7, y: 13 },
  "92A": { x: 8, y: 13 },
  "91A": { x: 9, y: 13 },
}

function toZeroBased(entry: { x: number; y: number }): ChartCoord {
  return { row: entry.x - 1, col: entry.y - 1 }
}

/** 0-based Columbus FillChart coordinates. */
export const COLUMBUS_CHART_COORDS: Record<string, ChartCoord> =
  Object.fromEntries(
    Object.entries(FILL_CHART_1_BASED).map(([tableNum, entry]) => [
      tableNum,
      toZeroBased(entry),
    ])
  )

/**
 * Clubs whose chart PNG/JPG already has table numbers baked in
 * (STAGE on top). Do not overlay Columbus ChartD text on these.
 */
export const NUMBERED_CHART_CONNECTIONS = new Set([
  "tampa_prod",
  "standupmedia",
  "liberty_prod",
  "orlando_prod",
  "omaha_prod",
  "albany_prod",
  "syracuse_prod",
  "kansascity_prod",
  "arlington_prod",
  "testarlington_prod",
  "clev_prod",
  "houston_prod",
  "hartford_prod",
  "demo_prod",
  "levee_prod",
  "toledo_prod",
  "comedyclub_prod",
])

export function chartHasBakedNumbers(connectionName: string) {
  const key = connectionName.trim().toLowerCase()
  if (NUMBERED_CHART_CONNECTIONS.has(key)) {
    return true
  }
  return /tampa|standupmedia|liberty|orlando|omaha|albany|syracuse|kansas|arlington|clev|houston|hartford|demo|levee|toledo|comedy/i.test(
    key
  )
}

export function packChartOverlayCoords(
  tableNos: string[],
  known: Record<string, ChartCoord> = {},
  options?: { packUnknown?: boolean }
): Map<string, ChartCoord> {
  const packUnknown = options?.packUnknown ?? false
  const result = new Map<string, ChartCoord>()
  const occupied = new Set<string>()

  const merged: Record<string, ChartCoord> = {
    ...COLUMBUS_CHART_COORDS,
    ...known,
  }

  function lookupCoord(tableNo: string): ChartCoord | undefined {
    return (
      merged[tableNo] ??
      merged[tableNo.toUpperCase()] ??
      merged[`${tableNo}A`] ??
      merged[`${tableNo}a`] ??
      merged[`${tableNo}B`] ??
      merged[`${tableNo}F`]
    )
  }

  for (const tableNo of tableNos) {
    const coord = lookupCoord(tableNo)
    if (!coord) {
      continue
    }
    const key = `${coord.row}:${coord.col}`
    if (
      coord.row < 0 ||
      coord.row >= CHART_ROWS ||
      coord.col < 0 ||
      coord.col >= CHART_COLS ||
      occupied.has(key)
    ) {
      continue
    }
    result.set(tableNo, coord)
    occupied.add(key)
  }

  if (!packUnknown) {
    return result
  }

  const remaining = tableNos.filter((tableNo) => !result.has(tableNo))
  let cursor = 0
  for (const tableNo of remaining) {
    while (cursor < CHART_ROWS * CHART_COLS) {
      const row = Math.floor(cursor / CHART_COLS)
      const col = cursor % CHART_COLS
      cursor += 1
      const key = `${row}:${col}`
      if (occupied.has(key)) {
        continue
      }
      result.set(tableNo, { row, col })
      occupied.add(key)
      break
    }
  }

  return result
}
