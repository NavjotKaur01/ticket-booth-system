import type { ComicInfo } from "@/data/comedian-info"
import type { ApiComedianInfo } from "@/types/api/comedian-info"
import type { Performer } from "@/types/performer"
import {
  EMPTY_UPDATE_PERFORMER_FORM,
  type UpdatePerformerFormValues,
} from "@/types/performer-form"

function text(value: string | null | undefined) {
  return (value ?? "").trim()
}

export function mapPerformerToUpdateForm(
  performer: Performer
): UpdatePerformerFormValues {
  return {
    ...EMPTY_UPDATE_PERFORMER_FORM,
    firstName: performer.firstName,
    lastName: performer.lastName,
    stageName: performer.stageName,
    bio: performer.localBio || performer.globalBio,
    globalBio: performer.globalBio,
    website: "",
    facebookPage: "",
  }
}

export function mapComedianInfoToUpdateForm(
  info: ApiComedianInfo
): UpdatePerformerFormValues {
  return {
    ...EMPTY_UPDATE_PERFORMER_FORM,
    firstName: text(info.FirstName),
    lastName: text(info.LastName),
    stageName: text(info.StageName),
    bio: text(info.LocalBio) || text(info.GlobalBio),
    globalBio: text(info.GlobalBio),
    website: text(info.URL),
    facebookPage: text(info.AltURL),
    useGlobalPicture: Boolean(text(info.GlobalPicture) || text(info.GlobalPic)),
    useGlobalBio: Boolean(text(info.GlobalBio)),
  }
}

/** Maps update form into ComicInfo for Calendar/UpdateComedain. */
export function mapUpdateFormToComicInfo(
  form: UpdatePerformerFormValues,
  details?: ApiComedianInfo | null
): ComicInfo {
  return {
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    stageName: form.stageName.trim(),
    about: (form.useGlobalBio ? form.globalBio : form.bio).trim(),
    notes: text(details?.GlobalNote),
    email: text(details?.Email),
    address: text(details?.Address1),
    address2: text(details?.Address2),
    city: text(details?.City),
    state: text(details?.State),
    zipCode: text(details?.ZipCode),
    country: text(details?.Country),
    homePhone: text(details?.HomePhone),
    mobilePhone: text(details?.CellPhone),
    fax: text(details?.Fax),
    url: form.website.trim(),
    altUrl: form.facebookPage.trim(),
    artistType: text(details?.ArtistType) || "ARTS001",
    preferredContact: text(details?.PreferredContact),
  }
}

export function mapUpdateFormToPerformer(
  performer: Performer,
  form: UpdatePerformerFormValues
): Performer {
  return {
    ...performer,
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    stageName: form.stageName.trim(),
    comicName:
      form.stageName.trim() ||
      [form.lastName.trim(), form.firstName.trim()].filter(Boolean).join(", "),
    globalBio: form.globalBio.trim(),
    localBio: form.bio.trim(),
  }
}
