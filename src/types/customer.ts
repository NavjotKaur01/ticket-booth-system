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
}

export type CustomerSearchFilters = {
  lastName: string
  firstName: string
  email: string
  areaCode: string
  phone1: string
  phone2: string
}
