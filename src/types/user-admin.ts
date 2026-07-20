export type AdminUser = {
  id: string
  lastName: string
  firstName: string
  userName: string
  email: string
  password: string
  /** Display label from API Security (e.g. Administrator). */
  security: string
  /** ClubMan UserRight LookUpCode (e.g. SEC01). */
  userRight: string
  lastUpdateId: string
  lastUpdateDt: string
  status: string
}

export type AdminUserSearchFilters = {
  lastName: string
  firstName: string
  userName: string
  securityLevel: string
  active: string
}

export const EMPTY_ADMIN_USER_FILTERS: AdminUserSearchFilters = {
  lastName: "",
  firstName: "",
  userName: "",
  securityLevel: "",
  active: "",
}

export type AdminUserFormValues = {
  lastName: string
  firstName: string
  email: string
  userName: string
  password: string
  confirmPassword: string
  security: string
  status: string
}

export const EMPTY_ADMIN_USER_FORM: AdminUserFormValues = {
  lastName: "",
  firstName: "",
  email: "",
  userName: "",
  password: "",
  confirmPassword: "",
  security: "",
  status: "active",
}
