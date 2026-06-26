import { createApi } from "@reduxjs/toolkit/query/react"

import { buildCustomerSearchRequest } from "@/lib/build-customer-search-request"
import { buildBusinessContactSearchRequest } from "@/lib/build-business-contact-search-request"
import {
  buildArchiveBusinessContactRequest,
  buildSaveBusinessContactRequest,
} from "@/lib/build-save-business-contact-request"
import { buildSaveCustomerRequest } from "@/lib/build-save-customer-request"
import { buildReservationDayRange } from "@/lib/reservation-date-range"
import { buildGetReservationPromotionsRequest } from "@/lib/build-get-reservation-promotions-request"
import { buildSearchPromotionRequest } from "@/lib/build-search-promotion-request"
import { buildCalendarFetchRange } from "@/lib/build-calendar-fetch-range"
import {
  administratorApiPath,
  calendarApiPath,
  clubApiPath,
  reportApiPath,
  reservationApiPath,
  systemApiPath,
} from "@/lib/api/paths"
import { mapLocation } from "@/lib/map-location"
import { saveLocations } from "@/lib/auth/locations-storage"
import { executeAccountLogin } from "@/lib/api/account-login"
import { clubmanBaseQuery, type ClubmanQueryError } from "@/store/api/baseQuery"
import type { AccountLoginRequest, ApiUserCredentials } from "@/types/api/account-login"
import type {
  ApiCalendarModel,
  CalendarRequestModel,
} from "@/types/api/calendar-data"
import type {
  ApiComedianSearchItem,
  ApiDefaultShowSection,
  ComedianSearchRequestModel,
  SaveShowRequestModel,
} from "@/types/api/save-show"
import type { ApiCustomerSearchItem } from "@/types/api/customer-search"
import type {
  ApiBusinessContactItem,
  BusinessCustomerRequest,
} from "@/types/api/business-contact"
import type { ApiLocation } from "@/types/api/locations"
import type { ApiPromotionSearchItem } from "@/types/api/promotion-search"
import type { ApiSystemLookupItem } from "@/types/api/system-lookup"
import type { RecentSalesReportData } from "@/types/api/recent-sales"
import type { ReservationDataItem } from "@/types/api/reservation-data"
import type { ReservationCustomerSearchItem } from "@/types/api/reservation-customer-search"
import type { SaveReservationRequest } from "@/types/api/save-reservation"
import type {
  GetShowDetailsByDateRequest,
  ShowDetailsByDateItem,
} from "@/types/api/show-details"
import type { ShowSectionItem } from "@/types/api/show-sections"
import type {
  ApiSystemUser,
  SaveSystemUserRequest,
  UpdateSystemUserRequest,
} from "@/types/api/system-users"
import type { CustomerSearchFilters } from "@/types/customer"
import type { CustomerFormValues } from "@/types/customer-form"
import type { BusinessContactFormValues } from "@/types/business-contact"
import type { BusinessContactSearchFilters } from "@/types/business-contact"
import type { PromotionFilters } from "@/types/promotion"

export const clubmanApi = createApi({
  reducerPath: "clubmanApi",
  baseQuery: clubmanBaseQuery,
  tagTypes: [
    "Location",
    "SystemUser",
    "Customer",
    "BusinessContact",
    "Promotion",
    "Reservation",
    "ShowDetails",
    "RecentSales",
    "Calendar",
  ],
  endpoints: (builder) => ({
    getLocations: builder.query({
      query: (clubSlug: string) => clubApiPath(clubSlug, "locations"),
      transformResponse: (response: ApiLocation[], _meta, clubSlug) => {
        saveLocations(clubSlug, response)
        return response.map(mapLocation)
      },
      providesTags: (_result, _error, clubSlug) => [
        { type: "Location", id: clubSlug },
      ],
    }),

    accountLogin: builder.mutation<ApiUserCredentials, AccountLoginRequest>({
      async queryFn(request) {
        try {
          const data = await executeAccountLogin(request)
          return { data }
        } catch (error) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error:
                error instanceof Error
                  ? error.message
                  : "Login failed",
            } satisfies ClubmanQueryError,
          }
        }
      },
    }),

    searchCustomers: builder.mutation({
      query: ({
        connectionName,
        locationId,
        filters,
        pageNumber,
      }: {
        connectionName: string
        locationId: string
        filters: CustomerSearchFilters
        pageNumber?: number
      }) => ({
        url: administratorApiPath("CustomerSearch"),
        method: "PUT",
        body: buildCustomerSearchRequest({
          connectionName,
          locationId,
          filters,
          pageNumber,
        }),
      }),
      transformResponse: (response: ApiCustomerSearchItem[]) => response,
      invalidatesTags: (_result, _error, arg) => [
        { type: "Customer", id: arg.locationId },
      ],
    }),

    searchReservationCustomers: builder.mutation({
      query: (body) => ({
        url: reservationApiPath("ReservationSearchCustomer"),
        method: "PUT",
        body,
      }),
      transformResponse: (response: ReservationCustomerSearchItem[]) => response,
    }),

    searchReservationBusinessCustomers: builder.mutation({
      query: (body) => ({
        url: reservationApiPath("ReservationSearchBusinessCustomer"),
        method: "PUT",
        body,
      }),
      transformResponse: (response: ReservationCustomerSearchItem[]) => response,
    }),

    saveCustomer: builder.mutation({
      query: ({
        connectionName,
        locationId,
        lastUpdateId,
        form,
      }: {
        connectionName: string
        locationId: string
        lastUpdateId: string
        form: CustomerFormValues
      }) => ({
        url: administratorApiPath("SaveCustomer"),
        method: "POST",
        body: buildSaveCustomerRequest({
          connectionName,
          locationId,
          lastUpdateId,
          form,
        }),
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Customer", id: arg.locationId },
      ],
    }),

    searchBusinessContacts: builder.mutation({
      query: ({
        connectionName,
        locationId,
        filters,
      }: {
        connectionName: string
        locationId: string
        filters: BusinessContactSearchFilters
      }) => ({
        url: administratorApiPath("BusniessCustomerSearch"),
        method: "PUT",
        body: buildBusinessContactSearchRequest({
          connectionName,
          locationId,
          filters,
        }),
      }),
      transformResponse: (response: ApiBusinessContactItem[]) => response,
      invalidatesTags: (_result, _error, arg) => [
        { type: "BusinessContact", id: arg.locationId },
      ],
    }),

    saveBusinessContact: builder.mutation({
      query: ({
        connectionName,
        locationId,
        lastUpdateId,
        form,
      }: {
        connectionName: string
        locationId: string
        lastUpdateId: string
        form: BusinessContactFormValues
      }) => ({
        url: administratorApiPath("SaveBusinessCustomer"),
        method: "POST",
        body: buildSaveBusinessContactRequest({
          connectionName,
          locationId,
          lastUpdateId,
          form,
        }),
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "BusinessContact", id: arg.locationId },
      ],
    }),

    updateBusinessContact: builder.mutation({
      query: ({
        connectionName,
        locationId,
        lastUpdateId,
        form,
        businessId,
      }: {
        connectionName: string
        locationId: string
        lastUpdateId: string
        form: BusinessContactFormValues
        businessId: string
      }) => ({
        url: administratorApiPath("UpdateBusinessCustomer"),
        method: "PUT",
        body: buildSaveBusinessContactRequest({
          connectionName,
          locationId,
          lastUpdateId,
          form,
          businessId,
        }),
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "BusinessContact", id: arg.locationId },
      ],
    }),

    getBusinessContactById: builder.mutation({
      query: ({
        connectionName,
        locationId,
        businessId,
      }: {
        connectionName: string
        locationId: string
        businessId: string
      }) => ({
        url: reservationApiPath(
          connectionName,
          locationId,
          businessId,
          "GetBusinessCustomerById"
        ),
        method: "GET",
      }),
      transformResponse: (response: ApiBusinessContactItem) => response,
    }),

    getBusinessContactDeleteDetail: builder.mutation({
      query: (body: BusinessCustomerRequest) => ({
        url: administratorApiPath("GetBusineesCustomerReservationBookedDetail"),
        method: "PUT",
        body,
      }),
      transformResponse: (response: ApiBusinessContactItem) => response,
    }),

    archiveBusinessContact: builder.mutation({
      query: ({
        connectionName,
        locationId,
        businessId,
        lastUpdateId,
      }: {
        connectionName: string
        locationId: string
        businessId: string
        lastUpdateId: string
      }) => ({
        url: administratorApiPath("ArchiveBusniessCustomer"),
        method: "PUT",
        body: buildArchiveBusinessContactRequest({
          connectionName,
          locationId,
          businessId,
          lastUpdateId,
        }),
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "BusinessContact", id: arg.locationId },
      ],
    }),

    getSystemUsers: builder.query({
      query: ({
        organization,
        locationId,
        userId,
        userRight,
      }: {
        organization: string
        locationId: string
        userId: string
        userRight: string
      }) => ({
        url: administratorApiPath(
          organization,
          locationId,
          userId,
          userRight,
          "GetAllSystemUsers"
        ),
        headers: { Accept: "application/json" },
      }),
      transformResponse: (response: ApiSystemUser[]) => response,
      providesTags: (_result, _error, arg) => [
        { type: "SystemUser", id: arg.locationId },
      ],
    }),

    saveSystemUser: builder.mutation({
      query: (request: SaveSystemUserRequest) => ({
        url: administratorApiPath("SaveSystemUser"),
        method: "POST",
        body: request,
      }),
      invalidatesTags: ["SystemUser"],
    }),

    updateSystemUser: builder.mutation({
      query: (request: UpdateSystemUserRequest) => ({
        url: administratorApiPath("UpdateSystemUser"),
        method: "PUT",
        body: request,
      }),
      invalidatesTags: ["SystemUser"],
    }),

    getReservationPromotions: builder.mutation({
      query: ({
        connectionName,
        locationId,
        showId,
        showDate,
        isManager,
      }: {
        connectionName: string
        locationId: string
        showId: string
        showDate: string
        isManager?: boolean
      }) => ({
        url: reservationApiPath("GetPromotions"),
        method: "PUT",
        body: buildGetReservationPromotionsRequest({
          connectionName,
          locationId,
          showId,
          showDate,
          isManager,
        }),
      }),
      transformResponse: (response: ApiPromotionSearchItem[]) => response,
      invalidatesTags: (_result, _error, arg) => [
        { type: "Promotion", id: `${arg.showId}:${arg.showDate}` },
      ],
    }),

    searchPromotions: builder.mutation({
      query: ({
        connectionName,
        locationId,
        filters,
      }: {
        connectionName: string
        locationId: string
        filters: PromotionFilters
      }) => ({
        url: administratorApiPath("SearchPromotion"),
        method: "PUT",
        body: buildSearchPromotionRequest({
          connectionName,
          locationId,
          filters,
        }),
      }),
      transformResponse: (response: ApiPromotionSearchItem[]) => response,
      invalidatesTags: (_result, _error, arg) => [
        { type: "Promotion", id: arg.locationId },
      ],
    }),

    getReservationData: builder.query({
      query: ({
        connectionString,
        showId,
        includeCancelledReservations,
      }: {
        connectionString: string
        showId: string
        includeCancelledReservations: boolean
      }) => ({
        url: reservationApiPath(
          connectionString,
          showId,
          String(includeCancelledReservations),
          "false",
          "false",
          "GetReservationData"
        ),
        headers: { Accept: "application/json" },
      }),
      transformResponse: (response: ReservationDataItem[]) => response,
      providesTags: (_result, _error, arg) => [
        { type: "Reservation", id: `${arg.showId}:${arg.includeCancelledReservations}` },
      ],
    }),

    getShowDetailsByDate: builder.query({
      query: ({
        connectionString,
        locationId,
        showDate,
        isCancelledShow,
      }: {
        connectionString: string
        locationId: string
        showDate: string
        isCancelledShow: boolean
      }) => {
        const { startDate, endDate } = buildReservationDayRange(showDate)
        const body: GetShowDetailsByDateRequest = {
          ConnectionString: connectionString,
          LocationId: locationId,
          StartDate: startDate,
          EndDate: endDate,
          IsCancelledShow: isCancelledShow,
        }

        return {
          url: reservationApiPath("GetShowDetailsByDate"),
          method: "PUT",
          body,
        }
      },
      transformResponse: (response: ShowDetailsByDateItem[]) => response,
      providesTags: (_result, _error, arg) => [
        { type: "ShowDetails", id: `${arg.locationId}:${arg.showDate}:${arg.isCancelledShow}` },
      ],
    }),

    getShowSections: builder.query({
      query: ({
        connectionString,
        showId,
      }: {
        connectionString: string
        showId: string
      }) => ({
        url: reservationApiPath(connectionString, showId, "GetShowSections"),
        headers: { Accept: "application/json" },
      }),
      transformResponse: (response: ShowSectionItem[]) => response,
      providesTags: (_result, _error, arg) => [
        { type: "ShowDetails", id: `sections:${arg.showId}` },
      ],
    }),

    saveReservation: builder.mutation({
      query: (body: SaveReservationRequest) => ({
        url: reservationApiPath("SaveReservation"),
        method: "POST",
        body,
      }),
      invalidatesTags: ["Reservation"],
    }),

    updateReservation: builder.mutation({
      query: (body: SaveReservationRequest) => ({
        url: reservationApiPath("UpdateReservation"),
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Reservation", "ShowDetails"],
    }),

    getCalendarData: builder.query({
      query: ({
        connectionString,
        locationId,
        calendarDate,
        isCancelled,
      }: {
        connectionString: string
        locationId: string
        calendarDate: string
        isCancelled: boolean
      }) => {
        const { startDate, endDate } = buildCalendarFetchRange(
          new Date(calendarDate)
        )
        const body: CalendarRequestModel = {
          ConnectionString: connectionString,
          LocationID: locationId,
          StartDate: startDate,
          EndDate: endDate,
          IsCancelled: isCancelled,
        }

        return {
          url: calendarApiPath("LoadCalendarDataV2"),
          method: "PUT",
          body,
        }
      },
      transformResponse: (response: ApiCalendarModel[]) => response,
      providesTags: (_result, _error, arg) => [
        {
          type: "Calendar",
          id: `${arg.locationId}:${arg.calendarDate}:${arg.isCancelled}`,
        },
      ],
    }),

    getSystemLookup: builder.query({
      query: (connectionName: string) => ({
        url: systemApiPath(connectionName, "LoadSystemLookUp"),
        method: "GET",
      }),
      transformResponse: (response: ApiSystemLookupItem[]) => response,
    }),

    searchComedians: builder.mutation({
      query: (body: ComedianSearchRequestModel) => ({
        url: calendarApiPath("ComedianSearch"),
        method: "PUT",
        body,
      }),
      transformResponse: (response: ApiComedianSearchItem[]) => response,
    }),

    getDefaultShowSections: builder.mutation({
      query: (body: SaveShowRequestModel) => ({
        url: calendarApiPath("GetDefaultShowSections"),
        method: "PUT",
        body,
      }),
      transformResponse: (response: ApiDefaultShowSection[]) => response,
    }),

    saveShow: builder.mutation({
      query: (body: SaveShowRequestModel) => ({
        url: calendarApiPath("SaveShow"),
        method: "POST",
        body,
      }),
      invalidatesTags: ["Calendar"],
    }),

    getRecentSalesReport: builder.query({
      query: ({
        clubSlug,
        locationId,
      }: {
        clubSlug: string
        locationId: string
      }) => ({
        url: reportApiPath(clubSlug, "GetRecentSales", locationId),
        method: "PUT",
      }),
      transformResponse: (response: RecentSalesReportData) => response,
      providesTags: (_result, _error, arg) => [
        { type: "RecentSales", id: arg.locationId },
      ],
    }),
  }),
})

export const {
  useGetLocationsQuery,
  useAccountLoginMutation,
  useSearchCustomersMutation,
  useSearchReservationCustomersMutation,
  useSearchReservationBusinessCustomersMutation,
  useSaveCustomerMutation,
  useSearchBusinessContactsMutation,
  useSaveBusinessContactMutation,
  useUpdateBusinessContactMutation,
  useGetBusinessContactByIdMutation,
  useGetBusinessContactDeleteDetailMutation,
  useArchiveBusinessContactMutation,
  useGetSystemUsersQuery,
  useSaveSystemUserMutation,
  useUpdateSystemUserMutation,
  useSearchPromotionsMutation,
  useGetReservationPromotionsMutation,
  useGetReservationDataQuery,
  useGetShowDetailsByDateQuery,
  useGetShowSectionsQuery,
  useSaveReservationMutation,
  useUpdateReservationMutation,
  useGetRecentSalesReportQuery,
  useGetCalendarDataQuery,
  useSearchComediansMutation,
  useGetDefaultShowSectionsMutation,
  useSaveShowMutation,
} = clubmanApi
