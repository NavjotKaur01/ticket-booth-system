export type DashboardNewsItem = {
  id: string
  header: string
  date: string
  startingDate: string
  endingDate: string
}

export type DashboardNewsFormValues = {
  header: string
  date: string
  startingDate: string
  endingDate: string
}

export const EMPTY_DASHBOARD_NEWS_FORM: DashboardNewsFormValues = {
  header: "",
  date: "",
  startingDate: "",
  endingDate: "",
}
