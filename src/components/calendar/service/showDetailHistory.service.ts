export type ShowDetailHistoryRow = {
  id: string
  historyAction: string
  historyDate: string
  showSection: string
  showPrice: string
  seats: string
  showPromo: string
  active: string
  showAppearing: string
  assignSeats: string
  web: string
  lastUpdateId: string
  updatedOn: string
}

export type ShowDetailHistoryDialogData = {
  eventId: string
  records: ShowDetailHistoryRow[]
}
