import { createApi } from "@reduxjs/toolkit/query/react"

import { buildCustomerSearchRequest } from "@/lib/build-customer-search-request"
import { buildSaveCustomerRequest } from "@/lib/build-save-customer-request"
import { buildReservationDayRange } from "@/lib/reservation-date-range"
import { buildSearchPromotionRequest } from "@/lib/build-search-promotion-request"
import {
  administratorApiPath,
  clubApiPath,
  reportApiPath,
  reservationApiPath,
} from "@/lib/api/paths"
import { mapLocation } from "@/lib/map-location"
import { clubmanBaseQuery } from "@/store/api/baseQuery"
import type { AccountLoginRequest } from "@/types/api/account-login"
import type { ApiCustomerSearchItem } from "@/types/api/customer-search"
import type { ApiLocation } from "@/types/api/locations"
import type { ApiPromotionSearchItem } from "@/types/api/promotion-search"
import type { RecentSalesReportData } from "@/types/api/recent-sales"
import type { ReservationDataItem } from "@/types/api/reservation-data"
import type {
  GetShowDetailsByDateRequest,
  ShowDetailsByDateItem,
} from "@/types/api/show-details"
import type {
  ApiSystemUser,
  SaveSystemUserRequest,
  UpdateSystemUserRequest,
} from "@/types/api/system-users"
import type { CustomerSearchFilters } from "@/types/customer"
import type { CustomerFormValues } from "@/types/customer-form"
import type { PromotionFilters } from "@/types/promotion"

export const clubmanApi = createApi({
  reducerPath: "clubmanApi",
  baseQuery: clubmanBaseQuery,
  tagTypes: [
    "Location",
    "SystemUser",
    "Customer",
    "Promotion",
    "Reservation",
    "ShowDetails",
    "RecentSales",
  ],
  endpoints: (builder) => ({
    getLocations: builder.query({
      query: (clubSlug: string) => clubApiPath(clubSlug, "locations"),
      transformResponse: (response: ApiLocation[]) =>
        response.map(mapLocation),
      providesTags: (_result, _error, clubSlug) => [
        { type: "Location", id: clubSlug },
      ],
    }),

    accountLogin: builder.mutation({
      query: (request: AccountLoginRequest) => ({
        url: "/clubman/api/AccountLogin",
        method: "POST",
        body: request,
      }),
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
  useSaveCustomerMutation,
  useGetSystemUsersQuery,
  useSaveSystemUserMutation,
  useUpdateSystemUserMutation,
  useSearchPromotionsMutation,
  useGetReservationDataQuery,
  useGetShowDetailsByDateQuery,
  useGetRecentSalesReportQuery,
} = clubmanApi
