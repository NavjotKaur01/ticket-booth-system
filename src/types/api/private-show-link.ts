/** ClubMan ShowTimesVM private pre-sale link APIs. */

export type ApiPrivateShowLink = {
  PrivateKeyID: string
  PromoCode?: string | null
  StartDt?: string | null
  EndDt?: string | null
  Createdby?: string | null
  CreatedBy?: string | null
  CreateDt?: string | null
  PrivateLink?: string | null
}

export type PrivateShowLinkRequestModel = {
  ConnectionString: string
  LocationId: string
  PrivateKeyID?: string
  CalendarShowId?: string
  ComicId?: string
  PromoCode?: string
  StartDate?: string
  EndDate?: string
  LastUpdateDt?: string
  LastUpdateID?: string
}
