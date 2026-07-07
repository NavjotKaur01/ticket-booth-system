import { useMemo } from "react"

import type { ComicInfo } from "@/data/comedian-info"
import type { CalendarEvent } from "@/data/calendarEvents"
import { ComicInfoDialog } from "@/features/reservations/comic-info-dialog"
import { useGetComedianInfoQuery, useUpdateComedianMutation, useUpdateComedianImageMutation, useDeleteComedianImageMutation } from "@/store/api/clubmanApi"

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
  const {
    data: comedianInfo,
    isLoading,
    isFetching,
    refetch,
  } = useGetComedianInfoQuery(
    { connectionName, comicId: event?.comicId ?? "" },
    { skip: !open || !event?.comicId || !connectionName }
  )
  const [updateComedian] = useUpdateComedianMutation()
  const [updateComedianImage] = useUpdateComedianImageMutation()
  const [deleteComedianImage] = useDeleteComedianImageMutation()

  const mappedInfo: ComicInfo | null = useMemo(() => {
    if (!comedianInfo || !event) return null

    return {
      lastName: comedianInfo.LastName ?? "",
      firstName: comedianInfo.FirstName ?? "",
      stageName: comedianInfo.StageName ?? event.performer,
      about: comedianInfo.GlobalBio ?? comedianInfo.LocalBio ?? "",
      notes: comedianInfo.GlobalNote ?? comedianInfo.LocalNote ?? "",
      email: comedianInfo.Email ?? "",
      address: comedianInfo.Address1 ?? "",
      address2: comedianInfo.Address2 ?? "",
      city: comedianInfo.City ?? "",
      state: comedianInfo.State ?? "",
      zipCode: comedianInfo.ZipCode ?? "",
      country: comedianInfo.Country ?? "",
      homePhone: comedianInfo.HomePhone ?? "",
      mobilePhone: comedianInfo.CellPhone ?? "",
      fax: comedianInfo.Fax ?? "",
      url: comedianInfo.URL ?? "",
      altUrl: comedianInfo.AltURL ?? "",
      artistType: comedianInfo.ArtistType?.trim() ?? "",
      preferredContact: comedianInfo.PreferredContact ?? "email",
      imageUrl: (() => {
        const imgData = comedianInfo.LocalPicture ?? comedianInfo.GlobalPicture ?? comedianInfo.LocalPic ?? comedianInfo.GlobalPic ?? comedianInfo.Pic
        if (!imgData) return ""
        return imgData.startsWith("data:image") ? imgData : `data:image/jpeg;base64,${imgData}`
      })(),
    }
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
      isLoading={isLoading || isFetching || (!!event.comicId && !mappedInfo)}
      onSave={
        mappedInfo
          ? async (values: ComicInfo) => {
            await updateComedian({
              connectionName,
              locationId,
              username,
              comicId: event.comicId ?? "",
              form: values,
            }).unwrap()
            refetch()
          }
          : undefined
      }
      onChangeImage={
        event.comicId
          ? async (base64Image: string) => {
            await updateComedianImage({
              connectionName,
              locationId,
              username,
              comicId: event.comicId ?? "",
              base64Image,
            }).unwrap()
            // Refetch comedian info if needed
            refetch()
          }
          : undefined
      }
      onDeleteImage={
        event.comicId
          ? async () => {
            await deleteComedianImage({
              connectionName,
              comicId: event.comicId ?? "",
            }).unwrap()
            // Refetch comedian info to clear the image
            refetch()
          }
          : undefined
      }
    />
  )
}

