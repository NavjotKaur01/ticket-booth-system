export type CustomerSearchRequest = {
  ConnectionName: string
  LocationId: string
  CustLastName: string
  CustFirstName: string
  AreaCode: string
  Phone1: string
  Phone2: string
  Email1: string
  PageNumber: number
}

export type ApiCustomerSearchItem = {
  CustomerID: string
  LocationID: string
  FirstName: string
  LastName: string
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
  CountryCode: string | null
  AreaCode: string | null
  Phone1: string | null
  Phone2: string | null
  AltAreaCode: string | null
  AltPhone1: string | null
  AltPhone2: string | null
  Email1: string | null
  Email2: string | null
  BirthMonth: number | null
  BirthYear: number | null
  Birthday: string | null
  MailingList: string | null
  LastUpdateID: string | null
  LastUpdateDt: string | null
  Encrypted: string | null
  UserName: string | null
  Passwd: string | null
  SecurityQuestion: string | null
  SecurityAnswer: string | null
  DateCreated: string | null
  AltAreaCode_2: string | null
  AltPhone1_2: string | null
  AltPhone2_2: string | null
  Banned: string | null
  NoCall: string | null
  Inactive: string | null
  AltPhone_2: string | null
  Active: string | null
  Married: string | null
  MarAnnivMonth: string | null
  MarAnnivYear: string | null
  Divorced: string | null
  DivAnnivMonth: string | null
  DivAnnivYear: string | null
  FavTVShow: string | null
  FavSocialMedia: string | null
  Referrer: string | null
  Referred: string | null
  Bounced: string | null
  SingleEntry: string | null
  campaigncount: string | null
  campaigngroup: string | null
  LastPartialDt: string | null
  bouncedCount: number | null
  CustomerNote: string | null
  ShowDate: string | null
  CustomerShowBookedCount: number | null
  CustomerOldShowBookedCount: number | null
  OptOut: boolean | null
}
