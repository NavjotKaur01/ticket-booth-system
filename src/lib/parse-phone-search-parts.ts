export type PhoneSearchParts = {
  areaCode: string
  phone1: string
  phone2: string
}

export function parsePhoneSearchParts (value: string): PhoneSearchParts {
  const digits = value.replace(/\D/g, '')

  if (digits.length >= 10) {
    return {
      areaCode: digits.slice(0, 3),
      phone1: digits.slice(3, 6),
      phone2: digits.slice(6, 10)
    }
  }

  if (digits.length >= 7) {
    return {
      areaCode: '',
      phone1: digits.slice(0, 3),
      phone2: digits.slice(3, 7)
    }
  }

  if (digits.length >= 4) {
    return {
      areaCode: '',
      phone1: digits.slice(0, Math.min(3, digits.length)),
      phone2: digits.slice(3)
    }
  }

  return {
    areaCode: '',
    phone1: digits,
    phone2: ''
  }
}
