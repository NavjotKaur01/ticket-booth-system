export const securityLevelOptions = [
  { id: "user", label: "User" },
  { id: "manager", label: "Manager" },
  { id: "administrator", label: "Administrator" },
]

export const userRightBySecurityLevel: Record<string, string> = {
  administrator: "SEC01",
  user: "SEC02",
  manager: "SEC05",
}

export const securityLevelByLabel: Record<string, string> = {
  Administrator: "administrator",
  User: "user",
  Manager: "manager",
}

export const userStatusOptions = [
  { id: "active", label: "Active" },
  { id: "inactive", label: "Inactive" },
]
