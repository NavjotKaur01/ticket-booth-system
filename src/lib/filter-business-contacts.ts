import type {
  BusinessContact,
  BusinessContactSearchFilters,
} from "@/types/business-contact"

function matches(value: string, query: string) {
  if (!query) return true
  return value.toLowerCase().includes(query.toLowerCase())
}

export function filterBusinessContacts(
  contacts: BusinessContact[],
  filters: BusinessContactSearchFilters
) {
  return contacts.filter((contact) => {
    if (!matches(contact.businessName, filters.businessName)) return false
    if (!matches(contact.lastName, filters.lastName)) return false
    if (!matches(contact.firstName, filters.firstName)) return false
    if (!matches(contact.email, filters.email)) return false
    return true
  })
}
