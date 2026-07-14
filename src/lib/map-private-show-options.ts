import { formatShowTime } from "@/lib/format-show-time"
import type { ShowDetailsByDateItem } from "@/types/api/show-details"

export type PrivateShowComicOption = {
  id: string
  label: string
}

export type PrivateShowOption = {
  id: string
  comicId: string
  label: string
}

function headlinerLabel(value: string | null | undefined) {
  const trimmed = (value ?? "").trim()
  if (!trimmed) return "Unknown"
  return trimmed
}

/** Private shows only — same filter as ShowTimesVM.GetShowsDetail. */
export function mapPrivateShowsForDate(
  items: ShowDetailsByDateItem[]
): PrivateShowOption[] {
  return (items ?? [])
    .filter((item) => item.IsPrivate)
    .map((item) => {
      const showDate = item.ShowDate ? new Date(item.ShowDate) : null
      const dayName =
        showDate && !Number.isNaN(showDate.getTime())
          ? showDate.toLocaleDateString("en-US", { weekday: "long" })
          : ""
      const datePart =
        showDate && !Number.isNaN(showDate.getTime())
          ? showDate.toLocaleDateString("en-US", {
              month: "2-digit",
              day: "2-digit",
              year: "numeric",
            })
          : ""
      const timePart = formatShowTime(item.ShowTim || item.ShowDate)
      const label = [dayName, datePart, timePart].filter(Boolean).join(" ")

      return {
        id: item.ShowId,
        comicId: item.ComicId,
        label: label || item.ShowId,
      }
    })
}

export function mapPrivateShowComics(
  shows: PrivateShowOption[],
  items: ShowDetailsByDateItem[]
): PrivateShowComicOption[] {
  const byId = new Map<string, string>()
  for (const item of items ?? []) {
    if (!item.IsPrivate || !item.ComicId) continue
    if (!byId.has(item.ComicId)) {
      byId.set(item.ComicId, headlinerLabel(item.HeadlinerName))
    }
  }

  // Prefer order from filtered private shows list.
  const ordered: PrivateShowComicOption[] = []
  const seen = new Set<string>()
  for (const show of shows) {
    if (seen.has(show.comicId)) continue
    seen.add(show.comicId)
    ordered.push({
      id: show.comicId,
      label: byId.get(show.comicId) ?? show.comicId,
    })
  }
  return ordered
}
