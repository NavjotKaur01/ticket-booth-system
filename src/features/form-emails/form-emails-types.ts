export interface ApiFormEmailReference {
  EmailReferenceId: string
  LocationId: string
  ItemId: string
  EmailAddress: string
  LastUpdatedId?: string
  LastUpdatedDt?: string
}

export interface AddUpdateFormEmailRequest {
  EmailReferenceId: string
  LocationId: string
  ItemId: string
  EmailAddress: string
  ConnectionString: string
  Username: string
}

export interface DeleteFormEmailRequest {
  EmailReferenceId: string
  ConnectionString: string
}