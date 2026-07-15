import type { UpdateCustomerEmailRequest } from "@/types/api/update-customer-email"

export function buildUpdateCustomerEmailRequest({
  connectionName,
  customerId,
  email,
  lastUpdateId,
}: {
  connectionName: string
  customerId: string
  email: string
  lastUpdateId: string
}): UpdateCustomerEmailRequest {
  return {
    ConnectionString: connectionName,
    CustomerId: customerId,
    Email: email.trim(),
    LastUpdateId: lastUpdateId,
  }
}
