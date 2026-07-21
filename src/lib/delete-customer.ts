import {
  archiveCustomer,
  getCustomerDeleteDetail,
} from "@/lib/api/customers"
import { confirmDialog } from "@/lib/app-dialog"
import { buildCustomerDeleteRequest } from "@/lib/build-save-customer-request"
import type { Customer } from "@/types/customer"

type DeleteCustomerParams = {
  customer: Customer
  connectionName: string
  username: string
  userRight: string
}

function normalize(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? ""
}

function canDeleteCustomer(
  lastUpdateId: string | null | undefined,
  username: string,
  userRight: string,
  hasOldReservations: boolean
) {
  const isOwner = normalize(lastUpdateId) === normalize(username)
  const isAdmin = normalize(userRight) === "sec01"
  const isElevated = normalize(userRight) === "sec09"

  if (hasOldReservations) {
    return isOwner || isAdmin || isElevated
  }

  return isOwner || isAdmin
}

export async function deleteCustomerRecord({
  customer,
  connectionName,
  username,
  userRight,
}: DeleteCustomerParams) {
  const deleteRequest = buildCustomerDeleteRequest({
    connectionName,
    customerId: customer.id,
    lastUpdateId: username,
  })

  const detail = await getCustomerDeleteDetail(deleteRequest)

  if (!detail) {
    throw new Error("Customer does not exist.")
  }

  const oldReservationCount = detail.CustomerOldShowBookedCount ?? 0
  const reservationCount = detail.CustomerShowBookedCount ?? 0

  if (oldReservationCount > 0) {
    throw new Error(
      `This customer has ${oldReservationCount} current reservations. You can't delete this customer.`
    )
  }

  if (reservationCount > 0) {
    const proceed = await confirmDialog({
      title: "Delete Customer",
      description: `This customer had ${reservationCount} old reservations. Would you like to delete?`,
    })
    if (!proceed) {
      return false
    }
  } else {
    const proceed = await confirmDialog({
      title: "Delete Customer",
      description: "Are you sure you want to delete this customer?",
    })
    if (!proceed) {
      return false
    }
  }

  if (
    !canDeleteCustomer(
      detail.LastUpdateID,
      username,
      userRight,
      reservationCount > 0
    )
  ) {
    throw new Error("You do not have rights to delete this customer.")
  }

  const archived = await archiveCustomer(deleteRequest)

  if (archived !== true) {
    throw new Error(
      "Unable to delete customer. The server did not confirm the archive."
    )
  }

  return true
}
