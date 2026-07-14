export interface SectionDetailItem {
  LookupCode: string
  SectionName: string
  SectionDetail: string
  LookupOrder: number
  LastUpdateID: string
  LastUpdateDt: string
}

export interface GetSectionDetailsRequest {
  ConnectionString: string
  PageNumber?: number
  PageSize?: number
  SortColumn?: string
  SortDirection?: "ASC" | "DESC"
}

export interface AddUpdateSectionDetailRequest {
  ConnectionString: string
  LookupCode: string
  SectionName: string
  SectionDetail: string
  LookupOrder: number
  LastUpdateID: string
}
