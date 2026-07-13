import type { ApiComedianSearchItem } from "@/types/api/save-show"
import type { Performer } from "@/types/performer"

function text(value: string | null | undefined) {
  return (value ?? "").trim()
}

function isYes(value: string | null | undefined) {
  return text(value).toUpperCase() === "Y"
}

/**
 * Maps Calendar/ComedianSearch items the same way EventCalendarVM maps
 * ComicName → CominName for the Administrator ComedianList grid.
 */
export function mapComedianSearchResults(
  items: ApiComedianSearchItem[],
  locationId: string
): Performer[] {
  return items.map((item) => {
    const firstName = text(item.FirstName)
    const lastName = text(item.LastName)
    const stageName = text(item.StageName)
    const comicName =
      text(item.ComicName) ||
      stageName ||
      [lastName, firstName].filter(Boolean).join(", ")

    return {
      id: text(item.ComicID),
      firstName,
      lastName,
      stageName,
      comicName,
      locationId,
      active: text(item.Active).toUpperCase() !== "N",
      hidden: false,
      globalBio: text(item.GlobalBio),
      localBio: text(item.LocalBio),
      isGlobalPic: isYes(item.IsGlobalPic),
      isLocalPic: isYes(item.IsLocalPic),
    }
  })
}
