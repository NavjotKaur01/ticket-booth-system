import type { ShowDetailsByDateItem } from "@/types/api/show-details"
import type { ShowOption } from "@/types/reservation"

function formatShowTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

function formatHeadlinerName(value: string | null) {
  if (!value?.trim()) {
    return ""
  }

  const trimmed = value.trim()
  if (!trimmed.includes(",")) {
    return trimmed
  }

  const [lastName, firstName] = trimmed.split(",").map((part) => part.trim())
  if (!firstName) {
    return lastName
  }

  return `${lastName}, ${firstName}`
}

export function mapShowDetailsToOptions(
  shows: ShowDetailsByDateItem[]
): ShowOption[] {
  return shows.map((show) => {
    const headliner = formatHeadlinerName(show.HeadlinerName)
    const time = formatShowTime(show.ShowTim || show.ShowDate)
    const label = headliner ? `${time} ${headliner}` : time

    return {
      id: show.ShowId,
      label,
      time,
      subtitle: "Main Theater",
      headliner: headliner || undefined,
    }
  })
}
