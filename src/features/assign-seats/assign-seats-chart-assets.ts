/**
 * Desktop pack-URI / AssignSeatChart resolution.
 *
 * CheckInVM.GetTablesAndFillChart:
 * - columbus_prod / columbustest_prod → local Columbus.jpg + FillChart (ImgChart)
 * - else → AssignSeatHelper.GetAssignSeatPropertiesV2 → AssignSeatChart = ChartImage bytes
 *
 * Never fall back to Columbus for Standupmedia / tampa / unknown clubs.
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

/** Exact desktop ConnectionName → pack resource (CheckInVM ctor / ImgChart). */
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
  /**
   * Live GetClubsAssignSeatDetail for Standupmedia returns
   * ChartImageSource = Tampa-Seating-Chart.png (same chart bytes as tampa_prod).
   * Standupmedia is a real GetClubsEnum ConnectionName, not an alias of tampa_prod DB.
   */
  standupmedia: tampaChart,
  comedyclub_prod: toledoChart,
  toledo_prod: toledoChart,
}

/** Desktop pack filename → bundled asset (ChartImageSource / ImgChart). */
const CHART_URL_BY_FILENAME: Record<string, string> = {
  "columbus.jpg": columbusChart,
  "syracuse-seating-chart-sized.jpg": syracuseChart,
  "houston_chart.jpeg": houstonChart,
  "levee.jpg": leveeChart,
  "arlington seating chart.jpg": arlingtonChart,
  "arlington-seating-chart.png": arlingtonChart,
  "arlington-seating-chart.jpg": arlingtonChart,
  "kcseatingchart.jpg": kcChart,
  "hartford_chart.jpeg": hartfordChart,
  "liberty-seating-chart-number.png": libertyChart,
  "albany-seating-chart.jpg": albanyChart,
  "cleveland-seating-chart-small.png": clevelandChart,
  "cleveland-seating-chart-small.jpg": clevelandChart,
  "omaha-seating-chart.png": omahaChart,
  "orlando-seating.png": orlandoChart,
  "tampa-seating-chart.png": tampaChart,
  "toledo-chart.jpg": toledoChart,
  "toledo-chart-new.jpeg": toledoChart,
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
  { match: /tampa|standupmedia/i, url: tampaChart },
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

function isPackComponentUri(text: string) {
  return (
    text.includes(";component/") ||
    /^\/ClubMan\b/i.test(text) ||
    /\\Resources\\/i.test(text)
  )
}

/** Map desktop pack URI / Resources filename → bundled chart URL. */
export function packChartUriToUrl(packUri: unknown): string | null {
  if (typeof packUri !== "string") {
    return null
  }
  const text = packUri.trim()
  if (!text) {
    return null
  }

  const fileMatch = text.match(/([^/\\]+\.(?:png|jpe?g|gif|bmp))$/i)
  if (fileMatch?.[1]) {
    const byFile = CHART_URL_BY_FILENAME[fileMatch[1].toLowerCase()]
    if (byFile) {
      return byFile
    }
  }

  if (/tampa/i.test(text)) {
    return tampaChart
  }
  if (/columbus/i.test(text)) {
    return columbusChart
  }
  if (/liberty/i.test(text)) {
    return libertyChart
  }

  return null
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

function normalizeBase64Payload(text: string): string {
  let payload = text.trim()
  const dataMatch = payload.match(/^data:([^;,]+)?(;base64)?,([\s\S]+)$/i)
  if (dataMatch) {
    payload = dataMatch[3] ?? ""
  }
  // API / JSON sometimes insert whitespace in large base64 blobs.
  return payload.replace(/\s+/g, "")
}

function bytesFromUnknown(chartImage: unknown): Uint8Array | null {
  if (Array.isArray(chartImage) && chartImage.length > 32) {
    return Uint8Array.from(chartImage.map((n) => Number(n) & 0xff))
  }

  if (chartImage instanceof Uint8Array && chartImage.length > 32) {
    return chartImage
  }

  if (chartImage instanceof ArrayBuffer && chartImage.byteLength > 32) {
    return new Uint8Array(chartImage)
  }

  // Some serializers nest base64 under $value / value.
  if (chartImage && typeof chartImage === "object") {
    const record = chartImage as Record<string, unknown>
    for (const key of ["$value", "value", "Value", "Bytes", "bytes", "data"]) {
      const nested = record[key]
      if (typeof nested === "string" || Array.isArray(nested)) {
        return bytesFromUnknown(nested)
      }
    }
  }

  return null
}

/**
 * Convert API ChartImage / ByteImgSource into a browser-usable URL.
 * Never treats desktop pack URIs (`/ClubMan;component/...`) as HTTP paths.
 */
export function chartImageBytesToUrl(chartImage: unknown): string | null {
  if (chartImage == null) {
    return null
  }

  if (typeof chartImage === "string") {
    const text = chartImage.trim()
    if (!text || text === "null" || text === "undefined") {
      return null
    }

    if (text.startsWith("blob:") || text.startsWith("http://") || text.startsWith("https://")) {
      return text
    }

    // Desktop ChartImageSource pack URI — resolve via bundled assets, not as URL.
    if (isPackComponentUri(text) || packChartUriToUrl(text)) {
      return packChartUriToUrl(text)
    }

    // Bare absolute path that isn't a pack URI (e.g. /assign-seats-charts/...)
    if (text.startsWith("/") && !text.includes(";")) {
      return text
    }

    if (text.startsWith("data:")) {
      return text
    }

    const base64 = normalizeBase64Payload(text)
    if (base64.length < 64) {
      return null
    }

    // Reject non-base64 (pack leftovers, XML, etc.)
    if (!/^[A-Za-z0-9+/]+=*$/.test(base64.slice(0, 80))) {
      return packChartUriToUrl(text)
    }

    return `data:${mimeFromBase64Prefix(base64)};base64,${base64}`
  }

  const bytes = bytesFromUnknown(chartImage)
  if (bytes && bytes.length > 32) {
    const copy = new Uint8Array(bytes.byteLength)
    copy.set(bytes)
    const blob = new Blob([copy.buffer], { type: sniffImageMime(copy) })
    return URL.createObjectURL(blob)
  }

  return null
}

/**
 * Desktop GetTablesAndFillChart image rules:
 * - Prefer API ChartImage whenever present (XAML binds AssignSeatChart)
 * - Else API ChartImageSource pack URI → bundled Resources file
 * - columbus* with no API image → local Columbus.jpg
 * - else → local pack file by ConnectionName (Standupmedia → Tampa)
 * - Never invent Columbus for non-columbus connections
 */
export function resolveAssignSeatChartUrl({
  connectionName,
  chartImage,
  chartImageSource,
}: {
  connectionName: string
  chartImage?: unknown
  chartImageSource?: unknown
}) {
  const fromApiBytes = chartImageBytesToUrl(chartImage)
  if (fromApiBytes) {
    return fromApiBytes
  }

  const fromSource = packChartUriToUrl(chartImageSource)
  if (fromSource) {
    return fromSource
  }

  if (isColumbusStyleConnection(connectionName)) {
    return columbusChart
  }

  return staticChartUrlForConnection(connectionName)
}

/**
 * ChartD text overlay only when boxes are empty (Columbus.jpg).
 * Numbered charts (Tampa/Liberty API bytes) already include labels.
 * Desktop ChartFillUpVisibility=Collapsed for API V2 Tampa-style clubs.
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
