/**
 * Detects card brand from a card number string using prefix patterns so the UI
 * can react within the first few digits.
 */

export type CardBrand =
  | "VISA"
  | "MASTERCARD"
  | "AMEX"
  | "DISCOVER"
  | "JCB"
  | "MAESTRO"
  | "UNIONPAY"

export type DetectedCard = {
  brand: CardBrand
  label: string
}

type CardBrandDefinition = {
  brand: CardBrand
  label: string
  ranges: Array<[number, number]>
}

export const CARD_BRAND_DIGIT_LENGTHS: Record<CardBrand, number[]> = {
  VISA: [16],
  MASTERCARD: [16],
  AMEX: [15],
  DISCOVER: [16],
  JCB: [16],
  MAESTRO: [12, 13, 14, 15, 16, 17, 18, 19],
  UNIONPAY: [16, 17, 18, 19],
}

const CARD_BRAND_DEFINITIONS: CardBrandDefinition[] = [
  {
    brand: "VISA",
    label: "Visa",
    ranges: [[4, 4]],
  },
  {
    brand: "MASTERCARD",
    label: "Mastercard",
    ranges: [
      [51, 55],
      [2221, 2720],
    ],
  },
  {
    brand: "AMEX",
    label: "American Express",
    ranges: [
      [34, 34],
      [37, 37],
    ],
  },
  {
    brand: "DISCOVER",
    label: "Discover",
    ranges: [
      [6011, 6011],
      [644, 649],
      [65, 65],
    ],
  },
  {
    brand: "JCB",
    label: "JCB",
    ranges: [[3528, 3589]],
  },
  {
    brand: "UNIONPAY",
    label: "UnionPay",
    ranges: [[62, 62]],
  },
  {
    brand: "MAESTRO",
    label: "Maestro",
    ranges: [
      [50, 50],
      [56, 59],
      [63, 63],
      [67, 67],
    ],
  },
]

function getCardBrandDefinition(brand: CardBrand) {
  return CARD_BRAND_DEFINITIONS.find(definition => definition.brand === brand)
}

function rangeCanMatchPrefix(digits: string, start: number, end: number) {
  const rangeLength = String(start).length

  if (digits.length <= rangeLength) {
    const prefixMin = Number(digits.padEnd(rangeLength, "0"))
    const prefixMax = Number(digits.padEnd(rangeLength, "9"))

    return prefixMax >= start && prefixMin <= end
  }

  const prefix = Number(digits.slice(0, rangeLength))

  return prefix >= start && prefix <= end
}

export function getCardBrandCandidates(cardNumber: string): DetectedCard[] {
  const digits = cardNumber.replace(/\D/g, "")

  if (!digits) {
    return []
  }

  return CARD_BRAND_DEFINITIONS.filter(({ ranges }) =>
    ranges.some(([start, end]) => rangeCanMatchPrefix(digits, start, end))
  ).map(({ brand, label }) => ({ brand, label }))
}

export function isCardBrandCandidate(cardNumber: string, brand: CardBrand) {
  const digits = cardNumber.replace(/\D/g, "")
  const definition = getCardBrandDefinition(brand)

  if (!digits || !definition) {
    return false
  }

  return definition.ranges.some(([start, end]) =>
    rangeCanMatchPrefix(digits, start, end)
  )
}

export function getDetectedCardForBrand(brand: CardBrand): DetectedCard {
  const definition = getCardBrandDefinition(brand)

  return {
    brand,
    label: definition?.label ?? brand,
  }
}

export function detectCardBrand(cardNumber: string): DetectedCard | null {
  const candidates = getCardBrandCandidates(cardNumber)

  if (candidates.length === 1) {
    return candidates[0]
  }

  return null
}

export function getCardBrandMaxLength(
  cardNumber: string,
  resolvedBrand?: CardBrand | null
) {
  const detectedCard = resolvedBrand
    ? getDetectedCardForBrand(resolvedBrand)
    : detectCardBrand(cardNumber)

  if (!detectedCard) {
    return 19
  }

  return Math.max(...CARD_BRAND_DIGIT_LENGTHS[detectedCard.brand])
}

export function hasValidCardBrandLength(cardNumber: string) {
  const digits = cardNumber.replace(/\D/g, "")
  const detectedCard = detectCardBrand(digits)

  if (!detectedCard) {
    return false
  }

  return CARD_BRAND_DIGIT_LENGTHS[detectedCard.brand].includes(digits.length)
}
