export type RecentSalesShowBreakdown = {
  ShowID: string
  ShowName: string
  ShowDt: string
  ReservationCount: number
  TicketCount: number
  TotalAmount: number
}

export type RecentSalesActivity = {
  ReservationID: string
  EnteredBy: string
  Source: string
  Customer: string
  ShowName: string
  ShowDate: string
  Qty: number
  CreatedOn: string
  Email: string
  Comment: string
  Price: number
  Total: number
  PaymentType: string
  PaymentStatus: string
  PaidAmount: number
  ResStatus: string
}

export type RecentSalesReportData = {
  Summary: {
    TicketsSoldToday: number
  }
  ShowBreakDown: RecentSalesShowBreakdown[]
  RecentSales: RecentSalesActivity[]
}
