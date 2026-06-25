import { customerDetailsOverrides } from "@/data/customer-details"
import type { Customer } from "@/types/customer"
import type { CustomerDetails } from "@/types/customer-details"

export function mapCustomerToDetails(customer: Customer): CustomerDetails {
  const override = customerDetailsOverrides[customer.id]

  return {
    id: customer.id,
    name: `${customer.lastName} ${customer.firstName}`.trim(),
    email: customer.email,
    phone: customer.phoneNo,
    altPhone1: override?.altPhone1 ?? "",
    altPhone2: override?.altPhone2 ?? "",
    address1: override?.address1 ?? customer.address,
    address2: override?.address2 ?? "",
    dob: override?.dob ?? "",
    status: customer.status === "Y" ? "Yes" : customer.status === "N" ? "No" : customer.status,
    maritalStatus: override?.maritalStatus ?? "",
    anniversaryDate: override?.anniversaryDate ?? "",
    divorced: override?.divorced ?? "",
    notes: override?.notes ?? "",
    banned: override?.banned ?? false,
    noCall: override?.noCall ?? false,
    inactive: override?.inactive ?? false,
    optOutEcm: override?.optOutEcm ?? false,
  }
}
