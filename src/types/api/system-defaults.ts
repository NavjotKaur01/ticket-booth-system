/** ClubMan SystemDefaultsVM / SystemDefaultRequestModel */

export type ApiSystemDefaultItem = {
  DefaultID?: string
  LocationID?: string | null
  Screen?: string | null
  Field?: string | null
  SDesc?: string | null
  DefValue?: string | null
  Type?: string | null
  LookupType?: string | null
  LastUpdateID?: string | null
  LastUpdateDt?: string | null
}

/** ClubMan AdminstratorApi.UpdateSystemDefault body. */
export type SystemDefaultRequestModel = {
  Connection: string
  LocationId: string
  DefaultID: string
  DefaultValue: string
  /** API typo — matches desktop SystemDefaultRequestModel.Decription */
  Decription?: string
  LastUpdateID: string
  LastUpdateDt: string
}
