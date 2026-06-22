export type ApiLocation = {
  LocationID: string
  LocName: string | null
  LocSName: string | null
  DBName: string | null
  LocContact: string | null
  LocAddr1: string | null
  LocAddr2: string | null
  LocCity: string | null
  LocState: string | null
  LocZip: string | null
  LocZipExt: string | null
  LocCountry: string | null
  LocPhone: string | null
  LocPhoneExt: string | null
  LocPhoneText: string | null
  LocEmail: string | null
  Gateway: string | null
  LicenseID: string | null
  SiteID: string | null
  DeviceID: string | null
  SoftwareID: string | null
  IsDeleted: boolean | null
}

export type AppLocation = {
  id: string
  label: string
  name: string
  shortName: string
  dbName: string
  city: string
}
