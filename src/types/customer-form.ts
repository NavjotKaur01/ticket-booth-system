import type { PhoneParts } from "@/components/forms/phone-input-group"
import { EMPTY_PHONE_PARTS } from "@/components/forms/phone-input-group"

export type CustomerFormValues = {
  lastName: string
  firstName: string
  email: string
  phone: PhoneParts
  altPhone1: PhoneParts
  altPhone2: PhoneParts
  address1: string
  address2: string
  country: string
  city: string
  state: string
  zipCode: string
  dobMonth: string
  dobDayYear: string
  banned: boolean
  noCall: boolean
  inactive: boolean
  optOutEcm: boolean
  customerNotes: string
}

export const EMPTY_CUSTOMER_FORM: CustomerFormValues = {
  lastName: "",
  firstName: "",
  email: "",
  phone: { ...EMPTY_PHONE_PARTS },
  altPhone1: { ...EMPTY_PHONE_PARTS },
  altPhone2: { ...EMPTY_PHONE_PARTS },
  address1: "",
  address2: "",
  country: "US",
  city: "",
  state: "OK",
  zipCode: "",
  dobMonth: "",
  dobDayYear: "",
  banned: false,
  noCall: false,
  inactive: false,
  optOutEcm: false,
  customerNotes: "",
}
