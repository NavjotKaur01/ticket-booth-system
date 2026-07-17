export type ShowHistoryRow = {
  id: string
  historyAction: string
  showDate: string
  showTime: string
  historyDate: string
  headliner: string
  headliner2: string
  feature: string
  feature2: string
  opener: string
  promoCode: string
  showDinner: string
  noPasses: string
  vip: string
  updatedOn: string
}

export type ShowHistoryDialogData = {
  eventId: string
  records: ShowHistoryRow[]
}
