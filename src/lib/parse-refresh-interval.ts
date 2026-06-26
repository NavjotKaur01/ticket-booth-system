/** Desktop DailyTransactionVM enforces a minimum 10-second auto-refresh interval. */
export function parseTransactionRefreshMs(value: string) {
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 0
  }

  return Math.max(parsed, 10) * 1000
}

export function sanitizeRefreshSecondsInput(value: string) {
  return value.replace(/\D/g, "")
}
