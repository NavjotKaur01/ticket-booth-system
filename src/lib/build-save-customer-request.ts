import type { PhoneParts } from "@/components/forms/phone-input-group"
import { formatApiDateTime } from "@/lib/format-datetime"
import { formatDesktopDateTime } from "@/lib/format-us-datetime"
import type { CustomerRequest } from "@/types/api/customer"
import type { SaveCustomerRequest } from "@/types/api/save-customer"
import type { CustomerSearchFilters } from "@/types/customer"
import type { CustomerFormValues } from "@/types/customer-form"

type BuildSaveCustomerRequestParams = {
  connectionName: string
  locationId: string
  lastUpdateId: string
  form: CustomerFormValues
  customerId?: string
}

const countryCodeMap: Record<string, string> = {
  US: "USA",
  CA: "CAN",
  MX: "MEX",
}

function mapCountry(country: string) {
  const trimmed = country.trim()
  if (!trimmed) {
    return null
  }

  return countryCodeMap[trimmed] ?? trimmed
}

function phonePartsToFields(parts: PhoneParts) {
  return {
    areaCode: parts.area.trim(),
    phone1: parts.prefix.trim(),
    phone2: parts.line.trim(),
  }
}

function phonePartsToFullNumber(parts: PhoneParts) {
  return `${parts.area}${parts.prefix}${parts.line}`.replace(/\D/g, "")
}

function parseBirthYear(dobDayYear: string) {
  const yearPart = dobDayYear.split("/").pop()?.trim()
  const year = Number(yearPart)
  return Number.isFinite(year) && year > 0 ? year : null
}

export function buildSaveCustomerRequest({
  connectionName,
  locationId,
  lastUpdateId,
  form,
}: BuildSaveCustomerRequestParams): SaveCustomerRequest {
  const phone = phonePartsToFields(form.phone)
  const altPhone1 = phonePartsToFields(form.altPhone1)
  const altPhone2 = phonePartsToFields(form.altPhone2)
  const email = form.email.trim()
  const birthYear = parseBirthYear(form.dobDayYear)
  const birthMonth = form.dobMonth.trim()
  const country = mapCountry(form.country)

  const request: SaveCustomerRequest = {
    ConnectionName: connectionName,
    LocationId: locationId,
    CustLastName: form.lastName.trim(),
    CustFirstName: form.firstName.trim(),
    Email1: email,
    AreaCode: phone.areaCode,
    Phone1: phone.phone1,
    Phone2: phone.phone2,
    Phone: phonePartsToFullNumber(form.phone),
    AltAreaCode: altPhone1.areaCode,
    AltPhone1: altPhone1.phone1,
    AltPhone2: altPhone1.phone2,
    AltAreaCode_2: altPhone2.areaCode,
    AltPhone1_2: altPhone2.phone1,
    AltPhone2_2: altPhone2.phone2,
    Addr1: form.address1.trim(),
    Addr2: form.address2.trim(),
    City1: form.city.trim(),
    State1: form.state.trim(),
    Country1: country ?? "",
    Zip: form.zipCode.trim(),
    Married: null,
    Divorced: null,
    LastUpdateID: lastUpdateId,
    LastUpdateDt: formatApiDateTime(new Date().toISOString()),
    BirthYear: birthYear ?? 0,
    BirthMonth: birthMonth,
    MarAnnivYear: 0,
    MarAnnivMonth: "",
    Banned: form.banned,
    NoCall: form.noCall,
    Inactive: form.inactive,
    OptOut: form.optOutEcm,
    CustomerNotes: form.customerNotes.trim(),
  }

  return request
}

/** Matches desktop `CustomerVM.EditCustomer` / `UpdateCustomer` payload. */
export function buildUpdateCustomerRequest({
  connectionName,
  locationId,
  lastUpdateId,
  form,
  customerId,
}: BuildSaveCustomerRequestParams & { customerId: string }): CustomerRequest {
  const phone = phonePartsToFields(form.phone)
  const altPhone1 = phonePartsToFields(form.altPhone1)
  const altPhone2 = phonePartsToFields(form.altPhone2)
  const email = form.email.trim()
  const birthYear = parseBirthYear(form.dobDayYear)
  const birthMonth = form.dobMonth.trim()
  const country = mapCountry(form.country)
  const now = new Date()

  const request: CustomerRequest = {
    ConnectionName: connectionName,
    LocationId: locationId,
    CustomerId: customerId,
    CustLastName: form.lastName.trim(),
    CustFirstName: form.firstName.trim(),
    Email1: email,
    CustEmail: email,
    AreaCode: phone.areaCode,
    Phone1: phone.phone1,
    Phone2: phone.phone2,
    AltAreaCode: altPhone1.areaCode,
    AltPhone1: altPhone1.phone1,
    AltPhone2: altPhone1.phone2,
    AltAreaCode_2: altPhone2.areaCode,
    AltPhone1_2: altPhone2.phone1,
    AltPhone2_2: altPhone2.phone2,
    Addr1: form.address1.trim(),
    Addr2: form.address2.trim(),
    City1: form.city.trim(),
    State1: form.state.trim(),
    Zip: form.zipCode.trim(),
    LastUpdateID: lastUpdateId,
    LastUpdateDt: formatDesktopDateTime(now),
    Banned: form.banned,
    NoCall: form.noCall,
    Inactive: form.inactive,
    OptOut: form.optOutEcm,
    CustomerNotes: form.customerNotes.trim(),
  }

  if (country) {
    request.Country1 = country
  }

  if (birthYear != null) {
    request.BirthYear = birthYear
  }

  if (birthMonth) {
    request.BirthMonth = birthMonth
  }

  return request
}

/** Matches desktop delete/archive `CustomerRequestModel` in `CustomerVM.DeleteCustomer`. */
export function buildCustomerDeleteRequest({
  connectionName,
  customerId,
  lastUpdateId,
}: {
  connectionName: string
  customerId: string
  lastUpdateId: string
}): CustomerRequest {
  const now = new Date()

  return {
    ConnectionName: connectionName,
    CustomerId: customerId,
    TodayDate: toLocalIsoDateTime(now),
    LastUpdateDt: formatDesktopDateTime(now),
    LastUpdateID: lastUpdateId,
  }
}

function toLocalIsoDateTime(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0")

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

/** @deprecated Use buildCustomerDeleteRequest — kept for archive endpoint compatibility. */
export function buildArchiveCustomerRequest(
  params: Parameters<typeof buildCustomerDeleteRequest>[0]
): CustomerRequest {
  return buildCustomerDeleteRequest(params)
}

export function customerFormToSearchFilters(
  form: CustomerFormValues
): CustomerSearchFilters {
  return {
    lastName: form.lastName.trim(),
    firstName: form.firstName.trim(),
    email: form.email.trim(),
    areaCode: form.phone.area.trim(),
    phone1: form.phone.prefix.trim(),
    phone2: form.phone.line.trim(),
  }
}
