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

export type UpdatePerformerFormValues = PerformerFormValues & {
  useGlobalPicture: boolean
  useGlobalBio: boolean
  globalBio: string
  localImageFileName: string
  globalImageFileName: string
  comicSliderPicFileName: string
  comicBannerPicFileName: string
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

export const EMPTY_UPDATE_PERFORMER_FORM: UpdatePerformerFormValues = {
  ...EMPTY_PERFORMER_FORM,
  useGlobalPicture: true,
  useGlobalBio: true,
  globalBio: "",
  localImageFileName: "",
  globalImageFileName: "",
  comicSliderPicFileName: "",
  comicBannerPicFileName: "",
}
