export type ReservationTransactionRow = {
  id: string
  transaction: string
  lastName: string
  firstName: string
  payment: string
  cardType: string
  cardNumber: string
  amount: number
  authorization: string
  pnref: string
  /** ClubMan payment type LookUpCode (e.g. PYMT01 = Hold with Credit Card). */
  paymentTypeCode: string
  isSplit: boolean
  dueAmt: number
  billAddr: string
  billZip: string
  expYr: string
  expMo: string

}
