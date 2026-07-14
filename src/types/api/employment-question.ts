export interface EmploymentQuestion {
  EQID: string
  LocationId: string
  EQText: string
  ActiveIndicator: string
  LastUpdatedId: string
  LastUpdatedDate: string
}

export interface AddUpdateEmploymentQuestionRequest {
  ConnectionString: string
  EQID: string
  LocationId: string
  EQText: string
  ActiveIndicator: string
  LastUpdatedId: string
}

export interface AddUpdateEmploymentQuestionResponse {
  Status: boolean
  Message: string
  Data: null
}

export interface DeleteEmploymentQuestionRequest {
  ConnectionString: string
  EQID: string
}
