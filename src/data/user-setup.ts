export const USER_SETUP_ROLES = [
  "Accountant",
  "Administrator",
  "Agency",
  "Comic",
  "Guest",
  "Manager",
  "Supervisor",
  "System",
  "User",
] as const

export type UserSetupRole = (typeof USER_SETUP_ROLES)[number]

export const userSetupLocations = [
  "JV Landscaping",
  "Little Rock Loony Bin",
  "St. Charles Funny Bone",
  "Standupmedia",
  "Tulsa Loony Bin",
  "WestPort Plaza",
  "Wichita Loony Bin",
]

export const userSetupUsers = [
  "Abby",
  "Accounting",
  "AdamN",
  "addison",
  "Adriana",
  "Adrienne",
  "Aj",
  "alex",
  "alexandra",
  "AlexW",
  "bill cousi",
  "max",
  "system",
]

export const modifyUserOptions = [
  {
    id: "bill-cousi",
    label: "bill cousi",
    email: "bill.cousi@example.com",
    lockedOut: "N" as const,
    suspended: "N" as const,
    roles: ["User", "Manager"] as UserSetupRole[],
  },
  {
    id: "max",
    label: "max",
    email: "max@standupmedia.com",
    lockedOut: "N" as const,
    suspended: "N" as const,
    roles: ["Administrator", "System"] as UserSetupRole[],
  },
  {
    id: "accounting",
    label: "Accounting",
    email: "accounting@standupmedia.com",
    lockedOut: "N" as const,
    suspended: "Y" as const,
    roles: ["Accountant"] as UserSetupRole[],
  },
]

export const YES_NO_OPTIONS = [
  { value: "Y", label: "Y" },
  { value: "N", label: "N" },
] as const
