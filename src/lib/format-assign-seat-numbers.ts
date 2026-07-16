/**
 * Desktop ExtensionMethod.AssignSeatFormat.
 * Raw API: "#11$3,#15$1,#15$2,#15$3" → display: "3|1,2,3"
 * Same-table seats joined with ",", table changes with "|".
 */
export function formatAssignSeatNumbers(value: string | null | undefined): string {
  const raw = String(value ?? "").trim()
  if (!raw) {
    return ""
  }

  // Already display-formatted (no #token$seat tokens).
  if (!raw.includes("#") || !raw.includes("$")) {
    return raw
  }

  const parts = raw.split(",").map((part) => part.trim()).filter(Boolean)
  const tokens: Array<{ tableName: string; seat: string }> = []

  for (const item of parts) {
    const hash = item.indexOf("#")
    const dollar = item.indexOf("$")
    if (hash < 0 || dollar < 0 || dollar <= hash) {
      // Fallback: keep unparsed segment as a seat token.
      tokens.push({ tableName: "", seat: item })
      continue
    }
    tokens.push({
      tableName: item.slice(hash + 1, dollar),
      seat: item.slice(dollar + 1),
    })
  }

  let result = ""
  let tableNum = ""
  for (const item of tokens) {
    if (!tableNum || tableNum === item.tableName) {
      result += `,${item.seat}`
    } else {
      result += `|${item.seat}`
    }
    tableNum = item.tableName
  }

  return result.replace(/^,/, "")
}
