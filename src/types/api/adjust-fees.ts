/**
 * Matches ClubMan `ShowAndPromotionFeeRequestModel` for
 * `PUT /clubman/api/Adminstrator/UpdateShowAndPromotionFee`.
 */
export type UpdateShowAndPromotionFeeRequest = {
  Connection: string
  LocationID: string
  LastUpdateID: string
  LastUpdateDt: string
  PhoneChargeDef: number | null
  PhoneCharge: number | null
  WalkUpFeeDef: number | null
  WalkupCharge: number | null
  WebFeeDef: number | null
  WebCharge: number | null
  DayOfShowDef: number | null
  DayOfShowCharge: number | null
}

/** Default column values loaded from system defaults (read-only in UI). */
export type AdjustFeeDefaults = {
  dayOfShow: number | null
  phoneCharge: number | null
  walkupCharge: number | null
  webCharge: number | null
}

/** Editable fee inputs (new values applied to future shows). */
export type AdjustFeeCharges = {
  dayOfShow: string
  phoneCharge: string
  walkupCharge: string
  webCharge: string
}

export const EMPTY_ADJUST_FEE_CHARGES: AdjustFeeCharges = {
  dayOfShow: "",
  phoneCharge: "",
  walkupCharge: "",
  webCharge: "",
}
