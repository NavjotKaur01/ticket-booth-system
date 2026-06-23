export const RESERVATION_PAYMENT_TYPES = [
  { id: "cash", label: "Cash" },
  { id: "credit-card", label: "Credit Card Payment" },
  { id: "gift-card", label: "Gift Card" },
  { id: "gift-cert", label: "Gift Certificate" },
  { id: "hold-cc", label: "Hold with Credit Card" },
  { id: "pos", label: "POS" },
  { id: "web-gift-cert", label: "Web Gift Cert" },
] as const

export type ReservationPaymentType =
  (typeof RESERVATION_PAYMENT_TYPES)[number]["id"]

export const EXPIRATION_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const

export function getExpirationYears () {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 12 }, (_, index) => String(currentYear + index))
}

export function getPaymentDetailSectionTitle (
  paymentType: ReservationPaymentType
) {
  switch (paymentType) {
    case "credit-card":
      return "Credit Card Information"
    case "hold-cc":
      return "Hold With Credit Card"
    case "pos":
      return "POS"
    case "gift-card":
      return "Gift Card"
    case "gift-cert":
      return "Gift Certificate"
    case "web-gift-cert":
      return "Web Gift Cert"
    default:
      return null
  }
}

export type PaymentDetailLayout =
  | "none"
  | "full-credit-card"
  | "compact-credit-card"
  | "gift-account"

export function getPaymentDetailLayout (
  paymentType: ReservationPaymentType
): PaymentDetailLayout {
  switch (paymentType) {
    case "credit-card":
      return "full-credit-card"
    case "hold-cc":
    case "pos":
      return "compact-credit-card"
    case "gift-card":
    case "gift-cert":
    case "web-gift-cert":
      return "gift-account"
    default:
      return "none"
  }
}

export function getGiftAccountFieldLabel (
  paymentType: ReservationPaymentType
) {
  switch (paymentType) {
    case "gift-card":
    case "gift-cert":
      return "Gift Card Number"
    case "web-gift-cert":
      return "Web Gift Cert Number"
    default:
      return "Account Number"
  }
}
