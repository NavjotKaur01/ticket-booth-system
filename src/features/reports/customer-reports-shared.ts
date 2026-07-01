import dayjs from "dayjs"

export const CUSTOMER_REPORT_STYLES = `
  body { margin: 0; padding: 25px; color: #111; font-family: "Times New Roman", Times, serif; font-size: 12px; }
  table { width: 100%; border-collapse: collapse; margin-top: 16px; }
  th, td { border: 1px solid #999; padding: 4px 6px; vertical-align: top; }
  th { font-weight: 700; text-align: left; background: #f3f3f3; }
  .title { font-size: 16px; font-weight: 700; text-align: center; padding: 8px 0 12px; }
  .range td { border: none; padding: 2px 6px 10px 0; }
  .range .label { font-weight: 700; }
`

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export function safeStr(value: unknown): string {
  if (value == null || value === "") return ""
  return String(value)
}

export function formatDesktopDate(value: string) {
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.format("MM/DD/YYYY") : value
}

export function formatDesktopDateTime(value: string) {
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.format("MM/DD/YYYY HH:mm") : value
}

export function buildCustomerReportDesktopHtml({
  title,
  startDate,
  endDate,
  headers,
  rows,
  emptyColspan,
}: {
  title: string
  startDate: string
  endDate: string
  headers: string[]
  rows: string[][]
  emptyColspan: number
}): string {
  const headerCells = headers.map((label) => `<th>${escapeHtml(label)}</th>`).join("")
  const bodyRows = rows.length
    ? rows
        .map(
          (cells) =>
            `<tr>${cells.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`
        )
        .join("")
    : `<tr><td colspan="${emptyColspan}" style="text-align:center;padding:24px;">No records found</td></tr>`

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    <style>${CUSTOMER_REPORT_STYLES}</style>
  </head>
  <body>
    <div class="title">${escapeHtml(title)}</div>
    <table class="range">
      <tr>
        <td class="label">Date Range:</td>
        <td>${escapeHtml(formatDesktopDate(startDate))}</td>
        <td class="label">To:</td>
        <td>${escapeHtml(formatDesktopDate(endDate))}</td>
      </tr>
    </table>
    <table>
      <thead><tr>${headerCells}</tr></thead>
      <tbody>${bodyRows}</tbody>
    </table>
  </body>
</html>`
}
