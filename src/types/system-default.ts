export type SystemDefault = {
  id: string
  screen: string
  field: string
  description: string
  defaultValue: string
  type: string
  lookupType: string
  lastUpdateId: string
  lastUpdateDt: string
}

export type SystemDefaultFilters = {
  screen: string
}

export const EMPTY_SYSTEM_DEFAULT_FILTERS: SystemDefaultFilters = {
  screen: "",
}

/** Desktop Roles.System / UserRights for full System Defaults visibility. */
export const SYSTEM_DEFAULTS_SYSTEM_RIGHT = "SEC09"
