import { useMemo } from "react"

import type { ComicInfo } from "@/data/comedian-info"
import type { CalendarEvent } from "@/data/calendarEvents"
import { ComicInfoDialog } from "@/features/reservations/comic-info-dialog"
import {
  isUsableComicId,
  mapApiComedianToComicInfo,
} from "@/lib/map-comedian-info"
import {
  useGetComedianInfoQuery,
  useUpdateComedianMutation,
  useUpdateComedianImageMutation,
  useDeleteComedianImageMutation,
} from "@/store/api/clubmanApi"

type EditComicDialogProps = {
  open: boolean
  event: CalendarEvent | null
  onOpenChange: (open: boolean) => void
  connectionName?: string
  locationId?: string
  username?: string
}

export default function EditComicDialog({
  open,
  event,
  onOpenChange,
  connectionName = "",
  locationId = "",
  username = "",
}: EditComicDialogProps) {
  const comicId = event?.comicId ?? ""
  const canLoadComic = isUsableComicId(comicId)

  const {
    data: comedianInfo,
    isLoading,
    isFetching,
    refetch,
  } = useGetComedianInfoQuery(
    { connectionName, comicId },
    { skip: !open || !canLoadComic || !connectionName }
  )
  const [updateComedian] = useUpdateComedianMutation()
  const [updateComedianImage] = useUpdateComedianImageMutation()
  const [deleteComedianImage] = useDeleteComedianImageMutation()

  const mappedInfo: ComicInfo | null = useMemo(() => {
    if (!comedianInfo || !event) {
      return null
    }

    return mapApiComedianToComicInfo(comedianInfo, event.performer)
  }, [comedianInfo, event])

  if (!open || !event) {
    return null
  }

  return (
    <ComicInfoDialog
      open={open}
      onOpenChange={onOpenChange}
      comic={mappedInfo}
      stageName={mappedInfo?.stageName ?? event.performer}
      nested
      layout="flat"
      title="Edit Comedian"
      isLoading={isLoading || isFetching || (canLoadComic && !mappedInfo)}
      onSave={
        mappedInfo && canLoadComic
          ? async (values: ComicInfo) => {
              await updateComedian({
                connectionName,
                locationId,
                username,
                comicId,
                form: values,
              }).unwrap()
              refetch()
            }
          : undefined
      }
      onChangeImage={
        canLoadComic
          ? async (base64Image: string) => {
              await updateComedianImage({
                connectionName,
                locationId,
                username,
                comicId,
                base64Image,
              }).unwrap()
              refetch()
            }
          : undefined
      }
      onDeleteImage={
        canLoadComic
          ? async () => {
              await deleteComedianImage({
                connectionName,
                comicId,
              }).unwrap()
              refetch()
            }
          : undefined
      }
    />
  )
}
