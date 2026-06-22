import type { PhoneParts } from "@/components/forms/phone-input-group"
import { formatApiDateTime } from "@/lib/format-datetime"
import type { SaveCustomerRequest } from "@/types/api/save-customer"
import type { CustomerSearchFilters } from "@/types/customer"
import type { CustomerFormValues } from "@/types/customer-form"

type BuildSaveCustomerRequestParams = {
  connectionName: string
  locationId: string
  lastUpdateId: string
  form: CustomerFormValues
}

const countryCodeMap: Record<string, string> = {
  US: "USA",
  CA: "CAN",
  MX: "MEX",
}

function mapCountry(country: string) {
  return countryCodeMap[country] ?? country
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
  return Number.isFinite(year) ? year : 0
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

  return {
    ConnectionName: connectionName,
    LocationId: locationId,
    CustLastName: form.lastName.trim(),
    CustFirstName: form.firstName.trim(),
    Email1: form.email.trim(),
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
    Country1: mapCountry(form.country),
    Zip: form.zipCode.trim(),
    Married: null,
    Divorced: null,
    LastUpdateID: lastUpdateId,
    LastUpdateDt: formatApiDateTime(new Date().toISOString()),
    BirthYear: parseBirthYear(form.dobDayYear),
    BirthMonth: form.dobMonth.trim(),
    MarAnnivYear: 0,
    MarAnnivMonth: "",
    Banned: form.banned,
    NoCall: form.noCall,
    Inactive: form.inactive,
    OptOut: form.optOutEcm,
    CustomerNotes: form.customerNotes.trim(),
  }
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
