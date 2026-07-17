import type { SaveCustomerRequest } from "@/types/api/save-customer"

export type CustomerRequest = Partial<SaveCustomerRequest> & {
  ConnectionName: string
  CustomerId?: string
  CustEmail?: string
  TodayDate?: string
  BirthYear?: number | null
  MarAnnivYear?: number | null
  MarAnnivMonth?: string | null
  BirthMonth?: string | null
  Country1?: string | null
}
export type ApiCustomerDetail = {
  CustomerID: string
  LocationID?: string | null
  FirstName: string | null
  LastName: string | null
  Addr1: string | null
  Addr2: string | null
  City: string | null
  State: string | null
  Zip: string | null
  ZipExt: string | null
  Country: string | null
  Phone: string | null
  AreaCode: string | null
  Phone1: string | null
  Phone2: string | null
  AltAreaCode: string | null
  AltPhone1: string | null
  AltPhone2: string | null
  AltAreaCode_2: string | null
  AltPhone1_2: string | null
  AltPhone2_2: string | null
  Email1: string | null
  BirthMonth: number | string | null
  BirthYear: number | null
  MarAnnivMonth: string | null
  MarAnnivYear: number | null
  Married: string | null
  Divorced: string | null
  Active: string | null
  Banned: string | null
  NoCall: string | null
  Inactive: string | null
  OptOut: boolean | null
  CustomerNote: string | null
  LastUpdateID: string | null
  LastUpdateDt: string | null
  // Passwd omitted (BE-0.2) — not part of web customer detail contract
  CustomerShowBookedCount?: number | null
  CustomerOldShowBookedCount?: number | null
}
