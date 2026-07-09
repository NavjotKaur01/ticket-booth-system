export type CustomerLogin = {
  id: string
  locationId: string
  locationLabel: string
  firstName: string
  lastName: string
  email: string
  password: string
  banned: boolean
  inactive: boolean
  active: boolean
}

export type CustomerLoginSearchFilters = {
  email: string
  firstName: string
  lastName: string
}

export type CustomerLoginTableFilters = {
  customerId: string
  firstName: string
  lastName: string
  email: string
  banned: string
  inactive: string
  active: string
}

export type CustomerLoginFormValues = {
  firstName: string
  lastName: string
  email: string
  password: string
  banned: boolean
  inactive: boolean
  active: boolean
}

export const EMPTY_CUSTOMER_LOGIN_SEARCH: CustomerLoginSearchFilters = {
  email: "",
  firstName: "",
  lastName: "",
}

export const EMPTY_CUSTOMER_LOGIN_TABLE_FILTERS: CustomerLoginTableFilters = {
  customerId: "",
  firstName: "",
  lastName: "",
  email: "",
  banned: "",
  inactive: "",
  active: "",
}

export const EMPTY_CUSTOMER_LOGIN_FORM: CustomerLoginFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  banned: false,
  inactive: false,
  active: true,
}
