export type PhoneParts = {
  area: string
  prefix: string
  line: string
}

export const EMPTY_PHONE_PARTS: PhoneParts = {
  area: "",
  prefix: "",
  line: "",
}

export const PHONE_SEGMENT_LENGTHS = {
  area: 3,
  prefix: 3,
  line: 4,
} as const

export type PhoneSegmentField = keyof PhoneParts

export function sanitizePhoneDigits(value: string, maxLength: number) {
  return value.replace(/\D/g, "").slice(0, maxLength)
}

export function parsePhoneString(phone: string): PhoneParts {
  const digits = phone.replace(/\D/g, "")

  return {
    area: digits.slice(0, 3),
    prefix: digits.slice(3, 6),
    line: digits.slice(6, 10),
  }
}

export function formatPhoneParts(parts: PhoneParts) {
  const area = parts.area.trim()
  const prefix = parts.prefix.trim()
  const line = parts.line.trim()

  if (!area && !prefix && !line) {
    return ""
  }

  if (line) {
    return `(${area}) ${prefix}-${line}`
  }

  if (prefix) {
    return `(${area}) ${prefix}`
  }

  return area
}

export function distributePhoneDigits(digits: string): PhoneParts {
  const clean = digits.replace(/\D/g, "").slice(0, 10)

  return {
    area: clean.slice(0, 3),
    prefix: clean.slice(3, 6),
    line: clean.slice(6, 10),
  }
}

export function getNextPhoneSegmentField(
  field: PhoneSegmentField,
  value: string
): PhoneSegmentField | null {
  if (value.length < PHONE_SEGMENT_LENGTHS[field]) {
    return null
  }

  if (field === "area") {
    return "prefix"
  }

  if (field === "prefix") {
    return "line"
  }

  return null
}

export function getPreviousPhoneSegmentField(
  field: PhoneSegmentField
): PhoneSegmentField | null {
  if (field === "line") {
    return "prefix"
  }

  if (field === "prefix") {
    return "area"
  }

  return null
}

export function mergePhoneDigits(current: PhoneParts, field: PhoneSegmentField, rawValue: string) {
  const incomingDigits = rawValue.replace(/\D/g, "")

  if (!incomingDigits) {
    return { ...current, [field]: "" }
  }

  const combined =
    field === "area"
      ? incomingDigits + current.prefix + current.line
      : field === "prefix"
        ? current.area + incomingDigits + current.line
        : current.area + current.prefix + incomingDigits

  return distributePhoneDigits(combined)
}
