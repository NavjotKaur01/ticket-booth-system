import { parsePhoneString } from "@/lib/phone-segment-input"
import { mapCustomerToDetails } from "@/lib/map-customer-details"
import type { Customer } from "@/types/customer"
import type { CustomerFormValues } from "@/types/customer-form"
import { EMPTY_CUSTOMER_FORM } from "@/types/customer-form"

export function mapCustomerToForm(customer: Customer): CustomerFormValues {
  const details = mapCustomerToDetails(customer)

  return {
    ...EMPTY_CUSTOMER_FORM,
    lastName: customer.lastName,
    firstName: customer.firstName,
    email: customer.email,
    phone: parsePhoneString(customer.phoneNo),
    altPhone1: parsePhoneString(details.altPhone1),
    altPhone2: parsePhoneString(details.altPhone2),
    address1: details.address1,
    address2: details.address2,
    city: customer.city,
    dobMonth: details.dob,
    banned: details.banned,
    noCall: details.noCall,
    inactive: details.inactive,
    optOutEcm: details.optOutEcm,
    customerNotes: details.notes,
  }
}
