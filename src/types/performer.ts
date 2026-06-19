export type Performer = {
  id: string
  firstName: string
  lastName: string
  stageName: string
  locationId: string
  active: boolean
  hidden: boolean
}

export type PerformerFilters = {
  firstName: string
  lastName: string
  stageName: string
  locationId: string
  showInactive: boolean
}
