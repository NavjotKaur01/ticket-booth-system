import type { PhoneParts } from "@/components/forms/phone-input-group"
import { formatApiDateTime } from "@/lib/format-datetime"
import type { BusinessCustomerRequest } from "@/types/api/business-contact"
import type { BusinessContactFormValues } from "@/types/business-contact"

type BuildSaveBusinessContactRequestParams = {
  connectionName: string
  locationId: string
  lastUpdateId: string
  form: BusinessContactFormValues
  businessId?: string
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

export function buildSaveBusinessContactRequest({
  connectionName,
  locationId,
  lastUpdateId,
  form,
  businessId,
}: BuildSaveBusinessContactRequestParams): BusinessCustomerRequest {
  const phone = phonePartsToFields(form.phone)
  const altPhone = phonePartsToFields(form.altPhone)
  const fax = phonePartsToFields(form.fax)

  return {
    ConnectioString: connectionName,
    LocationId: locationId,
    ...(businessId ? { BusinessId: businessId } : {}),
    BusinessName: form.businessName.trim(),
    BusLastName: form.lastName.trim(),
    BusFirstName: form.firstName.trim(),
    AreaCode: phone.areaCode,
    Phone1: phone.phone1,
    Phone2: phone.phone2,
    AltAreaCode: altPhone.areaCode,
    AltPhone1: altPhone.phone1,
    AltPhone2: altPhone.phone2,
    FaxAreaCode: fax.areaCode,
    FaxPhone1: fax.phone1,
    FaxPhone2: fax.phone2,
    Fax: phonePartsToFullNumber(form.fax),
    Email1: form.email.trim(),
    Addr1: form.address1.trim(),
    Addr2: form.address2.trim(),
    City1: form.city.trim(),
    State1: form.state.trim() || null,
    Country1: form.country ? mapCountry(form.country) : null,
    Zip: form.zipCode.trim(),
    HTTP: form.webAddress.trim(),
    BusinessNotes: form.businessNotes.trim(),
    LastUpdateID: lastUpdateId,
    LastUpdateDt: formatApiDateTime(new Date().toISOString()),
  }
}

export function buildArchiveBusinessContactRequest({
  connectionName,
  locationId,
  businessId,
  lastUpdateId,
}: {
  connectionName: string
  locationId: string
  businessId: string
  lastUpdateId: string
}): BusinessCustomerRequest {
  const now = formatApiDateTime(new Date().toISOString())

  return {
    ConnectioString: connectionName,
    LocationId: locationId,
    BusinessId: businessId,
    LastUpdateID: lastUpdateId,
    LastUpdateDt: now,
    TodayDate: now,
  }
}
