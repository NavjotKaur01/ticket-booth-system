/** Matches ClubMan `BusinessCustomerRequestModel`. */
export type BusinessCustomerRequest = {
  ConnectioString: string
  LocationId: string
  BusinessId?: string
  BusinessName?: string
  BusLastName?: string
  BusFirstName?: string
  AreaCode?: string
  Phone1?: string
  Phone2?: string
  AltAreaCode?: string
  AltPhone1?: string
  AltPhone2?: string
  FaxAreaCode?: string
  FaxPhone1?: string
  FaxPhone2?: string
  Fax?: string
  Email1?: string
  Addr1?: string
  Addr2?: string
  City1?: string
  State1?: string | null
  Country1?: string | null
  Zip?: string
  HTTP?: string
  BusinessNotes?: string
  LastUpdateID?: string
  LastUpdateDt?: string
  TodayDate?: string
}

export type ApiBusinessContactItem = {
  BusinessID: string
  LocationID?: string | null
  BusinessName: string | null
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
  Phone_Ext: string | null
  AltPhone: string | null
  AltPhone_Ext: string | null
  Fax: string | null
  CountryCode: string | null
  AreaCode: string | null
  Phone1: string | null
  Phone2: string | null
  AltAreaCode: string | null
  AltPhone1: string | null
  AltPhone2: string | null
  FaxAreaCode: string | null
  FaxPhone1: string | null
  FaxPhone2: string | null
  Email1: string | null
  Email2: string | null
  HTTP: string | null
  MailingList: string | null
  Encrypted: string | null
  LastUpdateID: string | null
  LastUpdateDt: string | null
  CustomerNote: string | null
}
