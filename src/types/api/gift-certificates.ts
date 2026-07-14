import type { ApiLocation } from "./locations"

export type GetGiftCertificatesRequest = {
  ConnectionString: string
  PageNumber: number
  PageSize: number
}

export type ExportGiftCertificatesRequest = {
  Format: "CSV" | "XLS" | "XLSX"
  GiftStatus: string
  LocationID: string
  FromDate: string
  ToDate: string
  ConnectionString: string
}

export type UpdateGiftCertificateRequest = {
  CertID: string
  RecFirstName: string
  RecLastName: string
  RecEmail: string
  LastUpdateID: string
  ConnectionString: string
}

export type ResendGiftCertificateRequest = {
  CertID: string
  LocationID: string
  EmailTo: string
  ConnectionString: string
}

export type LocationGiftStatusResponse = {
  LocationID: string
  LocName: string
  IsGiftAllowed: boolean
  [key: string]: any
}

export type GiftLocation = ApiLocation
