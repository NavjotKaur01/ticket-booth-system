import type { ShowTimeRow } from "@/types/show-time"

export type ShowTimeTableRow = ShowTimeRow & {
  startTimeRowSpan: number
  arrivalTimeRowSpan: number
}

export function enrichShowTimeRows(rows: ShowTimeRow[]): ShowTimeTableRow[] {
  return rows.map((row) => {
    const groupRows = rows.filter((item) => item.groupId === row.groupId)
    const indexInGroup = groupRows.findIndex((item) => item.id === row.id)
    const span = indexInGroup === 0 ? groupRows.length : 0

    return {
      ...row,
      startTimeRowSpan: span,
      arrivalTimeRowSpan: span,
    }
  })
}
