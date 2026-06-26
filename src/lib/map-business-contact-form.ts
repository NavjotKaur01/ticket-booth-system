import type { ApiBusinessContactItem } from "@/types/api/business-contact"
import {
  EMPTY_BUSINESS_CONTACT_FORM,
  type BusinessContactFormValues,
} from "@/types/business-contact"

const apiCountryToForm: Record<string, string> = {
  USA: "US",
  US: "US",
  CAN: "CA",
  CA: "CA",
  Canada: "CA",
  MEX: "MX",
  MX: "MX",
}

function mapCountryToForm(country: string | null | undefined) {
  const normalized = country?.trim() ?? ""
  return apiCountryToForm[normalized] ?? normalized
}

function phoneField(
  area: string | null | undefined,
  prefix: string | null | undefined,
  line: string | null | undefined
) {
  return {
    area: area?.trim() ?? "",
    prefix: prefix?.trim() ?? "",
    line: line?.trim() ?? "",
  }
}

export function mapBusinessContactToForm(
  item: ApiBusinessContactItem
): BusinessContactFormValues {
  return {
    ...EMPTY_BUSINESS_CONTACT_FORM,
    businessName: item.BusinessName?.trim() ?? "",
    webAddress: item.HTTP?.trim() ?? "",
    lastName: item.LastName?.trim() ?? "",
    firstName: item.FirstName?.trim() ?? "",
    email: item.Email1?.trim() ?? "",
    phone: phoneField(item.AreaCode, item.Phone1, item.Phone2),
    altPhone: phoneField(item.AltAreaCode, item.AltPhone1, item.AltPhone2),
    fax: phoneField(item.FaxAreaCode, item.FaxPhone1, item.FaxPhone2),
    address1: item.Addr1?.trim() ?? "",
    address2: item.Addr2?.trim() ?? "",
    country: mapCountryToForm(item.Country),
    city: item.City?.trim() ?? "",
    state: item.State?.trim().toUpperCase() ?? "",
    zipCode: item.Zip?.trim() ?? "",
    businessNotes: item.CustomerNote?.trim() ?? "",
  }
}

export function businessFormToSearchFilters(
  form: BusinessContactFormValues
) {
  return {
    businessName: form.businessName.trim(),
    lastName: form.lastName.trim(),
    firstName: form.firstName.trim(),
    email: form.email.trim(),
  }
}
