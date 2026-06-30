export function coerceApiArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value as T[]
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>
    for (const key of ["Data", "data", "Items", "items", "Results", "results"]) {
      const nested = record[key]
      if (Array.isArray(nested)) {
        return nested as T[]
      }
    }
  }

  return []
}
