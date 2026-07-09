export function parseShowTimeFromAdminLabel(showDateLabel: string): string | undefined {
  const match = showDateLabel.match(/(\d{1,2}:\d{2}\s*[AP]M)\s*$/i)
  if (!match) {
    return undefined
  }

  return match[1].replace(/\s+/g, " ").trim().toUpperCase()
}

export function showTimeLabelsMatch(left: string, right: string): boolean {
  const normalize = (value: string) =>
    value.replace(/\s+/g, " ").trim().toUpperCase().replace(/^0(\d:)/, "$1")

  return normalize(left) === normalize(right)
}
