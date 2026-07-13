export interface FreeFormItem {
  FreeFormID: string
  LocationID: string
  ButtonText: string
  DisplayOrder: number
  FreeFormText: string
  IsActive: boolean
  LastUpdatedUserName: string
  LastUpdatedDate: string
}

export interface AddUpdateFreeFormRequest {
  ConnectionString: string
  LocationID: string
  FreeFormID: string
  ButtonText: string
  DisplayOrder: number
  FreeFormText: string
  IsActive: boolean
  LastUpdatedUserName: string
}

export interface DeleteFreeFormRequest {
  ConnectionString: string
  FreeFormID: string
}
