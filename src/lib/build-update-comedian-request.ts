import type { ComedianRequestModel } from "@/types/api/comedian-info"
import type { ComicInfo } from "@/data/comedian-info"
import { formatDateWithTimeUS } from "@/lib/date-display-format"

type BuildUpdateComedianRequestParams = {
  connectionName: string
  locationId: string
  username: string
  comicId: string
  form: ComicInfo
}

export function buildUpdateComedianRequest({
  connectionName,
  locationId,
  username,
  comicId,
  form,
}: BuildUpdateComedianRequestParams): ComedianRequestModel {
  return {
    ConnectionString: connectionName,
    LastUpdateID: username,
    LocationId: locationId,
    LastUpdateDt: formatDateWithTimeUS(new Date()),
    ComicId: comicId,
    AltURL: form.altUrl ?? "",
    ArtistType: form.artistType ?? "",
    FirstName: form.firstName ?? "",
    LastName: form.lastName ?? "",
    StageName: form.stageName ?? "",
    URL: form.url ?? "",
    Address1: form.address ?? "",
    Address2: form.address2 ?? "",
    CellPhone: form.mobilePhone ?? "",
    HomePhone: form.homePhone ?? "",
    Fax: form.fax ?? "",
    Email: form.email ?? "",
    ZipCode: form.zipCode ?? "",
    PreferredContact: form.preferredContact ?? "",
    City: form.city ?? "",
    State: form.state ?? "",
    Country: form.country ?? "",
    GlobalBio: form.about ?? "",
    GlobalNote: form.notes ?? "",
  }
}
