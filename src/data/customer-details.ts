import type { CustomerDetails } from "@/types/customer-details"

type CustomerDetailsOverride = Partial<
  Omit<CustomerDetails, "id" | "name" | "email" | "phone" | "status">
>

export const customerDetailsOverrides: Record<string, CustomerDetailsOverride> = {
  "1": {
    altPhone1: "121",
    altPhone2: "2111",
    address1: "max",
    address2: "Worthington",
    dob: "April",
    maritalStatus: "Marital status",
    anniversaryDate: "January",
    divorced: "",
    notes: "",
    banned: false,
    noCall: false,
    inactive: false,
    optOutEcm: false,
  },
  "2": {
    altPhone1: "717",
    altPhone2: "1717",
    address1: "Worthington",
    address2: "Columbus",
    dob: "March",
    maritalStatus: "Single",
    anniversaryDate: "",
    notes: "",
  },
  "3": {
    altPhone1: "111",
    altPhone2: "1111",
    dob: "June",
  },
}
