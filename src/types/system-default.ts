export type SystemDefault = {
  id: string
  screen: string
  description: string
  defaultValue: string
  lastUpdateId: string
  lastUpdateDt: string
}

export type SystemDefaultFilters = {
  screen: string
}

export const EMPTY_SYSTEM_DEFAULT_FILTERS: SystemDefaultFilters = {
  screen: "",
}
