export type SaveCustomerRequest = {
  ConnectionName: string
  LocationId: string
  CustLastName: string
  CustFirstName: string
  Email1: string
  AreaCode: string
  Phone1: string
  Phone2: string
  Phone: string
  AltAreaCode: string
  AltPhone1: string
  AltPhone2: string
  AltAreaCode_2: string
  AltPhone1_2: string
  AltPhone2_2: string
  Addr1: string
  Addr2: string
  City1: string
  State1: string
  Country1: string
  Zip: string
  Married: string | null
  Divorced: string | null
  LastUpdateID: string
  LastUpdateDt: string
  BirthYear: number
  BirthMonth: string
  MarAnnivYear: number
  MarAnnivMonth: string
  Banned: boolean
  NoCall: boolean
  Inactive: boolean
  OptOut: boolean
  CustomerNotes: string
}
