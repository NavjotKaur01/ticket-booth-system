export interface MenuItem {
  MenuId: string
  MenuName: string
  MenuOrder: number
  Active: string
  LocationId: string
  LastUpdatedId: string
  LastUpdateDate: string
}

export interface AddUpdateMenuRequest {
  ConnectionString: string
  MenuId: string
  MenuName: string
  MenuOrder: number
  Active: string
  LocationId: string
  LastUpdatedId: string
}

export interface DeleteMenuRequest {
  ConnectionString: string
  MenuId: string
}

export interface MenuItemDetail {
  MenuItemId: string
  MenuHeader: string
  MenuDescripiton: string
  MenuPrice: number
  Active: string
  MenuId: string
  LastUpdatedId: string
  LastUpdatedDate: string
}

export interface AddUpdateMenuItemRequest {
  ConnectionString: string
  MenuItemId: string
  MenuHeader: string
  MenuDescripiton: string
  MenuPrice: number
  Active: string
  MenuId: string
  LastUpdatedId: string
}

export interface DeleteMenuItemRequest {
  ConnectionString: string
  MenuItemId: string
}

export interface MenuPdfItem {
  FileGuid: string
  LocationID: string
  FileDescription: string
  CreatedBy: string
  CreatedDate: string
  UpdatedBy: string | null
  UpdatedDate: string | null
}

export interface AddUpdateMenuPdfRequest {
  FileGuid: string
  LocationID: string
  FileDescription: string
  UserName: string
  PdfContent: string
}

export interface GetMenuPdfData {
  FileGuid: string
  FileDescription: string
  PdfContent: string
}

export interface GetMenuImageData {
  FileGuid: string
  ImageTitle?: string
  ImageContent: string
  OrderNumber?: number
}

export interface UploadMenuPdfRequest {
  FileGuid: string
  PdfContent: string
  Username: string
}

export interface UploadMenuImageRequest {
  FileGuid: string
  ImageTitle: string
  "Tab Value": number
  ImageContent: string
  UserName: string
}
