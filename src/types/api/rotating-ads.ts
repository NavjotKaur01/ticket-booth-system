export interface RotatingAdItem {
  RotatingAdID: string
  DisplayOrder: number
  AlternateText: string
  NavigateURL: string
  DisplayText: string
  ActiveIndicator: string
  StartingDate: string
  EndingDate: string
  ImageURL: string | null
}

export interface AddUpdateRotatingAdRequest {
  ConnectionString: string
  RotatingAdId: string
  LocationID: string
  DisplayOrder: number
  AlternateText: string
  NavigateURL: string
  DisplayText: string
  ActiveIndicator: string
  StartingDate: string
  EndingDate: string
  ImageURL: string
}
