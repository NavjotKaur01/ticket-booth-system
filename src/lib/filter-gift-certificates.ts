import type {
  GiftCertificate,
  GiftCertificateSearchFilters,
} from "@/types/gift-certificate"

function matches(value: string, query: string) {
  if (!query) {
    return true
  }

  return value.toLowerCase().includes(query.toLowerCase())
}

export function filterGiftCertificates(
  certificates: GiftCertificate[],
  filters: GiftCertificateSearchFilters
) {
  return certificates.filter((certificate) => {
    if (!matches(certificate.certificateNo, filters.certificateNo)) {
      return false
    }

    if (!matches(certificate.senderLastName, filters.lastName)) {
      return false
    }

    if (!matches(certificate.senderFirstName, filters.firstName)) {
      return false
    }

    return true
  })
}
