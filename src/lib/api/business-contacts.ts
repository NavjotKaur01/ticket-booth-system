import { dispatchEndpoint } from "@/lib/api/dispatch-endpoint"
import { clubmanApi } from "@/store/api/clubmanApi"
import type {
  ApiBusinessContactItem,
  BusinessCustomerRequest,
} from "@/types/api/business-contact"
import type { BusinessContactFormValues } from "@/types/business-contact"
import type { BusinessContactSearchFilters } from "@/types/business-contact"

type SearchBusinessContactsParams = {
  connectionName: string
  locationId: string
  filters: BusinessContactSearchFilters
}

export function searchBusinessContacts({
  connectionName,
  locationId,
  filters,
}: SearchBusinessContactsParams) {
  return dispatchEndpoint<ApiBusinessContactItem[], SearchBusinessContactsParams>(
    clubmanApi.endpoints.searchBusinessContacts,
    { connectionName, locationId, filters }
  )
}

type SaveBusinessContactParams = {
  connectionName: string
  locationId: string
  lastUpdateId: string
  form: BusinessContactFormValues
}

export function saveBusinessContact({
  connectionName,
  locationId,
  lastUpdateId,
  form,
}: SaveBusinessContactParams) {
  return dispatchEndpoint<string[], SaveBusinessContactParams>(
    clubmanApi.endpoints.saveBusinessContact,
    { connectionName, locationId, lastUpdateId, form }
  )
}

type UpdateBusinessContactParams = SaveBusinessContactParams & {
  businessId: string
}

export function updateBusinessContact({
  connectionName,
  locationId,
  lastUpdateId,
  form,
  businessId,
}: UpdateBusinessContactParams) {
  return dispatchEndpoint<boolean, UpdateBusinessContactParams>(
    clubmanApi.endpoints.updateBusinessContact,
    { connectionName, locationId, lastUpdateId, form, businessId }
  )
}

type GetBusinessContactByIdParams = {
  connectionName: string
  locationId: string
  businessId: string
}

export function getBusinessContactById({
  connectionName,
  locationId,
  businessId,
}: GetBusinessContactByIdParams) {
  return dispatchEndpoint<ApiBusinessContactItem, GetBusinessContactByIdParams>(
    clubmanApi.endpoints.getBusinessContactById,
    { connectionName, locationId, businessId }
  )
}

type ArchiveBusinessContactParams = {
  connectionName: string
  locationId: string
  businessId: string
  lastUpdateId: string
}

export function archiveBusinessContact({
  connectionName,
  locationId,
  businessId,
  lastUpdateId,
}: ArchiveBusinessContactParams) {
  return dispatchEndpoint<boolean, ArchiveBusinessContactParams>(
    clubmanApi.endpoints.archiveBusinessContact,
    { connectionName, locationId, businessId, lastUpdateId }
  )
}

export function getBusinessContactDeleteDetail(body: BusinessCustomerRequest) {
  return dispatchEndpoint<ApiBusinessContactItem, BusinessCustomerRequest>(
    clubmanApi.endpoints.getBusinessContactDeleteDetail,
    body
  )
}
