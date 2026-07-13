export type ShowTimeRow = {
  id: string
  groupId: string
  dayOfWeek: string
  startTime: string
  arrivalTime: string
  dinner: string
  noPasses: string
  age21Plus: string
  hub: string
  section: string
  price: string
  seats: number
  restrictedPromo: string
  web: string
}

export type ShowTimeFilters = {
  dayOfWeek: string
  showTime: string
  arrivalTime: string
}

export const DEFAULT_SHOW_TIME_FILTERS: ShowTimeFilters = {
  dayOfWeek: "mon",
  showTime: "",
  arrivalTime: "",
}

export type ShowTimeSectionDraft = {
  id: string
  sectionId: string
  price: string
  walkupFee: string
  phoneFee: string
  webFee: string
  seats: string
  showOnWeb: boolean
  restrictShowPromo: boolean
}

export type ShowTimeFormValues = {
  dayOfWeek: string
  alsoAppliesTo: Record<string, boolean>
  showTime: string
  arrivalTime: string
  dinner: boolean
  noPasses: boolean
  vipSeating: boolean
  age21Plus: boolean
  hub: boolean
  sectionId: string
  price: string
  walkupFee: string
  phoneFee: string
  webFee: string
  seats: string
  showOnWeb: boolean
  restrictShowPromo: boolean
  sections: ShowTimeSectionDraft[]
}

export const EMPTY_ALSO_APPLIES_TO: Record<string, boolean> = {
  sun: false,
  mon: true,
  tue: false,
  wed: false,
  thu: false,
  fri: false,
  sat: false,
}

export function createEmptyShowTimeForm(): ShowTimeFormValues {
  return {
    dayOfWeek: "mon",
    alsoAppliesTo: { ...EMPTY_ALSO_APPLIES_TO },
    showTime: "19:00",
    arrivalTime: "18:45",
    dinner: false,
    noPasses: false,
    vipSeating: false,
    age21Plus: true,
    hub: false,
    sectionId: "",
    price: "",
    walkupFee: "0.00",
    phoneFee: "0.00",
    webFee: "0.00",
    seats: "",
    showOnWeb: true,
    restrictShowPromo: false,
    sections: [],
  }
}
