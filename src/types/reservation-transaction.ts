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
  isSplit: boolean
  dueAmt: number
  billAddr: string
  billZip: string
  expYr: string
  expMo: string

}
