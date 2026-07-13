export type Performer = {
  id: string
  firstName: string
  lastName: string
  stageName: string
  comicName: string
  locationId: string
  active: boolean
  hidden: boolean
  globalBio: string
  localBio: string
  isGlobalPic: boolean
  isLocalPic: boolean
}

export type PerformerFilters = {
  firstName: string
  lastName: string
  stageName: string
  showInactive: boolean
}

export const DEFAULT_PERFORMER_FILTERS: PerformerFilters = {
  firstName: "",
  lastName: "",
  stageName: "",
  showInactive: false,
}
