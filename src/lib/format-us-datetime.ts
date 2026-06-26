/** Matches desktop `Convert.ToString(DateTime.Now)` (no comma). */
export function formatDesktopDateTime(date: Date) {
  return date
    .toLocaleString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    })
    .replace(",", "")
}

/** Matches desktop `DateTime.USDateTimeFormat()` → MM/dd/yyyy hh:mm:ss tt */
export function formatUsDateTime(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const year = date.getFullYear()

  let hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, "0")
  const seconds = String(date.getSeconds()).padStart(2, "0")
  const ampm = hours >= 12 ? "PM" : "AM"
  hours = hours % 12
  if (hours === 0) {
    hours = 12
  }

  const hoursStr = String(hours).padStart(2, "0")
  return `${month}/${day}/${year} ${hoursStr}:${minutes}:${seconds} ${ampm}`
}
