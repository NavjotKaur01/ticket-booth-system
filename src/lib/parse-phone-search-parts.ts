import {
  distributePhoneDigits,
  PHONE_SEGMENT_LENGTHS,
} from '@/lib/phone-segment-input'

export type PhoneSearchParts = {
  areaCode: string
  phone1: string
  phone2: string
}

function sanitizePhoneSegment(
  value: string | null | undefined,
  maxLength: number
) {
  return (value ?? '').replace(/\D/g, '').slice(0, maxLength)
}

/** Normalize separate search fields to 3 / 3 / 4 digit segments. */
export function normalizePhoneSearchParts(parts: {
  areaCode?: string | null
  phone1?: string | null
  phone2?: string | null
}): PhoneSearchParts {
  return {
    areaCode: sanitizePhoneSegment(parts.areaCode, PHONE_SEGMENT_LENGTHS.area),
    phone1: sanitizePhoneSegment(parts.phone1, PHONE_SEGMENT_LENGTHS.prefix),
    phone2: sanitizePhoneSegment(parts.phone2, PHONE_SEGMENT_LENGTHS.line),
  }
}

/** Split a combined phone string into 3 / 3 / 4 digit search fields. */
export function parsePhoneSearchParts(value: string): PhoneSearchParts {
  const parts = distributePhoneDigits(value)

  return {
    areaCode: parts.area,
    phone1: parts.prefix,
    phone2: parts.line,
  }
}
