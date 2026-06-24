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
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { CalendarEvent } from "@/data/calendarEvents"

import {
  applyHubToggle,
  createAdjustHubFormValues,
  getAdjustHubDialogData,
  saveAdjustHubFormValues,
  type AdjustHubDialogData,
  type AdjustHubFormValues,
  type AdjustHubShowRow,
} from "../service/adjustHub.service"

type AdjustHubDialogProps = {
  open: boolean
  event: CalendarEvent | null
  onOpenChange: (open: boolean) => void
  onSave?: (values: AdjustHubFormValues) => void
}

function AdjustHubSkeleton() {
  return (
    <div className="space-y-4 px-5 py-5" aria-label="Loading adjust hub form">
      <Skeleton className="h-4 w-56" />
      <div className="overflow-hidden border">
        <div className="grid grid-cols-4 gap-2 border-b bg-muted/50 p-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-5 w-full" />
          ))}
        </div>
        {Array.from({ length: 2 }).map((_, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-4 gap-2 border-b p-2 last:border-b-0">
            {Array.from({ length: 4 }).map((__, cellIndex) => (
              <Skeleton key={cellIndex} className="h-5 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function AdjustHubTable({
  shows,
  hubByShowId,
  onToggleHub,
}: {
  shows: AdjustHubShowRow[]
  hubByShowId: Record<number, boolean>
  onToggleHub: (showId: number, isHub: boolean) => void
}) {
  return (
    <div className="overflow-auto border">
      <Table className="min-w-[36rem] border-collapse">
        <TableHeader className="bg-muted text-muted-foreground">
          <TableRow>
            <TableHead className="w-16 border px-3 py-2 font-semibold">Hub</TableHead>
            <TableHead className="border px-3 py-2 font-semibold">Show Date</TableHead>
            <TableHead className="border px-3 py-2 font-semibold">Show Time</TableHead>
            <TableHead className="border px-3 py-2 font-semibold">Comic</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shows.map((show) => (
            <TableRow key={show.id} className="odd:bg-background even:bg-muted/20">
              <TableCell className="border px-3 py-2">
                <Checkbox
                  checked={hubByShowId[show.id] ?? false}
                  onCheckedChange={(checked) => onToggleHub(show.id, checked === true)}
                  aria-label={`Toggle hub for ${show.comic} at ${show.showTime}`}
                />
              </TableCell>
              <TableCell className="border px-3 py-2">{show.showDate}</TableCell>
              <TableCell className="border px-3 py-2">{show.showTime}</TableCell>
              <TableCell className="border px-3 py-2">{show.comic}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default function AdjustHubDialog({
  open,
  event,
  onOpenChange,
  onSave,
}: AdjustHubDialogProps) {
  const [dialogData, setDialogData] = useState<AdjustHubDialogData | null>(null)
  const [formValues, setFormValues] = useState<AdjustHubFormValues | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!open || !event) {
      return
    }

    let isCurrent = true

    setIsLoading(true)
    getAdjustHubDialogData(event)
      .then((data) => {
        if (isCurrent) {
          setDialogData(data)
          setFormValues(createAdjustHubFormValues(data))
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false)
        }
      })

    return () => {
      isCurrent = false
    }
  }, [event, open])

  function handleToggleHub(showId: number, isHub: boolean) {
    setFormValues((current) => (current ? applyHubToggle(current, showId, isHub) : current))
  }

  async function handleSave() {
    if (!formValues || !dialogData) {
      return
    }

    setIsSaving(true)

    try {
      await saveAdjustHubFormValues(dialogData.eventId, formValues)
      onSave?.(formValues)
      onOpenChange(false)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent disableOutsideDismiss className="max-h-[calc(100vh-2rem)] overflow-hidden sm:max-w-3xl">
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle className="text-lg">Adjust Hub</DialogTitle>
        </DialogHeader>

        <div className="max-h-[calc(100vh-10rem)] overflow-y-auto">
          {isLoading || !formValues || !dialogData ? (
            <AdjustHubSkeleton />
          ) : (
            <div className="space-y-4 px-5 py-5">
              <p className="text-sm font-medium">{dialogData.dateLabel}</p>
              <AdjustHubTable
                shows={dialogData.shows}
                hubByShowId={formValues.hubByShowId}
                onToggleHub={handleToggleHub}
              />
            </div>
          )}
        </div>

        <DialogFooter className="border-t px-5 py-4 sm:justify-start">
          <Button
            type="button"
            onClick={handleSave}
            disabled={!formValues || isLoading || isSaving}
          >
            Save
          </Button>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
