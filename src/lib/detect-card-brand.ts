/**
 * Detects card brand from a card number string using the same regex patterns
 * as the desktop ClubMan WPF app (CheckCardType()).
 *
 * Returns null if the number doesn't match any known brand yet.
 * Matches only fire when the number is long enough to be a valid prefix pattern,
 * not on the first digit alone — matching desktop behaviour.
 */

export type CardBrand = "VISA" | "MASTERCARD" | "AMEX" | "DISCOVER"

export type DetectedCard = {
  brand: CardBrand
  label: string
}

const CARD_PATTERNS: { brand: CardBrand; label: string; pattern: RegExp }[] = [
  {
    brand: "VISA",
    label: "Visa",
    // starts with 4, 13–16 digits
    pattern: /^4[0-9]{12}(?:[0-9]{3})?$/,
  },
  {
    brand: "MASTERCARD",
    label: "Mastercard",
    // starts with 51–55, 16 digits
    pattern: /^5[1-5][0-9]{14}$/,
  },
  {
    brand: "AMEX",
    label: "American Express",
    // starts with 34 or 37, 15 digits
    pattern: /^3[47][0-9]{13}$/,
  },
  {
    brand: "DISCOVER",
    label: "Discover",
    // 6011 or 65xx, 16 digits
    pattern: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
  },
]

export function detectCardBrand(cardNumber: string): DetectedCard | null {
  const digits = cardNumber.replace(/\D/g, "")

  for (const { brand, label, pattern } of CARD_PATTERNS) {
    if (pattern.test(digits)) {
      return { brand, label }
    }
  }

  return null
}
