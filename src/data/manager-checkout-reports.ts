import type { ManagerCheckoutShow } from "@/types/manager-checkout-report"
import { ZERO_PAYMENTS } from "@/types/manager-checkout-report"
import { userSession } from "@/data/dashboard"

export const reportTypeOptions = [
  { id: "past-customers", label: "Past Customers" },
  { id: "today-sales", label: "Today Sales" },
  { id: "manager-checkout", label: "Manager Checkout" },
  { id: "door-checkout", label: "Door Checkout" },
  { id: "quick-view-sales", label: "Quick View Sales" },
  { id: "revenue", label: "Revenue" },
  { id: "sales-by-show", label: "Sales By Show" },
  { id: "sales-by-day", label: "Sales By Day" },
]

export const CLUB_NAME = userSession.organization

const eveningShowPayments = {
  ...ZERO_PAYMENTS,
  visa: 11.5,
  subTotal: 11.5,
  total: 11.5,
}

export const managerCheckoutShows: ManagerCheckoutShow[] = [
  {
    id: "show-730",
    showDate: "06/18/2026",
    showTime: "7:30 PM",
    comicName: "Doug Benson",
    booked: 1,
    preSeat: 0,
    ticketPrices: "$10.0",
    totalReceipts: "N/A",
    financialRows: [
      {
        id: "cash-drawer",
        label: "Cash Drawer",
        amounts: { ...ZERO_PAYMENTS, total: 0 },
      },
      {
        id: "cash-drawer-refund",
        label: "Refund",
        amounts: ZERO_PAYMENTS,
        isRefund: true,
      },
      {
        id: "pos",
        label: "POS",
        amounts: ZERO_PAYMENTS,
      },
      {
        id: "pos-refund",
        label: "Refund",
        amounts: ZERO_PAYMENTS,
        isRefund: true,
      },
      {
        id: "web",
        label: "Web",
        amounts: eveningShowPayments,
      },
      {
        id: "web-refund",
        label: "Web/Refund",
        amounts: ZERO_PAYMENTS,
        isRefund: true,
      },
      {
        id: "totals",
        label: "Totals",
        amounts: eveningShowPayments,
      },
      {
        id: "sales-tax",
        label: "Sales tax",
        amounts: { ...ZERO_PAYMENTS, total: 0 },
        summaryOnly: true,
      },
      {
        id: "net-sales",
        label: "Net Sales",
        amounts: { ...ZERO_PAYMENTS, total: 0 },
        summaryOnly: true,
      },
      {
        id: "fee",
        label: "Fee",
        amounts: { ...ZERO_PAYMENTS, total: 1.5 },
        summaryOnly: true,
      },
      {
        id: "revenue",
        label: "Revenue",
        amounts: { ...ZERO_PAYMENTS, total: 10 },
        summaryOnly: true,
      },
    ],
    checkedInRows: [
      {
        id: "paid-promo",
        promotion: "<PAID>",
        party: 1,
        seated: 1,
        paid: 1,
        comp: 0,
        disc: 0,
        scanned: 0,
        scanPaid: 0,
        scanComp: 0,
        scanDisc: 0,
      },
    ],
    phoneIn: 0,
    walkup: 0,
    web: 1,
    originRows: [
      {
        id: "origin-web",
        origin: "Web",
        party: 1,
        preSeated: 0,
        paid: 1,
      },
    ],
    showSectionRows: [
      {
        id: "section-regular",
        section: "Regular",
        party: 1,
        totalAmount: 10,
      },
    ],
  },
  {
    id: "show-1000",
    showDate: "06/18/2026",
    showTime: "10:00 PM",
    comicName: "Doug Benson",
    booked: 0,
    preSeat: 0,
    ticketPrices: "$10.0, $20.0",
    totalReceipts: "N/A",
    financialRows: [
      {
        id: "cash-drawer",
        label: "Cash Drawer",
        amounts: ZERO_PAYMENTS,
      },
      {
        id: "cash-drawer-refund",
        label: "Refund",
        amounts: ZERO_PAYMENTS,
        isRefund: true,
      },
      {
        id: "pos",
        label: "POS",
        amounts: ZERO_PAYMENTS,
      },
      {
        id: "pos-refund",
        label: "Refund",
        amounts: ZERO_PAYMENTS,
        isRefund: true,
      },
      {
        id: "web",
        label: "Web",
        amounts: ZERO_PAYMENTS,
      },
      {
        id: "web-refund",
        label: "Web/Refund",
        amounts: ZERO_PAYMENTS,
        isRefund: true,
      },
      {
        id: "totals",
        label: "Totals",
        amounts: ZERO_PAYMENTS,
      },
      {
        id: "sales-tax",
        label: "Sales tax",
        amounts: ZERO_PAYMENTS,
        summaryOnly: true,
      },
      {
        id: "net-sales",
        label: "Net Sales",
        amounts: ZERO_PAYMENTS,
        summaryOnly: true,
      },
      {
        id: "fee",
        label: "Fee",
        amounts: ZERO_PAYMENTS,
        summaryOnly: true,
      },
      {
        id: "revenue",
        label: "Revenue",
        amounts: ZERO_PAYMENTS,
        summaryOnly: true,
      },
    ],
    checkedInRows: [],
    phoneIn: 0,
    walkup: 0,
    web: 0,
    originRows: [],
    showSectionRows: [],
  },
]
