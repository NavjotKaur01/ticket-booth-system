export type GiftOfLaughterRecord = {
  id: string
  locationId: string
  giftType: string
  senderFirstName: string
  senderLastName: string
  senderEmail: string
  receiverFirstName: string
  receiverLastName: string
  receiverAddress: string
  receiverEmail: string
  shippedBy: string
  originalAmount: number
  remainingBalance: number
  dateCreated: string
  transId: string
}

export type GiftOfLaughterFilters = {
  giftType: string
  senderFirstName: string
  senderLastName: string
  senderEmail: string
  receiverFirstName: string
  receiverLastName: string
  receiverAddress: string
  receiverEmail: string
  shippedBy: string
  originalAmount: string
  remainingBalance: string
  dateCreated: string
  transId: string
}

export const EMPTY_GIFT_OF_LAUGHTER_FILTERS: GiftOfLaughterFilters = {
  giftType: "",
  senderFirstName: "",
  senderLastName: "",
  senderEmail: "",
  receiverFirstName: "",
  receiverLastName: "",
  receiverAddress: "",
  receiverEmail: "",
  shippedBy: "",
  originalAmount: "",
  remainingBalance: "",
  dateCreated: "",
  transId: "",
}
