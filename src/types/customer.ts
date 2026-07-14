export type Customer = {
  id: string
  lastName: string
  firstName: string
  email: string
  password: string
  address: string
  phoneNo: string
  city: string
  status: string
  /** ClubMan Customer.Banned === "Y" — Search Customer red-row highlight. */
  banned: boolean
}

export type CustomerSearchFilters = {
  lastName: string
  firstName: string
  email: string
  areaCode: string
  phone1: string
  phone2: string
}
