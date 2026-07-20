import type { AdminUserFormValues } from "@/types/user-admin"
import { EMPTY_ADMIN_USER_FORM } from "@/types/user-admin"

/** ClubMan Create User uses the same fields as Users → Add User. */
export type CreateUserFormValues = AdminUserFormValues

export const EMPTY_CREATE_USER_FORM: CreateUserFormValues = {
  ...EMPTY_ADMIN_USER_FORM,
}

export type ModifyUserFormValues = {
  email: string
  lockedOut: "Y" | "N"
  suspended: "Y" | "N"
  roles: string[]
}

export const EMPTY_MODIFY_USER_FORM: ModifyUserFormValues = {
  email: "",
  lockedOut: "N",
  suspended: "N",
  roles: [],
}
