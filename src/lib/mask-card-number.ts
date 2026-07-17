/**
 * Mask a card number to last-4 only for UI / RTK cache / print.
 * Never retain a full PAN in client state when a masked form is enough.
 */
export function maskCardNumber(cardNum: string | null | undefined): string {
  if (!cardNum) {
    return ""
  }

  const digits = cardNum.replace(/\D/g, "")
  if (!digits) {
    return ""
  }

  return `************${digits.slice(-4)}`
}
