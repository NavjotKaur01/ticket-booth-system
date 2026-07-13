function escapeCsvValue(value: string | number) {
  const normalized = String(value ?? "")
  if (/[",\n]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`
  }

  return normalized
}

export function downloadCsv(
  headers: string[],
  rows: Array<Array<string | number>>,
  filename: string
) {
  const lines = [
    headers.map(escapeCsvValue).join(","),
    ...rows.map((row) => row.map(escapeCsvValue).join(",")),
  ]

  // Add BOM for UTF-8 compatibility
  const blob = new Blob(["\ufeff", lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  })
  
  if (typeof (navigator as any).msSaveOrOpenBlob === "function") {
    ;(navigator as any).msSaveOrOpenBlob(blob, filename)
    return
  }

  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  
  document.body.appendChild(link)
  link.click()
  link.remove()
  
  window.setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 100)
}
