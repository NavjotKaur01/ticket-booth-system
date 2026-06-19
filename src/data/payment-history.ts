import type { PaymentHistoryRecord } from "@/types/payment-history"

export const paymentHistoryRecords: PaymentHistoryRecord[] = [
  {
    id: "1",
    lastName: "kumar",
    firstName: "Sandeep",
    pnref: "A1B2C3D4E5",
    lastUpdateDate: "6/16/2026 3:28:55 AM",
    transactionType: "Credit Card Payment",
    amount: 11.5,
    responseMessage: "Approved",
  },
  {
    id: "2",
    lastName: "Ricke",
    firstName: "Max",
    pnref: "F6G7H8I9J0",
    lastUpdateDate: "6/17/2026 11:42:18 AM",
    transactionType: "Credit Card Payment",
    amount: 22.0,
    responseMessage: "Approved",
  },
  {
    id: "3",
    lastName: "Johnson",
    firstName: "Sarah",
    pnref: "K1L2M3N4O5",
    lastUpdateDate: "6/17/2026 2:15:00 PM",
    transactionType: "Cash Payment",
    amount: 102.0,
    responseMessage: "Approved",
  },
  {
    id: "4",
    lastName: "Martinez",
    firstName: "Carlos",
    pnref: "P6Q7R8S9T0",
    lastUpdateDate: "6/18/2026 9:05:33 AM",
    transactionType: "Credit Card Payment",
    amount: 23.0,
    responseMessage: "Declined",
  },
]
