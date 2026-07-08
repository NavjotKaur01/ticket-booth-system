export type ClubReservationSetting = {
  id: string
  newReservation: string
}

export type ClubReservationSettingFormValues = {
  newReservation: string
}

export const EMPTY_CLUB_RESERVATION_SETTING_FORM: ClubReservationSettingFormValues =
  {
    newReservation: "True",
  }
