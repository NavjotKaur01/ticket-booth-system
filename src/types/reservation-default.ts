export type ReservationDefaultActiveIndicator = "Y" | "N"

export type ReservationDefault = {
  id: string
  defaultName: string
  defaultValue: string
  description: string
  active: ReservationDefaultActiveIndicator
  showClub: ReservationDefaultActiveIndicator
  screen: number
  defaultType: string
  updatedBy: string
  updatedDate: string
}

export type ReservationDefaultFormValues = {
  defaultName: string
  defaultValue: string
  description: string
  active: ReservationDefaultActiveIndicator
  showClub: ReservationDefaultActiveIndicator
  screen: string
  defaultType: string
  updatedBy: string
  updatedDate: string
}

export const EMPTY_RESERVATION_DEFAULT_FORM: ReservationDefaultFormValues = {
  defaultName: "",
  defaultValue: "",
  description: "",
  active: "Y",
  showClub: "Y",
  screen: "1",
  defaultType: "",
  updatedBy: "system",
  updatedDate: new Date().toLocaleDateString("en-US"),
}
