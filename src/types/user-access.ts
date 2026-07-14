export type ReportPermission = {
  id: string
  name: string
  user: boolean
  manager: boolean
  admin: boolean
}

export type UserAccessEditableRoles = {
  user: boolean
  manager: boolean
  admin: boolean
}

export type PermissionRole = keyof UserAccessEditableRoles

/** Desktop UserAcessVM.GetEditAceess — Admin column stays disabled in XAML. */
export function getUserAccessEditableRoles(
  userRight: string
): UserAccessEditableRoles {
  switch (userRight.trim().toUpperCase()) {
    case "SEC09":
    case "SEC01":
      return { user: true, manager: true, admin: false }
    case "SEC05":
      return { user: true, manager: true, admin: false }
    default:
      return { user: false, manager: false, admin: false }
  }
}
