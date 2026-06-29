export type ReportRequestModel = {
  Connection: string
  StartDate?: string
  EndDate?: string
  LocaltionId?: string
  IsAddress?: boolean
  IsEmail?: boolean
  UserRole?: string
  HeadlinerId?: string
  IsWebReservationOnly?: boolean
  IsTotalOnly?: boolean
  AlterLocationId?: string
  ShowId?: string
  DrillType?: string
  CreatedBy?: string
}
