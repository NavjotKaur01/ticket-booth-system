import type { UserSetupRole } from "@/data/user-setup"

export type CreateUserFormValues = {
  userName: string
  password: string
  confirmPassword: string
  email: string
  roles: UserSetupRole[]
}

export const EMPTY_CREATE_USER_FORM: CreateUserFormValues = {
  userName: "",
  password: "",
  confirmPassword: "",
  email: "",
  roles: [],
}

export type ModifyUserFormValues = {
  email: string
  lockedOut: "Y" | "N"
  suspended: "Y" | "N"
  roles: UserSetupRole[]
}

export const EMPTY_MODIFY_USER_FORM: ModifyUserFormValues = {
  email: "",
  lockedOut: "N",
  suspended: "N",
  roles: [],
}
