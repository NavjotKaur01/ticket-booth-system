import { formatUsDateTime } from '@/lib/format-us-datetime'
import type { UpdateSplitReservationRequestModel } from '@/types/api/save-reservation'
import type { ReservationDetail } from '@/types/api/reservation-detail'

export function buildUpdateSplitReservationRequest({
  connectionName,
  reservationId,
  lastUpdateId,
  detail
}: {
  connectionName: string
  reservationId: string
  lastUpdateId: string
  detail: ReservationDetail
}): UpdateSplitReservationRequestModel {
  return {
    ConnectionString: connectionName,
    ReservationId: reservationId,
    ShowID: detail.ShowId ?? '',
    ShowDetID: detail.ShowDetID ?? '',
    ShowSec: detail.ResSec ?? '',
    ShowPrice: detail.Price ?? 0,
    DayOfShowFee: detail.DayOfShowFee ?? 0,
    PhoneInFee: detail.PhoneInFee ?? 0,
    WalkUpFee: detail.WalkUpFee ?? 0,
    WebFee: detail.WebFee ?? 0,
    SourceLookUpCode: detail.LookupSDescSource ?? '',
    Party: detail.PartyNo ?? 0,
    SubTotal: detail.SubTotal ?? 0,
    ServiceChage: detail.SVC ?? 0,
    Discount: 0, // Cleared for split
    Taxes: detail.SalesTax ?? 0,
    Total: detail.Total ?? 0,
    LastUpdateDt: formatUsDateTime(new Date()),
    LastUpdateId: lastUpdateId,
    TableNum: detail.TableNum ?? null
  }
}
