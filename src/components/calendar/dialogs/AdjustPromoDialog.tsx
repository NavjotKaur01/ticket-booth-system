import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDesktopDateTime } from "@/lib/format-us-datetime"
import { useAppSession } from "@/hooks/use-app-session"
import { getClubmanErrorMessage } from "@/store/api/baseQuery"
import {
  useGetShowPromotionMutation,
  useSaveShowPromotionMutation,
} from "@/store/api/clubmanApi"
import type { CalendarEvent } from "@/types/calendar-event"

import ShowHistoryTableSkeleton from "./ShowHistoryTableSkeleton"
import {
  buildSaveShowPromotionRequest,
  initializePromoSelections,
  togglePromoSelection,
  type AdjustPromoRow,
} from "../service/adjustPromo.service"

type AdjustPromoDialogProps = {
  open: boolean
  event: CalendarEvent | null
  onOpenChange: (open: boolean) => void
  onSave?: () => void
}

const COLUMNS = [
  { key: "checkbox", label: "" },
  { key: "code", label: "Promotion Code" },
  { key: "name", label: "Name" },
  { key: "startDate", label: "Start Date" },
  { key: "endDate", label: "End Date" },
  { key: "weekDays", label: "WeekDays" },
  { key: "discountType", label: "Discount Type" },
  { key: "walkUp", label: "WalkUp" },
  { key: "web", label: "Web" },
  { key: "phoneIn", label: "PhoneIn" },
  { key: "managerOnly", label: "Manager Only" },
  { key: "ccReq", label: "CCReq" },
] as const

function PromoTable({
  rows,
  disabled,
  onToggle,
}: {
  rows: AdjustPromoRow[]
  disabled: boolean
  onToggle: (promoId: string) => void
}) {
  const isEmpty = rows.length === 0

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden border">
      <div
        className={
          isEmpty
            ? "flex min-h-0 flex-1 flex-col overflow-auto"
            : "min-h-0 flex-1 overflow-auto"
        }
      >
        <Table className={`min-w-[72rem] border-collapse${isEmpty ? " shrink-0" : ""}`}>
          <TableHeader className="sticky top-0 z-10 bg-muted text-muted-foreground">
            <TableRow>
              {COLUMNS.map((column) => (
                <TableHead
                  key={column.key}
                  className={
                    column.key === "checkbox"
                      ? "border py-2 pl-3 pr-5 font-semibold whitespace-nowrap"
                      : "border px-3 py-2 font-semibold whitespace-nowrap"
                  }
                >
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          {!isEmpty && (
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id} className="odd:bg-background even:bg-muted/20">
                  <TableCell className="border py-2 pl-3 pr-5">
                    <Checkbox
                      checked={row.isSelected}
                      disabled={disabled}
                      onCheckedChange={() => onToggle(row.id)}
                      aria-label={`Select promotion ${row.code || row.id}`}
                    />
                  </TableCell>
                  <TableCell className="border px-3 py-2 whitespace-nowrap">
                    {row.code}
                  </TableCell>
                  <TableCell className="border px-3 py-2 whitespace-nowrap">
                    {row.name}
                  </TableCell>
                  <TableCell className="border px-3 py-2 whitespace-nowrap">
                    {row.startDate}
                  </TableCell>
                  <TableCell className="border px-3 py-2 whitespace-nowrap">
                    {row.endDate}
                  </TableCell>
                  <TableCell className="border px-3 py-2 whitespace-nowrap">
                    {row.weekDays}
                  </TableCell>
                  <TableCell className="border px-3 py-2 whitespace-nowrap">
                    {row.discountType}
                  </TableCell>
                  <TableCell className="border px-3 py-2 whitespace-nowrap">
                    {row.walkUp}
                  </TableCell>
                  <TableCell className="border px-3 py-2 whitespace-nowrap">
                    {row.web}
                  </TableCell>
                  <TableCell className="border px-3 py-2 whitespace-nowrap">
                    {row.phoneIn}
                  </TableCell>
                  <TableCell className="border px-3 py-2 whitespace-nowrap">
                    {row.managerOnly}
                  </TableCell>
                  <TableCell className="border px-3 py-2 whitespace-nowrap">
                    {row.ccReq}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          )}
        </Table>
        {isEmpty && (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            No record found
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdjustPromoDialog({
  open,
  event,
  onOpenChange,
  onSave,
}: AdjustPromoDialogProps) {
  const { connectionName, locationId, username } = useAppSession()
  const [rows, setRows] = useState<AdjustPromoRow[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [hasLoaded, setHasLoaded] = useState(false)

  const [getShowPromotion, { isLoading: isLoadingPromos }] =
    useGetShowPromotionMutation()
  const [saveShowPromotion, { isLoading: isSaving }] =
    useSaveShowPromotionMutation()

  useEffect(() => {
    if (!open) {
      setRows([])
      setErrorMessage(null)
      setHasLoaded(false)
      return
    }

    if (!event || !connectionName || !locationId) {
      return
    }

    const showId = event.showId || event.id
    if (!showId) return

    let isCurrent = true

    setErrorMessage(null)
    setHasLoaded(false)

    getShowPromotion({
      ConnectionString: connectionName,
      LocationId: locationId,
      CalendarShowId: showId,
      TodayDate: formatDesktopDateTime(new Date()),
    })
      .unwrap()
      .then((items) => {
        if (!isCurrent) return
        setRows(initializePromoSelections(items, event.start))
        setHasLoaded(true)
      })
      .catch((error: unknown) => {
        if (!isCurrent) return
        setRows([])
        setErrorMessage(getClubmanErrorMessage(error))
        setHasLoaded(true)
      })

    return () => {
      isCurrent = false
    }
  }, [open, event, connectionName, locationId, getShowPromotion])

  function handleToggle(promoId: string) {
    setRows((current) => togglePromoSelection(current, promoId))
  }

  async function handleSave() {
    if (!event || !connectionName || !locationId) return

    const showId = event.showId || event.id
    if (!showId) return

    setErrorMessage(null)

    try {
      await saveShowPromotion(
        buildSaveShowPromotionRequest({
          connectionString: connectionName,
          locationId,
          calendarShowId: showId,
          username,
          rows,
        })
      ).unwrap()
      onSave?.()
      onOpenChange(false)
    } catch (error: unknown) {
      setErrorMessage(getClubmanErrorMessage(error))
    }
  }

  const showLoading =
    open && Boolean(event) && (!hasLoaded || (isLoadingPromos && !errorMessage))
  const canInteract = hasLoaded && !isSaving && !isLoadingPromos

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[min(90vh,48rem)] max-h-[calc(100vh-2rem)] w-full flex-col overflow-hidden sm:max-w-6xl">
        <DialogHeader className="shrink-0 border-b px-5 py-4">
          <DialogTitle className="text-lg">Show Promotion</DialogTitle>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {showLoading ? (
            <ShowHistoryTableSkeleton
              columnCount={12}
              minWidthClassName="min-w-[72rem]"
              aria-label="Loading show promotions"
            />
          ) : (
            <div className="flex min-h-0 flex-1 flex-col gap-3 px-5 py-5">
              {errorMessage ? (
                <p className="text-sm text-destructive">{errorMessage}</p>
              ) : null}
              <PromoTable
                rows={rows}
                disabled={!canInteract}
                onToggle={handleToggle}
              />
            </div>
          )}
        </div>

        <DialogFooter className="!flex-row shrink-0 flex-wrap justify-end gap-2 border-t px-5 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => void handleSave()}
            disabled={!hasLoaded || isSaving || showLoading}
          >
            {isSaving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
