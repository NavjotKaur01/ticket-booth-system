export type GiftCertificate = {
  id: string
  giftType: string
  certificateNo: string
  senderLastName: string
  senderFirstName: string
  senderEmail: string
  receiverLastName: string
  receiverFirstName: string
  receiverAddress: string
  receiverEmail: string
  shippedBy: string
  orgAmount: number
  amount: number
  giftCardRef: string
  createdBy: string
  createdDate: string
  pnref: string
  cashOutId: string
  cashOutDt: string
  lastUpdateId: string
  lastUpdateDt: string
}

export type GiftCertificateSearchFilters = {
  certificateNo: string
  lastName: string
  firstName: string
}

export const EMPTY_GIFT_CERTIFICATE_FILTERS: GiftCertificateSearchFilters = {
  certificateNo: "",
  lastName: "",
  firstName: "",
}
