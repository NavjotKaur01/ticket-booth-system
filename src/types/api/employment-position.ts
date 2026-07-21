export interface EmploymentPosition {
  PositionID: string
  LocationId: string
  PositionText: string
  ActiveIndicator: string
  LastUpdatedId: string
  LastUpdatedDate: string}


export interface AddUpdateEmploymentPositionRequest {
  ConnectionString: string
  PositionID: string
  LocationId: string
  PositionText: string
  ActiveIndicator: string
  LastUpdatedId: string
}

export interface AddUpdateEmploymentPositionResponse {
  Status: boolean
  Message: string
  Data: null
}
