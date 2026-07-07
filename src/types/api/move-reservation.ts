import type { SaveReservationPaymentRequest } from '@/types/api/save-reservation'

export type UpcomingShowDetailsRequest = {
  ConnectionString: string
  LocationId: string
  StartDate: string
}

export type MoveReservationRequest = {
  ConnectionString: string
  LocationId: string
  ReservationId: string
  ShowId: string
  ShowDetID: string
  ShowSec: string
  ShowPrice: number
  DayOfShowFee: number
  PhoneInFee: number
  WalkUpFee: number
  WebFee: number
  SourceLookUpCode: string
  Party: number
  OrigParty: number
  ExtraAmount: number
  IsExtraAmountPayable: boolean
  IsPaymentWindowRequest: boolean
  PromotionCode?: string
  Passes: number
  ResNotes: string
  IsDinner: boolean
  IsVIP: boolean
  LastUpdateID: string
  LastUpdateDt: string
  ActionForm: string
  Action: string
  PaymentModel?: SaveReservationPaymentRequest
}
