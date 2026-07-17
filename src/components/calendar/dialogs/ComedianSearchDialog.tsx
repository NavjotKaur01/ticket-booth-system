import { Search } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { getClubmanErrorMessage } from "@/store/api/baseQuery"
import { useSearchComediansMutation } from "@/store/api/clubmanApi"
import type { ApiComedianSearchItem } from "@/types/api/save-show"

export type ComedianSearchSelection = {
  id: string
  name: string
}

type ComedianSearchFilters = {
  lastName: string
  firstName: string
  stageName: string
  showInactive: boolean
}

type ComedianSearchRow = {
  id: string
  comicName: string
  lastName: string
  firstName: string
  stageName: string
}

const EMPTY_FILTERS: ComedianSearchFilters = {
  lastName: "",
  firstName: "",
  stageName: "",
  showInactive: false,
}

/** Persists across dialog open/close while the parent stays mounted. */
const comedianSearchCache = new Map<string, ComedianSearchRow[]>()

type ComedianSearchDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  connectionString: string
  locationId: string
  onSelect: (comedian: ComedianSearchSelection) => void
}

function getCacheKey(
  connectionString: string,
  locationId: string,
  filters: ComedianSearchFilters
) {
  return [
    connectionString,
    locationId,
    filters.lastName.trim().toLowerCase(),
    filters.firstName.trim().toLowerCase(),
    filters.stageName.trim().toLowerCase(),
    filters.showInactive ? "1" : "0",
  ].join("|")
}

function formatComedianDisplayName(item: ApiComedianSearchItem) {
  return (
    item.ComicName?.trim() ||
    item.StageName?.trim() ||
    [item.LastName, item.FirstName].filter(Boolean).join(", ") ||
    "Comedian"
  )
}

function mapComedianRows(items: ApiComedianSearchItem[]): ComedianSearchRow[] {
  return (items ?? []).map((item) => ({
    id: item.ComicID,
    comicName: formatComedianDisplayName(item),
    lastName: item.LastName?.trim() ?? "",
    firstName: item.FirstName?.trim() ?? "",
    stageName: item.StageName?.trim() ?? "",
  }))
}

function ComedianSearchTableSkeleton() {
  return (
    <div className="space-y-2 p-3" aria-label="Loading comedians">
      {Array.from({ length: 8 }).map((_, index) => (
        <Skeleton key={index} className="h-8 w-full" />
      ))}
    </div>
  )
}

export default function ComedianSearchDialog({
  open,
  onOpenChange,
  connectionString,
  locationId,
  onSelect,
}: ComedianSearchDialogProps) {
  const [filters, setFilters] = useState<ComedianSearchFilters>(EMPTY_FILTERS)
  const [rows, setRows] = useState<ComedianSearchRow[]>([])
  const [highlightedId, setHighlightedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [searchComedians, { isLoading }] = useSearchComediansMutation()

  const previousShowInactive = useRef(filters.showInactive)
  const hasInitializedRef = useRef(false)
  const lastFetchedKeyRef = useRef<string | null>(null)
  const isDialogOpenRef = useRef(false)

  function resetDialogSession() {
    setFilters(EMPTY_FILTERS)
    setRows([])
    setHighlightedId(null)
    setError(null)
    previousShowInactive.current = EMPTY_FILTERS.showInactive
    hasInitializedRef.current = false
    lastFetchedKeyRef.current = null
    isDialogOpenRef.current = false
  }

  const runSearch = useCallback(
    async (nextFilters: ComedianSearchFilters) => {
      if (!connectionString || !locationId) {
        setRows([])
        setError("Location is required before searching comedians.")
        return
      }

      const cacheKey = getCacheKey(connectionString, locationId, nextFilters)
      const cached = comedianSearchCache.get(cacheKey)

      if (cached) {
        setRows(cached)
        setError(null)
        lastFetchedKeyRef.current = cacheKey
        return
      }

      setError(null)

      try {
        const data = await searchComedians({
          ConnectionString: connectionString,
          LocationId: locationId,
          LastName: nextFilters.lastName.trim(),
          FirstName: nextFilters.firstName.trim(),
          StageName: nextFilters.stageName.trim(),
          IsActiveComedian: nextFilters.showInactive,
          IsComedianSerach: "",
        }).unwrap()

        const mapped = mapComedianRows(data ?? [])
        comedianSearchCache.set(cacheKey, mapped)
        if (!isDialogOpenRef.current) return
        lastFetchedKeyRef.current = cacheKey
        setRows(mapped)
      } catch (requestError) {
        if (!isDialogOpenRef.current) return
        setRows([])
        setError(getClubmanErrorMessage(requestError))
      }
    },
    [connectionString, locationId, searchComedians]
  )

  useEffect(() => {
    if (!open) {
      isDialogOpenRef.current = false
      return
    }

    isDialogOpenRef.current = true

    if (hasInitializedRef.current) {
      return
    }

    hasInitializedRef.current = true
    setHighlightedId(null)
    setError(null)
    previousShowInactive.current = filters.showInactive
    void runSearch(filters)
    // Intentionally only on open — filter-driven searches use Search / Show Inactive.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, runSearch])

  useEffect(() => {
    if (!open || !hasInitializedRef.current) {
      return
    }

    if (previousShowInactive.current === filters.showInactive) {
      return
    }

    previousShowInactive.current = filters.showInactive
    void runSearch(filters)
  }, [filters, open, runSearch])

  function updateFilter<K extends keyof ComedianSearchFilters>(
    field: K,
    value: ComedianSearchFilters[K]
  ) {
    setFilters((current) => ({ ...current, [field]: value }))
  }

  function handleSelect(row: ComedianSearchRow) {
    onSelect({ id: row.id, name: row.comicName })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onAfterClose={resetDialogSession}
        className="flex h-[min(90vh,40rem)] max-h-[calc(100vh-2rem)] w-full flex-col overflow-hidden sm:max-w-4xl"
      >
        <DialogHeader className="sticky top-0 z-20 shrink-0 border-b bg-background px-5 py-4">
          <DialogTitle className="text-lg">Comedian Information</DialogTitle>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden px-5 py-4">
          <div className="flex shrink-0 flex-col gap-3">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end">
              <div className="grid min-w-0 gap-1.5">
                <Label htmlFor="comedian-search-last-name">Last Name</Label>
                <Input
                  id="comedian-search-last-name"
                  value={filters.lastName}
                  onChange={(event) => updateFilter("lastName", event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault()
                      void runSearch(filters)
                    }
                  }}
                />
              </div>
              <div className="grid min-w-0 gap-1.5">
                <Label htmlFor="comedian-search-first-name">First Name</Label>
                <Input
                  id="comedian-search-first-name"
                  value={filters.firstName}
                  onChange={(event) => updateFilter("firstName", event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault()
                      void runSearch(filters)
                    }
                  }}
                />
              </div>
              <div className="grid min-w-0 gap-1.5">
                <Label htmlFor="comedian-search-stage-name">Stage Name</Label>
                <Input
                  id="comedian-search-stage-name"
                  value={filters.stageName}
                  onChange={(event) => updateFilter("stageName", event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault()
                      void runSearch(filters)
                    }
                  }}
                />
              </div>
              <Button
                type="button"
                className="shrink-0 gap-1.5 sm:self-end"
                onClick={() => void runSearch(filters)}
                disabled={isLoading}
              >
                <Search className="size-4" />
                Search
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="comedian-search-show-inactive"
                checked={filters.showInactive}
                onCheckedChange={(checked) =>
                  updateFilter("showInactive", checked === true)
                }
              />
              <Label htmlFor="comedian-search-show-inactive">Show Inactive</Label>
            </div>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border">
            {isLoading ? (
              <ComedianSearchTableSkeleton />
            ) : (
              <div className="min-h-0 flex-1 overflow-auto">
                <Table className="min-w-[44rem] table-fixed border-collapse">
                  <TableHeader className="text-muted-foreground shadow-sm">
                    <TableRow>
                      <TableHead className="sticky top-0 z-10 w-56 border bg-muted px-3 py-2 font-semibold">
                        Comic Name
                      </TableHead>
                      <TableHead className="sticky top-0 z-10 w-36 border bg-muted px-3 py-2 font-semibold">
                        Last Name
                      </TableHead>
                      <TableHead className="sticky top-0 z-10 w-36 border bg-muted px-3 py-2 font-semibold">
                        First Name
                      </TableHead>
                      <TableHead className="sticky top-0 z-10 w-48 border bg-muted px-3 py-2 font-semibold">
                        Stage Name
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="border px-3 py-8 text-center text-sm text-muted-foreground"
                        >
                          No comedian found
                        </TableCell>
                      </TableRow>
                    ) : (
                      rows.map((row) => {
                        const isSelected = highlightedId === row.id
                        return (
                          <TableRow
                            key={row.id}
                            className={cn(
                              "cursor-pointer",
                              isSelected
                                ? "bg-primary/20 hover:bg-primary/20"
                                : "odd:bg-background even:bg-muted/20 hover:bg-muted/40"
                            )}
                            onClick={() => setHighlightedId(row.id)}
                            onDoubleClick={() => handleSelect(row)}
                          >
                            <TableCell
                              className={cn(
                                "max-w-56 truncate border px-3 py-2 whitespace-nowrap",
                                isSelected && "bg-primary/20"
                              )}
                              title={row.comicName}
                            >
                              {row.comicName}
                            </TableCell>
                            <TableCell
                              className={cn(
                                "max-w-36 truncate border px-3 py-2 whitespace-nowrap",
                                isSelected && "bg-primary/20"
                              )}
                              title={row.lastName}
                            >
                              {row.lastName}
                            </TableCell>
                            <TableCell
                              className={cn(
                                "max-w-36 truncate border px-3 py-2 whitespace-nowrap",
                                isSelected && "bg-primary/20"
                              )}
                              title={row.firstName}
                            >
                              {row.firstName}
                            </TableCell>
                            <TableCell
                              className={cn(
                                "max-w-48 truncate border px-3 py-2 whitespace-nowrap",
                                isSelected && "bg-primary/20"
                              )}
                              title={row.stageName}
                            >
                              {row.stageName}
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="shrink-0 border-t px-5 py-4">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
