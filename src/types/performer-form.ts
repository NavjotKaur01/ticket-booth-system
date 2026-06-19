export type PerformerFormValues = {
  firstName: string
  lastName: string
  stageName: string
  bio: string
  website: string
  facebookPage: string
  twitterName: string
  embeddedVideoCode: string
}

export const EMPTY_PERFORMER_FORM: PerformerFormValues = {
  firstName: "",
  lastName: "",
  stageName: "",
  bio: "",
  website: "",
  facebookPage: "",
  twitterName: "",
  embeddedVideoCode: "",
}
