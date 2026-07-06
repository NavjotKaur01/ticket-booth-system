export type MarketingFilterSearchRequest = {
  ConnectionString: string
  LocationID: string
  FirstName: string
  LastName: string
  Zip: string
  Zip1: string
  Zip2: string
  Zip3: string
  Zip4: string
  IsDOB: boolean
  BirthMonth: number
  IsSince: boolean
  Since: string
  SinceTo: string
  IsInactive: boolean
  IsBanned: boolean
  IsPhone: boolean
  IsEmail: boolean
  IsNocall: boolean
  IsAddress: boolean
  ComicIds: string
  TodayDate: string
  PageNo: number
}

export type ApiMarketingFilterCustomer = {
  CustomerID: string
  LocationID?: string | null
  FirstName?: string | null
  LastName?: string | null
  Addr1?: string | null
  Addr2?: string | null
  City?: string | null
  State?: string | null
  Zip?: string | null
  ZipExt?: string | null
  Country?: string | null
  Phone?: string | null
  AltPhone?: string | null
  AreaCode?: string | null
  Phone1?: string | null
  Phone2?: string | null
  AltAreaCode?: string | null
  AltPhone1?: string | null
  AltPhone2?: string | null
  AltAreaCode_2?: string | null
  AltPhone1_2?: string | null
  AltPhone2_2?: string | null
  Email1?: string | null
  DateCreated?: string | null
  Active?: string | null
  LastUpdateID?: string | null
  LastUpdateDt?: string | null
}

export type MarketingComedianSearchRequest = {
  ConnectionString: string
  LocationId: string
  LastName?: string
  FirstName?: string
  StageName?: string
  IsActiveComedian?: boolean
  IsMarketFilterSearch?: boolean
}

export type ApiMarketingComedianSearchItem = {
  ComicID: string
  ComicName?: string | null
  LastName?: string | null
  FirstName?: string | null
  StageName?: string | null
}
