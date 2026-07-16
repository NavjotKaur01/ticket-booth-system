import { FileDown, LoaderCircle } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import CalendarDatePickerControl from "@/components/calendar/controls/CalendarDatePickerControl"
import { VenueNoLocationState } from "@/components/common/venue-no-location-state"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getGiftOfLaughterByLocation } from "@/features/gift-of-laughter/gift-of-laughter.service"
import { useAppSession } from "@/hooks/use-app-session"
import { reportError, toastSuccess } from "@/lib/app-toast"
import { downloadCsv } from "@/lib/download-csv"
import { buildExportMatrix, type ExportColumn } from "@/lib/export-table-data"
import type {
  GiftOfLaughterFilters,
  GiftOfLaughterRecord,
} from "@/types/gift-of-laughter"
import { EMPTY_GIFT_OF_LAUGHTER_FILTERS } from "@/types/gift-of-laughter"

const EXPORT_COLUMNS: ExportColumn<GiftOfLaughterRecord>[] = [
  { header: "Gift Type", value: (row) => row.giftType },
  { header: "Sender's First Name", value: (row) => row.senderFirstName },
  { header: "Sender's Last Name", value: (row) => row.senderLastName },
  { header: "Sender's Email", value: (row) => row.senderEmail },
  { header: "Receiver's First Name", value: (row) => row.receiverFirstName },
  { header: "Receiver's Last Name", value: (row) => row.receiverLastName },
  { header: "Receiver's Address", value: (row) => row.receiverAddress },
  { header: "Receiver's Email", value: (row) => row.receiverEmail },
  { header: "Shipped By", value: (row) => row.shippedBy },
  {
    header: "Original Amount",
    value: (row) => formatCurrency(row.originalAmount),
  },
  {
    header: "Remaining Balance",
    value: (row) => formatCurrency(row.remainingBalance),
  },
  { header: "Date Created", value: (row) => formatDisplayDate(row.dateCreated) },
  { header: "Trans ID", value: (row) => row.transId },
]

type FilterKey = keyof GiftOfLaughterFilters

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value)
}

function formatDisplayDate(value: string) {
  if (!value) {
    return "-"
  }

  const parsed = new Date(`${value}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  }).format(parsed)
}

function matchesTextFilter(value: string, query: string) {
  if (!query.trim()) {
    return true
  }

  return value.toLowerCase().includes(query.trim().toLowerCase())
}

function matchesAmountFilter(value: number, query: string) {
  if (!query.trim()) {
    return true
  }

  const normalized = query.trim().replace(/[$,]/g, "")
  return String(value).includes(normalized) || formatCurrency(value).includes(query.trim())
}

function filterGiftOfLaughterRows(
  rows: GiftOfLaughterRecord[],
  filters: GiftOfLaughterFilters
) {
  return rows.filter((row) => {
    if (!matchesTextFilter(row.giftType, filters.giftType)) return false
    if (!matchesTextFilter(row.senderFirstName, filters.senderFirstName)) return false
    if (!matchesTextFilter(row.senderLastName, filters.senderLastName)) return false
    if (!matchesTextFilter(row.senderEmail, filters.senderEmail)) return false
    if (!matchesTextFilter(row.receiverFirstName, filters.receiverFirstName)) return false
    if (!matchesTextFilter(row.receiverLastName, filters.receiverLastName)) return false
    if (!matchesTextFilter(row.receiverAddress, filters.receiverAddress)) return false
    if (!matchesTextFilter(row.receiverEmail, filters.receiverEmail)) return false
    if (!matchesTextFilter(row.shippedBy, filters.shippedBy)) return false
    if (!matchesAmountFilter(row.originalAmount, filters.originalAmount)) return false
    if (!matchesAmountFilter(row.remainingBalance, filters.remainingBalance)) return false
    if (!matchesTextFilter(row.transId, filters.transId)) return false

    if (filters.dateCreated.trim()) {
      if (row.dateCreated !== filters.dateCreated) {
        return false
      }
    }

    return true
  })
}

function downloadWorkbook(
  headers: string[],
  rows: string[][],
  filename: string,
  mimeType: string
) {
  const content = [headers.join("\t"), ...rows.map((row) => row.join("\t"))].join("\n")
  // Add BOM for UTF-8 compatibility
  const blob = new Blob(["\ufeff", content], { type: mimeType })
  
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

function EmptyState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="rounded-sm border border-dashed border-border bg-muted/20 px-4 py-10 text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

export function GiftOfLaughterScreen() {
  const { locationId, locationName } = useAppSession()

  const [rows, setRows] = useState<GiftOfLaughterRecord[]>([])
  const [filters, setFilters] = useState<GiftOfLaughterFilters>(
    EMPTY_GIFT_OF_LAUGHTER_FILTERS
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [exportingFormat, setExportingFormat] = useState<
    "xls" | "xlsx" | "csv" | null
  >(null)

  const filteredRows = useMemo(
    () => filterGiftOfLaughterRows(rows, filters),
    [rows, filters]
  )

  const hasActiveFilters = useMemo(
    () => Object.values(filters).some((value) => value.trim().length > 0),
    [filters]
  )

  useEffect(() => {
    if (!locationId) {
      setRows([])
      setFilters(EMPTY_GIFT_OF_LAUGHTER_FILTERS)
      setLoading(false)
      setError(null)
      setStatusMessage(null)
      return
    }

    let isActive = true
    setLoading(true)
    setError(null)
    setStatusMessage(null)
    setRows([])
    setFilters(EMPTY_GIFT_OF_LAUGHTER_FILTERS)

    getGiftOfLaughterByLocation({
      locationId,
      locationLabel: locationName,
    })
      .then((result) => {
        if (isActive) {
          setRows(result)
        }
      })
      .catch((requestError: unknown) => {
        if (isActive) {
          reportError(setError, requestError, "Unable to load Gift of Laughter records.")
        }
      })
      .finally(() => {
        if (isActive) {
          setLoading(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [locationId, locationName])

  function updateFilter<K extends FilterKey>(key: K, value: GiftOfLaughterFilters[K]) {
    setFilters((current) => ({ ...current, [key]: value }))
    setStatusMessage(null)
  }

  function clearFilters() {
    setFilters(EMPTY_GIFT_OF_LAUGHTER_FILTERS)
    setStatusMessage("Filters cleared.")
  }

  async function handleExport(format: "xls" | "xlsx" | "csv") {
    if (filteredRows.length === 0) {
      setStatusMessage("No rows available to export for the current filter selection.")
      return
    }

    setExportingFormat(format)
    setStatusMessage(null)

    try {
      const { headers, rows: matrixRows } = buildExportMatrix(
        filteredRows,
        EXPORT_COLUMNS
      )
      const filenameBase = `gift-of-laughter-${locationName || locationId}`
        .replace(/\s+/g, "-")
        .toLowerCase()

      if (format === "csv") {
        downloadCsv(headers, matrixRows, `${filenameBase}.csv`)
      } else if (format === "xls") {
        downloadWorkbook(
          headers,
          matrixRows,
          `${filenameBase}.xls`,
          "application/vnd.ms-excel"
        )
      } else {
        downloadWorkbook(
          headers,
          matrixRows,
          `${filenameBase}.xlsx`,
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
      }

      const exportMessage = `Exported ${filteredRows.length} Gift of Laughter record${filteredRows.length === 1 ? "" : "s"} to ${format.toUpperCase()}.`
      setStatusMessage(exportMessage)
      toastSuccess(exportMessage)
    } finally {
      setExportingFormat(null)
    }
  }

  function renderFilterInput(key: FilterKey, placeholder: string) {
    return (
      <Input
        value={filters[key]}
        onChange={(event) => updateFilter(key, event.target.value)}
        placeholder={placeholder}
        className="h-8 bg-background text-xs"
        disabled={!locationId || loading}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Location Gift of Laughter Management
        </h1>
        <p className="text-sm text-muted-foreground">
          Review Gift of Laughter purchases and balances for the header-selected
          location using mock service data until the backend is connected.
        </p>
      </div>

      <Card className="gap-0 py-0">
        <CardHeader className="border-b bg-muted/40 px-4 py-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-foreground">
              Location Gift of Laughter Management
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="gap-2"
                disabled={!locationId || loading || filteredRows.length === 0 || exportingFormat != null}
                onClick={() => void handleExport("xls")}
              >
                {exportingFormat === "xls" ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <FileDown className="size-4" />
                )}
                Export to XLS
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="gap-2"
                disabled={!locationId || loading || filteredRows.length === 0 || exportingFormat != null}
                onClick={() => void handleExport("xlsx")}
              >
                {exportingFormat === "xlsx" ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <FileDown className="size-4" />
                )}
                Export to XLSX
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="gap-2"
                disabled={!locationId || loading || filteredRows.length === 0 || exportingFormat != null}
                onClick={() => void handleExport("csv")}
              >
                {exportingFormat === "csv" ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <FileDown className="size-4" />
                )}
                Export to CSV
              </Button>
              {hasActiveFilters ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!locationId || loading}
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              ) : null}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-0 px-0 py-0">
          {error ? (
            <div className="px-4 pt-4">
              <p className="rounded-sm border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            </div>
          ) : null}

          {!locationId ? (
            <div className="p-4">
              <VenueNoLocationState featureLabel="Gift of Laughter records" />
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center gap-2 px-4 py-12 text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" />
              Loading Gift of Laughter records...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[96rem]">
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="min-w-36 px-3">Gift Type</TableHead>
                    <TableHead className="min-w-36 px-3">Sender&apos;s First Name</TableHead>
                    <TableHead className="min-w-36 px-3">Sender&apos;s Last Name</TableHead>
                    <TableHead className="min-w-44 px-3">Sender&apos;s Email</TableHead>
                    <TableHead className="min-w-40 px-3">Receiver&apos;s First Name</TableHead>
                    <TableHead className="min-w-40 px-3">Receiver&apos;s Last Name</TableHead>
                    <TableHead className="min-w-56 px-3">Receiver&apos;s Address</TableHead>
                    <TableHead className="min-w-44 px-3">Receiver&apos;s Email</TableHead>
                    <TableHead className="min-w-28 px-3">Shipped By</TableHead>
                    <TableHead className="min-w-32 px-3">Original Amount</TableHead>
                    <TableHead className="min-w-36 px-3">Remaining Balance</TableHead>
                    <TableHead className="min-w-32 px-3">Date Created</TableHead>
                    <TableHead className="min-w-32 px-3">Trans ID</TableHead>
                  </TableRow>
                  <TableRow className="bg-background hover:bg-background">
                    <TableCell className="px-3 py-2">
                      {renderFilterInput("giftType", "Filter gift type")}
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      {renderFilterInput("senderFirstName", "Filter first name")}
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      {renderFilterInput("senderLastName", "Filter last name")}
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      {renderFilterInput("senderEmail", "Filter email")}
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      {renderFilterInput("receiverFirstName", "Filter first name")}
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      {renderFilterInput("receiverLastName", "Filter last name")}
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      {renderFilterInput("receiverAddress", "Filter address")}
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      {renderFilterInput("receiverEmail", "Filter email")}
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      {renderFilterInput("shippedBy", "Filter ship method")}
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      {renderFilterInput("originalAmount", "Filter amount")}
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      {renderFilterInput("remainingBalance", "Filter balance")}
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      <CalendarDatePickerControl
                        id="gift-of-laughter-date-created-filter"
                        value={filters.dateCreated}
                        onChange={(value) => updateFilter("dateCreated", value)}
                        placeholder="Filter date"
                        className="h-8 w-full min-w-[9rem] text-xs"
                      />
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      {renderFilterInput("transId", "Filter trans ID")}
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRows.length === 0 ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={13} className="px-4 py-10 text-center">
                        <EmptyState
                          title="No data to display"
                          description={
                            rows.length === 0
                              ? "This location does not have Gift of Laughter records in the mock service yet."
                              : "Adjust the column filters to find matching Gift of Laughter records."
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="px-3 font-medium text-foreground">
                          {row.giftType}
                        </TableCell>
                        <TableCell className="px-3">{row.senderFirstName}</TableCell>
                        <TableCell className="px-3">{row.senderLastName}</TableCell>
                        <TableCell className="px-3">{row.senderEmail}</TableCell>
                        <TableCell className="px-3">{row.receiverFirstName}</TableCell>
                        <TableCell className="px-3">{row.receiverLastName}</TableCell>
                        <TableCell className="px-3">{row.receiverAddress}</TableCell>
                        <TableCell className="px-3">{row.receiverEmail}</TableCell>
                        <TableCell className="px-3">{row.shippedBy}</TableCell>
                        <TableCell className="px-3 tabular-nums">
                          {formatCurrency(row.originalAmount)}
                        </TableCell>
                        <TableCell className="px-3 tabular-nums">
                          {formatCurrency(row.remainingBalance)}
                        </TableCell>
                        <TableCell className="px-3 tabular-nums">
                          {formatDisplayDate(row.dateCreated)}
                        </TableCell>
                        <TableCell className="px-3 font-medium text-foreground">
                          {row.transId}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col items-start justify-between gap-3 border-t px-4 py-3 sm:flex-row sm:items-center">
          <div aria-live="polite" className="text-sm text-muted-foreground">
            {locationId
              ? statusMessage ||
                `${filteredRows.length} of ${rows.length} Gift of Laughter record${rows.length === 1 ? "" : "s"} shown for ${locationName}.`
              : "Select a location from the header to begin reviewing Gift of Laughter records."}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
