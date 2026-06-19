export type ChangePasswordFormValues = {
  currentPassword: string
  newPassword: string
  verifyPassword: string
}

export const EMPTY_CHANGE_PASSWORD_FORM: ChangePasswordFormValues = {
  currentPassword: "",
  newPassword: "",
  verifyPassword: "",
}
