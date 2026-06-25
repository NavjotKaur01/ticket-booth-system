import { sectionOptions } from "@/data/reservation"

export type ExpressPaymentType = "Cash" | "Credit Card"

export type ExpressPanelTotals = {
  subtotal: string
  serviceCharge: string
  discount: string
  tax: string
  total: string
  paymentDue: number
}

const SERVICE_CHARGE_PER_TICKET = 1

function parsePrice(value: string) {
  return Number(value.replace(/[^0-9.]/g, "")) || 0
}

function formatMoney(value: number) {
  return `$${value.toFixed(2)}`
}

function calculateDiscount(
  promoId: string,
  sectionPrice: number,
  quantity: number
) {
  switch (promoId) {
    case "admit2":
      return quantity >= 2 ? sectionPrice : 0
    case "admit4":
      return quantity >= 4 ? sectionPrice * 2 : 0
    case "buy1get1":
      return sectionPrice * Math.floor(quantity / 2)
    case "comedy10":
      return sectionPrice * quantity * 0.1
    default:
      return 0
  }
}

export function calculateExpressPanelTotals({
  sectionId,
  promoId,
  quantity,
}: {
  sectionId: string
  promoId: string
  quantity: number
}): ExpressPanelTotals {
  const sanitizedQuantity = Math.max(0, quantity)
  const section = sectionOptions.find((option) => option.id === sectionId)
  const sectionPrice = section ? parsePrice(section.price) : 0
  const subtotal = sectionPrice * sanitizedQuantity
  const serviceCharge = sanitizedQuantity * SERVICE_CHARGE_PER_TICKET
  const discount = calculateDiscount(promoId, sectionPrice, sanitizedQuantity)
  const tax = 0
  const paymentDue = Math.max(0, subtotal + serviceCharge + tax - discount)

  return {
    subtotal: formatMoney(subtotal),
    serviceCharge: formatMoney(serviceCharge),
    discount: formatMoney(discount),
    tax: formatMoney(tax),
    total: formatMoney(paymentDue),
    paymentDue,
  }
}

export function calculateSalesTransactionChange({
  paymentAmount,
  paymentDue,
}: {
  paymentAmount: number
  paymentDue: number
}) {
  return paymentAmount - paymentDue
}

