import { formatDesktopDateTime } from "@/lib/format-us-datetime"
import type {
  AdjustFeeCharges,
  AdjustFeeDefaults,
  UpdateShowAndPromotionFeeRequest,
} from "@/types/api/adjust-fees"

type BuildUpdateShowAndPromotionFeeRequestParams = {
  connectionName: string
  locationId: string
  lastUpdateId: string
  defaults: AdjustFeeDefaults
  charges: AdjustFeeCharges
}

/** Mirrors ClubMan AdjustFeesVM.Update request construction. */
export function buildUpdateShowAndPromotionFeeRequest({
  connectionName,
  locationId,
  lastUpdateId,
  defaults,
  charges,
}: BuildUpdateShowAndPromotionFeeRequestParams): UpdateShowAndPromotionFeeRequest {
  return {
    Connection: connectionName,
    LocationID: locationId,
    LastUpdateID: lastUpdateId,
    LastUpdateDt: formatDesktopDateTime(new Date()),
    PhoneChargeDef: defaults.phoneCharge,
    PhoneCharge: parseOptionalDecimal(charges.phoneCharge),
    WalkUpFeeDef: defaults.walkupCharge,
    WalkupCharge: parseOptionalDecimal(charges.walkupCharge),
    WebFeeDef: defaults.webCharge,
    WebCharge: parseOptionalDecimal(charges.webCharge),
    DayOfShowDef: defaults.dayOfShow,
    DayOfShowCharge: parseOptionalDecimal(charges.dayOfShow),
  }
}

function parseOptionalDecimal(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : null
}
