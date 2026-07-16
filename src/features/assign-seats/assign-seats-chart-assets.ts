/**
 * Desktop pack-URI / AssignSeatChart resolution.
 * Columbus: local Columbus.jpg (ImgChart) + ChartD FillChart.
 * Other clubs: AssignSeatChart = API ChartImage bytes (GetClubsAssignSeatDetail).
 */
import albanyChart from "@/assets/assign-seats-charts/Albany-Seating-Chart.jpg"
import arlingtonChart from "@/assets/assign-seats-charts/Arlington Seating Chart.jpg"
import clevelandChart from "@/assets/assign-seats-charts/Cleveland-Seating-Chart-small.png"
import columbusChart from "@/assets/assign-seats-charts/Columbus.jpg"
import hartfordChart from "@/assets/assign-seats-charts/hartford_chart.jpeg"
import houstonChart from "@/assets/assign-seats-charts/houston_chart.jpeg"
import kcChart from "@/assets/assign-seats-charts/KCSeatingChart.jpg"
import leveeChart from "@/assets/assign-seats-charts/Levee.jpg"
import libertyChart from "@/assets/assign-seats-charts/LIBERTY-Seating-Chart-number.png"
import omahaChart from "@/assets/assign-seats-charts/Omaha-Seating-Chart.png"
import orlandoChart from "@/assets/assign-seats-charts/Orlando-Seating.png"
import syracuseChart from "@/assets/assign-seats-charts/Syracuse-Seating-Chart-Sized.jpg"
import tampaChart from "@/assets/assign-seats-charts/Tampa-Seating-Chart.png"
import toledoChart from "@/assets/assign-seats-charts/Toledo-Chart.jpg"
import { chartHasBakedNumbers } from "@/features/assign-seats/assign-seats-chart-layout"

const CHART_URL_BY_CONNECTION: Record<string, string> = {
  columbus_prod: columbusChart,
  columbustest_prod: columbusChart,
  syracuse_prod: syracuseChart,
  houston_prod: houstonChart,
  levee_prod: leveeChart,
  arlington_prod: arlingtonChart,
  testarlington_prod: arlingtonChart,
  kansascity_prod: kcChart,
  demo_prod: hartfordChart,
  hartford_prod: hartfordChart,
  liberty_prod: libertyChart,
  albany_prod: albanyChart,
  clev_prod: clevelandChart,
  omaha_prod: omahaChart,
  orlando_prod: orlandoChart,
  tampa_prod: tampaChart,
  comedyclub_prod: toledoChart,
  toledo_prod: toledoChart,
}

const CHART_URL_BY_KEYWORD: Array<{ match: RegExp; url: string }> = [
  { match: /^columbus/i, url: columbusChart },
  { match: /syracuse/i, url: syracuseChart },
  { match: /houston/i, url: houstonChart },
  { match: /levee/i, url: leveeChart },
  { match: /arlington/i, url: arlingtonChart },
  { match: /kansas|kc/i, url: kcChart },
  { match: /hartford|demo/i, url: hartfordChart },
  { match: /liberty/i, url: libertyChart },
  { match: /albany/i, url: albanyChart },
  { match: /clev/i, url: clevelandChart },
  { match: /omaha/i, url: omahaChart },
  { match: /orlando/i, url: orlandoChart },
  { match: /tampa/i, url: tampaChart },
  { match: /toledo|comedy/i, url: toledoChart },
]

export const COLUMBUS_STYLE_CONNECTIONS = new Set([
  "columbus_prod",
  "columbustest_prod",
])

/** Exact desktop ConnectionName check — do not fuzzy-match unrelated clubs. */
export function isColumbusStyleConnection(connectionName: string) {
  return COLUMBUS_STYLE_CONNECTIONS.has(connectionName.trim().toLowerCase())
}

export function chartRotationDegrees(_connectionName: string) {
  return 0
}

export function staticChartUrlForConnection(connectionName: string) {
  const key = connectionName.trim().toLowerCase()
  if (!key) {
    return null
  }

  const exact = CHART_URL_BY_CONNECTION[key]
  if (exact) {
    return exact
  }

  for (const entry of CHART_URL_BY_KEYWORD) {
    if (entry.match.test(key)) {
      return entry.url
    }
  }

  return null
}

function sniffImageMime(bytes: Uint8Array): string {
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50) {
    return "image/png"
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8) {
    return "image/jpeg"
  }
  if (
    bytes.length >= 6 &&
    bytes[0] === 0x47 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46
  ) {
    return "image/gif"
  }
  return "image/jpeg"
}

function mimeFromBase64Prefix(text: string): string {
  if (text.startsWith("iVBOR")) {
    return "image/png"
  }
  if (text.startsWith("/9j/")) {
    return "image/jpeg"
  }
  if (text.startsWith("R0lGOD")) {
    return "image/gif"
  }
  return "image/jpeg"
}

export function chartImageBytesToUrl(chartImage: unknown): string | null {
  if (chartImage == null) {
    return null
  }

  if (typeof chartImage === "string") {
    const text = chartImage.trim()
    if (!text || text === "null" || text === "undefined") {
      return null
    }
    if (
      text.startsWith("data:") ||
      text.startsWith("blob:") ||
      text.startsWith("http://") ||
      text.startsWith("https://") ||
      text.startsWith("/")
    ) {
      return text
    }
    if (text.length < 64) {
      return null
    }
    return `data:${mimeFromBase64Prefix(text)};base64,${text}`
  }

  if (Array.isArray(chartImage) && chartImage.length > 64) {
    const bytes = Uint8Array.from(chartImage.map((n) => Number(n) & 0xff))
    const blob = new Blob([bytes], { type: sniffImageMime(bytes) })
    return URL.createObjectURL(blob)
  }

  return null
}

/**
 * Desktop GetTablesAndFillChart image rules:
 * - Prefer API ChartImage whenever present (this is what XAML binds as AssignSeatChart)
 * - columbus* with no API image → local Columbus.jpg + ChartD FillChart
 * - else → local pack file by ConnectionName
 *
 * Note: Desktop columbus path never assigns AssignSeatChart (only ImgChart string).
 * If the live window shows STAGE-on-top + 181–198, that image is Tampa/Liberty-style
 * from the API branch — not Columbus.jpg.
 */
export function resolveAssignSeatChartUrl({
  connectionName,
  chartImage,
}: {
  connectionName: string
  chartImage?: unknown
}) {
  const fromApi = chartImageBytesToUrl(chartImage)
  if (fromApi) {
    return fromApi
  }

  if (isColumbusStyleConnection(connectionName)) {
    return columbusChart
  }

  return staticChartUrlForConnection(connectionName)
}

/**
 * ChartD text overlay only when boxes are empty (Columbus.jpg).
 * Numbered charts (Tampa/Liberty API bytes) already include labels.
 */
export function shouldShowChartDOverlay({
  connectionName,
  fillVisibility,
  hasApiChartImage,
}: {
  connectionName: string
  fillVisibility?: string | null
  hasApiChartImage?: boolean
}) {
  const visibility = String(fillVisibility ?? "Visible")
    .trim()
    .toLowerCase()
  if (visibility === "collapsed" || visibility === "hidden") {
    return false
  }

  // API ChartImage for non-empty charts usually already has numbers (Tampa-style).
  if (hasApiChartImage) {
    return false
  }

  if (isColumbusStyleConnection(connectionName)) {
    return true
  }

  if (chartHasBakedNumbers(connectionName)) {
    return false
  }

  return false
}

export { columbusChart, tampaChart, libertyChart }
