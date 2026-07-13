export interface SocialItem {
  SocialId: string
  LocationId: string
  DisplayName: string
  NavigateUrl: string
  OrderNumber: number
}

export interface AddUpdateSocialRequest {
  ConnectionString: string
  LocationId: string
  SocialId: string
  DisplayName: string
  NavigateUrl: string
  OrderNumber: number
}

export interface DeleteSocialRequest {
  ConnectionString: string
  SocialId: string
}
