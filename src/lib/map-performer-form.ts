import type { Performer } from "@/types/performer"
import {
  EMPTY_UPDATE_PERFORMER_FORM,
  type UpdatePerformerFormValues,
} from "@/types/performer-form"

export function mapPerformerToUpdateForm(
  performer: Performer
): UpdatePerformerFormValues {
  return {
    ...EMPTY_UPDATE_PERFORMER_FORM,
    firstName: performer.firstName,
    lastName: performer.lastName,
    stageName: performer.stageName,
    bio: performer.stageName
      ? `${performer.stageName} performer profile.`
      : "",
    globalBio: performer.stageName
      ? `${performer.stageName} is a featured performer.`
      : "",
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
  }
}
