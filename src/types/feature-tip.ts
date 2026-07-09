export type FeatureTip = {
  id: string
  header: string
  navigateUrl: string
  description: string
  imageUrl: string
  imageName: string
}

export type FeatureTipFormValues = {
  header: string
  navigateUrl: string
  description: string
  imageUrl: string
  imageName: string
}

export const EMPTY_FEATURE_TIP_FORM: FeatureTipFormValues = {
  header: "",
  navigateUrl: "",
  description: "",
  imageUrl: "",
  imageName: "",
}
