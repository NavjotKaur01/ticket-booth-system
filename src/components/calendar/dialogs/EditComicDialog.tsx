import { useEffect, useState } from "react"

import type { ComicInfo } from "@/data/comedian-info"
import type { CalendarEvent } from "@/data/calendarEvents"
import { ComicInfoDialog } from "@/features/reservations/comic-info-dialog"

import {
  getEditComicDialogData,
  saveEditComicInfo,
  type EditComicDialogData,
} from "../service/editComic.service"

type EditComicDialogProps = {
  open: boolean
  event: CalendarEvent | null
  onOpenChange: (open: boolean) => void
}

export default function EditComicDialog({
  open,
  event,
  onOpenChange,
}: EditComicDialogProps) {
  const [dialogData, setDialogData] = useState<EditComicDialogData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!open) {
      setDialogData(null)
      return
    }

    if (!event) {
      return
    }

    let isCurrent = true

    setIsLoading(true)
    getEditComicDialogData(event)
      .then((data) => {
        if (isCurrent) {
          setDialogData(data)
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

  if (!open || !event) {
    return null
  }

  return (
    <ComicInfoDialog
      open={open}
      onOpenChange={onOpenChange}
      stageName={dialogData?.stageName ?? event.performer}
      nested
      isLoading={isLoading || !dialogData}
      onSave={
        dialogData
          ? (values: ComicInfo) => saveEditComicInfo(dialogData.eventId, values)
          : undefined
      }
    />
  )
}

