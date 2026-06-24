/** Parse API date strings in ISO or desktop US format (MM/dd/yyyy hh:mm:ss tt). */
export function parseApiDate(value: string | null | undefined) {
  if (!value?.trim()) {
    return null
  }

  const slashMatch = value.trim().match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?)?$/i
  )

  if (slashMatch) {
    const [, month, day, year, hour = "0", minute = "0", second = "0", ampm] =
      slashMatch
    let hours = Number(hour)

    if (ampm) {
      const isPm = ampm.toUpperCase() === "PM"
      if (hours === 12) {
        hours = isPm ? 12 : 0
      } else if (isPm) {
        hours += 12
      }
    }

    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      hours,
      Number(minute),
      Number(second)
    )
  }

  const parsed = new Date(value)
  if (!Number.isNaN(parsed.getTime())) {
    return parsed
  }

  return null
}

export function parseApiDateOrFallback(
  value: string | null | undefined,
  fallback: Date
) {
  return parseApiDate(value) ?? fallback
}
