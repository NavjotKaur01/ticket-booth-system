import type { ApiCustomerDetail } from "@/types/api/customer"
import {
  EMPTY_CUSTOMER_FORM,
  type CustomerFormValues,
} from "@/types/customer-form"

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

function mapBirthMonth(month: number | string | null | undefined) {
  if (month == null || month === "") {
    return ""
  }

  const numeric = Number(month)
  if (Number.isFinite(numeric) && numeric > 0) {
    return String(numeric).padStart(2, "0")
  }

  return String(month).trim()
}

function mapDobDayYear(year: number | null | undefined) {
  if (!year) {
    return ""
  }

  return `01/01/${year}`
}

export function mapApiCustomerToForm(
  customer: ApiCustomerDetail
): CustomerFormValues {
  return {
    ...EMPTY_CUSTOMER_FORM,
    lastName: customer.LastName?.trim() ?? "",
    firstName: customer.FirstName?.trim() ?? "",
    email: customer.Email1?.trim() ?? "",
    phone: phoneField(customer.AreaCode, customer.Phone1, customer.Phone2),
    altPhone1: phoneField(
      customer.AltAreaCode,
      customer.AltPhone1,
      customer.AltPhone2
    ),
    altPhone2: phoneField(
      customer.AltAreaCode_2,
      customer.AltPhone1_2,
      customer.AltPhone2_2
    ),
    address1: customer.Addr1?.trim() ?? "",
    address2: customer.Addr2?.trim() ?? "",
    country: mapCountryToForm(customer.Country),
    city: customer.City?.trim() ?? "",
    state: customer.State?.trim().toUpperCase() ?? "",
    zipCode: customer.Zip?.trim() ?? "",
    dobMonth: mapBirthMonth(customer.BirthMonth),
    dobDayYear: mapDobDayYear(customer.BirthYear),
    banned: customer.Banned?.trim().toUpperCase() === "Y",
    noCall: customer.NoCall?.trim().toUpperCase() === "Y",
    inactive: customer.Inactive?.trim().toUpperCase() === "Y",
    optOutEcm: Boolean(customer.OptOut),
    customerNotes: customer.CustomerNote?.trim() ?? "",
  }
}

import type { CustomerDetails } from "@/types/customer-details"

export function mapApiCustomerToDetails(
  customer: ApiCustomerDetail
): CustomerDetails {
  const phoneParts = [
    customer.AreaCode?.trim(),
    customer.Phone1?.trim(),
    customer.Phone2?.trim(),
  ].filter(Boolean)

  const altPhone1Parts = [
    customer.AltAreaCode?.trim(),
    customer.AltPhone1?.trim(),
    customer.AltPhone2?.trim(),
  ].filter(Boolean)

  const altPhone2Parts = [
    customer.AltAreaCode_2?.trim(),
    customer.AltPhone1_2?.trim(),
    customer.AltPhone2_2?.trim(),
  ].filter(Boolean)

  return {
    id: customer.CustomerID,
    name: [customer.LastName, customer.FirstName]
      .map((part) => part?.trim() ?? "")
      .filter(Boolean)
      .join(" "),
    email: customer.Email1?.trim() ?? "",
    phone: phoneParts.join("-"),
    altPhone1: altPhone1Parts.join("-"),
    altPhone2: altPhone2Parts.join("-"),
    address1: customer.Addr1?.trim() ?? "",
    address2: customer.Addr2?.trim() ?? "",
    dob: mapBirthMonth(customer.BirthMonth),
    status:
      customer.Active?.trim().toUpperCase() === "Y"
        ? "Yes"
        : customer.Active?.trim().toUpperCase() === "N"
          ? "No"
          : customer.Active?.trim() ?? "",
    maritalStatus: customer.Married?.trim().toUpperCase() === "Y" ? "Yes" : "No",
    anniversaryDate: customer.MarAnnivYear
      ? `01/01/${customer.MarAnnivYear}`
      : "",
    divorced: customer.Divorced?.trim().toUpperCase() === "Y" ? "Yes" : "No",
    notes: customer.CustomerNote?.trim() ?? "",
    banned: customer.Banned?.trim().toUpperCase() === "Y",
    noCall: customer.NoCall?.trim().toUpperCase() === "Y",
    inactive: customer.Inactive?.trim().toUpperCase() === "Y",
    optOutEcm: Boolean(customer.OptOut),
  }
}
