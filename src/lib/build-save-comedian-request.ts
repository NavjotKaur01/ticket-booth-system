import { formatDesktopDateTime } from "@/lib/format-us-datetime"
import type { ComedianRequestModel } from "@/types/api/comedian-info"
import type { PerformerFormValues } from "@/types/performer-form"

type BuildSaveComedianRequestParams = {
  connectionName: string
  locationId: string
  lastUpdateId: string
  form: PerformerFormValues
  comicId?: string
}

/**
 * Mirrors ClubMan ComedianVM.SaveComedian → Adminstrator/SaveComedian.
 * Uses ARTS001 when artist type is unset (desktop default).
 */
export function buildSaveComedianRequest({
  connectionName,
  locationId,
  lastUpdateId,
  form,
  comicId = crypto.randomUUID(),
}: BuildSaveComedianRequestParams): ComedianRequestModel & {
  Image: string | null
  ImageFileName: string
} {
  return {
    ConnectionString: connectionName,
    LastUpdateID: lastUpdateId,
    LocationId: locationId,
    LastUpdateDt: formatDesktopDateTime(new Date()),
    ComicId: comicId,
    AltURL: form.facebookPage.trim(),
    ArtistType: "ARTS001",
    FirstName: form.firstName.trim(),
    LastName: form.lastName.trim(),
    StageName: form.stageName.trim(),
    URL: form.website.trim(),
    Address1: "",
    Address2: "",
    CellPhone: "",
    HomePhone: "",
    Fax: "",
    Email: "",
    ZipCode: "",
    PreferredContact: "",
    City: "",
    State: "",
    Country: "",
    GlobalBio: form.bio.trim(),
    GlobalNote: "",
    Image: null,
    ImageFileName: "",
  }
}
