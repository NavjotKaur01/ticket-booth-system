import { useEffect, useRef, useState } from "react"

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
  onAfterClose?: () => void
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
  hubByShowId: Record<string, boolean>
  onToggleHub: (showId: string, isHub: boolean) => void
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
          {shows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="h-32 border px-3 py-10 text-center text-sm text-muted-foreground"
              >
                No record
              </TableCell>
            </TableRow>
          ) : (
            shows.map((show) => (
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
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default function AdjustHubDialog({
  open,
  event,
  onOpenChange,
  onAfterClose,
  onSave,
}: AdjustHubDialogProps) {
  const [dialogData, setDialogData] = useState<AdjustHubDialogData | null>(null)
  const [formValues, setFormValues] = useState<AdjustHubFormValues | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const sessionGenerationRef = useRef(0)

  function resetDialogSession() {
    setDialogData(null)
    setFormValues(null)
    setIsLoading(false)
    setIsSaving(false)
    onAfterClose?.()
  }

  useEffect(() => {
    if (open) {
      sessionGenerationRef.current += 1
    }
  }, [open])

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      sessionGenerationRef.current += 1
    }
    onOpenChange(nextOpen)
  }

  useEffect(() => {
    if (!open || !event) {
      return
    }

    let isCurrent = true
    const generation = sessionGenerationRef.current

    setIsLoading(true)
    getAdjustHubDialogData(event)
      .then((data) => {
        if (isCurrent && generation === sessionGenerationRef.current) {
          setDialogData(data)
          setFormValues(createAdjustHubFormValues(data))
        }
      })
      .finally(() => {
        if (isCurrent && generation === sessionGenerationRef.current) {
          setIsLoading(false)
        }
      })

    return () => {
      isCurrent = false
    }
  }, [event, open])

  function handleToggleHub(showId: string, isHub: boolean) {
    setFormValues((current) => (current ? applyHubToggle(current, showId, isHub) : current))
  }

  async function handleSave() {
    if (!formValues || !dialogData) {
      return
    }

    setIsSaving(true)
    const generation = sessionGenerationRef.current

    try {
      await saveAdjustHubFormValues(dialogData.eventId, formValues)
      if (generation !== sessionGenerationRef.current) return
      onSave?.(formValues)
      handleOpenChange(false)
    } finally {
      if (generation === sessionGenerationRef.current) {
        setIsSaving(false)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        disableOutsideDismiss
        className="flex max-h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden sm:max-w-3xl"
        onAfterClose={resetDialogSession}
      >
        <DialogHeader className="shrink-0 border-b px-5 py-4">
          <DialogTitle className="text-lg">Adjust Hub</DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
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

        <DialogFooter className="!flex-row flex-wrap justify-start border-t px-5 py-4">
          <Button
            type="button"
            onClick={handleSave}
            disabled={!formValues || isLoading || isSaving}
          >
            Save
          </Button>
          <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


