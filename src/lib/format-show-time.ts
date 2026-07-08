type FormatShowTimeOptions = {
  seconds?: boolean
}

function parseTimeParts(value: string) {
  const twelveHourMatch = value
    .trim()
    .match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)$/i)

  if (twelveHourMatch) {
    const period = twelveHourMatch[4].toUpperCase()
    const rawHour = Number.parseInt(twelveHourMatch[1], 10)
    let hours = rawHour % 12

    if (period === "PM") {
      hours += 12
    }

    return {
      hours,
      minutes: Number.parseInt(twelveHourMatch[2], 10),
      seconds: Number.parseInt(twelveHourMatch[3] ?? "0", 10),
    }
  }

  const timeMatch = value
    .trim()
    .match(/^(?:\d{4}-\d{2}-\d{2}T)?(\d{1,2}):(\d{2})(?::(\d{2}))?/)

  if (timeMatch) {
    return {
      hours: Number.parseInt(timeMatch[1], 10),
      minutes: Number.parseInt(timeMatch[2], 10),
      seconds: Number.parseInt(timeMatch[3] ?? "0", 10),
    }
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return {
    hours: date.getHours(),
    minutes: date.getMinutes(),
    seconds: date.getSeconds(),
  }
}

export function formatShowTime(
  value: string | null | undefined,
  options: FormatShowTimeOptions = {}
): string {
  if (!value) return ""

  const parsed = parseTimeParts(value)

  if (
    !parsed ||
    Number.isNaN(parsed.hours) ||
    Number.isNaN(parsed.minutes) ||
    Number.isNaN(parsed.seconds)
  ) {
    return value
  }

  const period = parsed.hours >= 12 ? "PM" : "AM"
  const hour12 = parsed.hours % 12 || 12
  const minuteText = String(parsed.minutes).padStart(2, "0")

  if (options.seconds) {
    return `${hour12}:${minuteText}:${String(parsed.seconds).padStart(2, "0")} ${period}`
  }

  return `${hour12}:${minuteText} ${period}`
}
