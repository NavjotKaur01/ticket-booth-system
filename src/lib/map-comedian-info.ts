import type { ComicInfo } from "@/data/comedian-info"
import type { ApiComedianInfo } from "@/types/api/comedian-info"

function toImageDataUrl(value: string | null | undefined) {
  if (!value?.trim()) {
    return ""
  }

  return value.startsWith("data:image")
    ? value
    : `data:image/jpeg;base64,${value}`
}

/** Map GetComedianInfo response to the Comic Info form model. */
export function mapApiComedianToComicInfo(
  comedianInfo: ApiComedianInfo,
  fallbackStageName = ""
): ComicInfo {
  return {
    lastName: comedianInfo.LastName ?? "",
    firstName: comedianInfo.FirstName ?? "",
    stageName: comedianInfo.StageName ?? fallbackStageName,
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
    imageUrl: toImageDataUrl(
      comedianInfo.LocalPicture ??
        comedianInfo.GlobalPicture ??
        comedianInfo.LocalPic ??
        comedianInfo.GlobalPic ??
        comedianInfo.Pic
    ),
  }
}

export function isUsableComicId(comicId: string | null | undefined) {
  if (!comicId?.trim()) {
    return false
  }

  const normalized = comicId.trim().toLowerCase()
  return (
    normalized !== "00000000-0000-0000-0000-000000000000" &&
    normalized !== "null" &&
    normalized !== "undefined"
  )
}
