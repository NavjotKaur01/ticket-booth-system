/** Matches ClubMan `SearchCustomerRequestModel` for reservation search APIs. */
export type ReservationCustomerSearchRequest = {
  ConnectioString: string
  CustLastName: string
  CustFirstName: string
  CustEmail: string
  BusinessName: string
  AreaCode: string
  Phone1: string
  Phone2: string
}

export type ReservationCustomerSearchItem = {
  CustomerID: string
  FirstName: string | null
  LastName: string | null
  Email1: string | null
  AreaCode: string | null
  Phone1: string | null
  Phone2: string | null
  BusinessName?: string | null
  BusName?: string | null
  /** ClubMan: "Y"/"N" or brush name "Red"/"White". */
  Banned?: string | null
}
