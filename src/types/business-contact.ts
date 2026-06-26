import type { PhoneParts } from "@/components/forms/phone-input-group"
import { EMPTY_PHONE_PARTS } from "@/components/forms/phone-input-group"

export type BusinessContact = {
  id: string
  businessName: string
  lastName: string
  firstName: string
  email: string
  webAddress: string
  address: string
  phoneNo: string
  fax: string
  lastUpdateId?: string
}

export type BusinessContactSearchFilters = {
  businessName: string
  lastName: string
  firstName: string
  email: string
}

export const EMPTY_BUSINESS_CONTACT_FILTERS: BusinessContactSearchFilters = {
  businessName: "",
  lastName: "",
  firstName: "",
  email: "",
}

export type BusinessContactFormValues = {
  businessName: string
  webAddress: string
  lastName: string
  firstName: string
  email: string
  phone: PhoneParts
  altPhone: PhoneParts
  fax: PhoneParts
  address1: string
  address2: string
  country: string
  city: string
  state: string
  zipCode: string
  businessNotes: string
}

export const EMPTY_BUSINESS_CONTACT_FORM: BusinessContactFormValues = {
  businessName: "",
  webAddress: "",
  lastName: "",
  firstName: "",
  email: "",
  phone: EMPTY_PHONE_PARTS,
  altPhone: EMPTY_PHONE_PARTS,
  fax: EMPTY_PHONE_PARTS,
  address1: "",
  address2: "",
  country: "US",
  city: "",
  state: "",
  zipCode: "",
  businessNotes: "",
}

export function getBusinessContactName(contact: BusinessContact) {
  return [contact.firstName, contact.lastName].filter(Boolean).join(" ")
}
