import {
  Pencil,
  SquarePlus,
  Trash2,
  LoaderCircle,
  Clock3,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { ScrollSelectControl } from "@/components/common/scroll-select-control"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAppSession } from "@/hooks/use-app-session"
import { getVenueInfoLocationOptions } from "@/features/venue-info/venue-info.service"
import { getVenueShowTimesByLocation } from "@/features/venue-show-times/venue-show-times.service"
import type { VenueShowTimeRecord } from "@/types/venue-show-time"

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

function BooleanPill({ value }: { value: boolean }) {
  return (
    <span
      className={value
        ? "inline-flex min-w-9 items-center justify-center rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300"
        : "inline-flex min-w-9 items-center justify-center rounded-full bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground"
      }
    >
      {value ? "Y" : "N"}
    </span>
  )
}

function ActionButton({
  label,
  onClick,
  tone = "default",
  children,
}: {
  label: string
  onClick: () => void
  tone?: "default" | "danger"
  children: React.ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onClick}
          className={tone === "danger"
            ? "text-destructive hover:bg-destructive/10 hover:text-destructive"
            : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
          }
        >
          {children}
          <span className="sr-only">{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  )
}

export function VenueShowTimesScreen() {
  const { locations } = useAppSession()

  const locationOptions = useMemo(
    () =>
      getVenueInfoLocationOptions(locations).map((option) => ({
        value: option.id,
        label: option.label,
      })),
    [locations]
  )

  const [selectedLocationId, setSelectedLocationId] = useState("")
  const [rows, setRows] = useState<VenueShowTimeRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)

  const selectedLocationLabel = useMemo(
    () =>
      locationOptions.find((option) => option.value === selectedLocationId)?.label ||
      "",
    [locationOptions, selectedLocationId]
  )

  useEffect(() => {
    if (!selectedLocationId) {
      setRows([])
      setLoading(false)
      setError(null)
      setActionMessage(null)
      return
    }

    let isActive = true
    setLoading(true)
    setError(null)
    setActionMessage(null)
    setRows([])

    getVenueShowTimesByLocation({
      locationId: selectedLocationId,
      locationLabel: selectedLocationLabel,
    })
      .then((result) => {
        if (isActive) {
          setRows(result)
        }
      })
      .catch((requestError: unknown) => {
        if (isActive) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load venue show times."
          )
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
  }, [selectedLocationId, selectedLocationLabel])

  function handleNew(row: VenueShowTimeRecord) {
    setActionMessage(`Mock action: create a new show time near ${row.dayOfWeek} ${row.showTime}.`)
  }

  function handleEdit(row: VenueShowTimeRecord) {
    setActionMessage(`Mock action: edit ${row.dayOfWeek} ${row.showTime} for ${selectedLocationLabel}.`)
  }

  function handleDelete(row: VenueShowTimeRecord) {
    setActionMessage(`Mock action: delete ${row.dayOfWeek} ${row.showTime} for ${selectedLocationLabel}.`)
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Venue Show Times
          </h1>
          <p className="text-sm text-muted-foreground">
            Review club show-time rules by location and manage them with mock actions
            until the backend is wired in.
          </p>
        </div>

        <Card className="gap-0 py-0">
          <CardContent className="grid gap-3 px-4 py-4 md:grid-cols-[minmax(0,18rem)_1fr] md:items-end">
            <div className="space-y-2">
              <Label htmlFor="venue-show-times-location">Location</Label>
              <ScrollSelectControl
                id="venue-show-times-location"
                value={selectedLocationId}
                onChange={setSelectedLocationId}
                options={locationOptions}
                placeholder="Select location"
                disabled={locationOptions.length === 0}
              />
            </div>

            <div className="rounded-sm border border-dashed border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
              Action icons are placed in the last column, and this grid uses the shared
              shadcn table primitives for a cleaner light and dark theme presentation.
            </div>
          </CardContent>
        </Card>

        <Card className="gap-0 py-0">
          <CardHeader className="border-b bg-primary px-4 py-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-primary-foreground">
              Club Show Times Data
            </CardTitle>
          </CardHeader>

          <CardContent className="px-0 py-0">
            {!selectedLocationId ? (
              <div className="p-4">
                <EmptyState
                  title="Select a location to view show times."
                  description="The table will load mock show-time data after you choose a location."
                />
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center gap-2 px-4 py-12 text-sm text-muted-foreground">
                <LoaderCircle className="size-4 animate-spin" />
                Loading show times...
              </div>
            ) : error ? (
              <div className="p-4">
                <p className="rounded-sm border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              </div>
            ) : rows.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  title="No show times found."
                  description="This location does not have mock show-time rows yet."
                />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="w-14 px-4">#</TableHead>
                    <TableHead>Day of Week</TableHead>
                    <TableHead>Show Time</TableHead>
                    <TableHead>Arrival Time</TableHead>
                    <TableHead>Dinner</TableHead>
                    <TableHead>No Passes</TableHead>
                    <TableHead>VIP</TableHead>
                    <TableHead>Over 21</TableHead>
                    <TableHead>Show Seating Chart</TableHead>
                    <TableHead className="px-4 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, index) => (
                    <TableRow key={row.id}>
                      <TableCell className="px-4 font-medium tabular-nums text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell>{row.dayOfWeek}</TableCell>
                      <TableCell className="font-medium text-foreground">{row.showTime}</TableCell>
                      <TableCell>{row.arrivalTime}</TableCell>
                      <TableCell><BooleanPill value={row.dinner} /></TableCell>
                      <TableCell><BooleanPill value={row.noPasses} /></TableCell>
                      <TableCell><BooleanPill value={row.vip} /></TableCell>
                      <TableCell><BooleanPill value={row.over21} /></TableCell>
                      <TableCell><BooleanPill value={row.showSeatingChart} /></TableCell>
                      <TableCell className="px-4">
                        <div className="flex items-center justify-end gap-1">
                          <ActionButton label="New show time" onClick={() => handleNew(row)}>
                            <SquarePlus className="size-4" />
                          </ActionButton>
                          <ActionButton label="Edit show time" onClick={() => handleEdit(row)}>
                            <Pencil className="size-4" />
                          </ActionButton>
                          <ActionButton
                            label="Delete show time"
                            onClick={() => handleDelete(row)}
                            tone="danger"
                          >
                            <Trash2 className="size-4" />
                          </ActionButton>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>

          <CardFooter className="flex flex-col items-start justify-between gap-3 border-t px-4 py-3 sm:flex-row sm:items-center">
            <div aria-live="polite" className="text-sm text-muted-foreground">
              {selectedLocationId
                ? actionMessage || `${rows.length} mock show-time row${rows.length === 1 ? "" : "s"} loaded for ${selectedLocationLabel}.`
                : "Choose a location to begin reviewing venue show times."}
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
              <Clock3 className="size-3.5" />
              Mock management mode
            </div>
          </CardFooter>
        </Card>
      </div>
    </TooltipProvider>
  )
}

