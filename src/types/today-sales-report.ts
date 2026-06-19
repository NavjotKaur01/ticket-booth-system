export type TodayShowRecord = {
  id: string
  showName: string
  showDate: string
  reservations: number
  ticketsSold: number
  revenue: number
}

export type RecentSalesActivityRecord = {
  id: string
  agent: string
  customer: string
  show: string
  qty: number
  total: number
  paymentType: string
  createdOn: string
  email: string
  comment: string
}

export type TodaySalesSummary = {
  ticketsSoldToday: number
  todaysShows: TodayShowRecord[]
  recentSales: RecentSalesActivityRecord[]
}
