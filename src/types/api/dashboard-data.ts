export type ApiDashboardFeature = {
  FeatureID: string
  FeatureHeader?: string
  Link?: string
  FeatureImage?: string | null
  UpdateDate?: string
  Description?: string
}

/** Matches ClubMan `DashbaordTicketModel` from LoadDashboard. */
export type ApiDashboardData = {
  TicketsYesterday?: number | null
  TicketsToday?: number | null
  TicketsWeek?: number | null
  TicketsMonthly?: number | null
  DashboardList?: ApiDashboardFeature[]
}
