import { createApi } from "@reduxjs/toolkit/query/react"

import { buildCustomerSearchRequest } from "@/lib/build-customer-search-request"
import { buildBusinessContactSearchRequest } from "@/lib/build-business-contact-search-request"
import {
  buildArchiveBusinessContactRequest,
  buildSaveBusinessContactRequest,
} from "@/lib/build-save-business-contact-request"
import { buildSaveCustomerRequest, buildUpdateCustomerRequest } from "@/lib/build-save-customer-request"
import { buildReservationDayRange } from "@/lib/reservation-date-range"
import { buildGetReservationPromotionsRequest } from "@/lib/build-get-reservation-promotions-request"
import { buildSearchPromotionRequest } from "@/lib/build-search-promotion-request"
import { buildSavePromotionRequest } from "@/lib/build-save-promotion-request"
import { buildUpdatePromotionRequest } from "@/lib/build-update-promotion-request"
import { buildCalendarFetchRange } from "@/lib/build-calendar-fetch-range"
import { coerceApiArray } from "@/lib/coerce-api-array"
import { formatRouteBoolean } from "@/lib/format-route-boolean"
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
import type { UpdateShowRequestModel } from "@/types/api/update-show"
import type { ApiShowData, ApiShowProperties } from "@/types/api/get-show-data"
import type { ApiCustomerSearchItem } from "@/types/api/customer-search"
import type { ApiComedianInfo, ComedianRequestModel } from "@/types/api/comedian-info"
import type { ApiDefShowItem, ShowDefRequestModel } from "@/types/api/show-def"
import type {
  ApiMarketingComedianSearchItem,
  ApiMarketingFilterCustomer,
  MarketingComedianSearchRequest,
} from "@/types/api/marketing-filter-search"
import type { ComicInfo } from "@/data/comedian-info"

import { buildUpdateComedianRequest } from "@/lib/build-update-comedian-request"
import { buildUpdateComedianImageRequest } from "@/lib/build-update-comedian-image-request"
import { buildMarketingFilterSearchRequest } from "@/lib/build-marketing-filter-search-request"
import type { MarketingFilterForm } from "@/types/marketing-filter"
import type { ApiCustomerDetail, CustomerRequest } from "@/types/api/customer"
import type {
  ApiBusinessContactItem,
  BusinessCustomerRequest,
} from "@/types/api/business-contact"
import type { ApiLocation } from "@/types/api/locations"
import type { ApiPromotionSearchItem } from "@/types/api/promotion-search"
import type { ApiSystemLookupItem } from "@/types/api/system-lookup"
import type { ApiDashboardData } from "@/types/api/dashboard-data"
import type { ApiSystemDefaultItem } from "@/types/api/system-defaults"
import type { UpdateShowAndPromotionFeeRequest } from "@/types/api/adjust-fees"
import type { RecentSalesReportData } from "@/types/api/recent-sales"
import type { ReportPermissionAccess } from "@/types/api/report-permission-access"
import type { ReportRequestModel } from "@/types/api/report-request"

export type ApiReportComedian = {
  ComicID: string
  ComicName?: string   // Primary display field returned by GetComedianList API
  StageName?: string   // Also sometimes present
  CominName?: string   // WPF client-side alias for ComicName
  FirstName?: string
  LastName?: string
}
import type { ReservationDataItem } from "@/types/api/reservation-data"
import type { ReservationCustomerSearchItem } from "@/types/api/reservation-customer-search"
import type { SaveReservationRequest } from "@/types/api/save-reservation"
import type { CancelReservationRequest } from "@/types/api/cancel-reservation"
import type { ReservationCheckInRequest } from "@/types/api/reservation-check-in"
import type {
  MoveReservationRequest,
  UpcomingShowDetailsRequest,
} from "@/types/api/move-reservation"
import type { ShowRequestModel } from "@/types/api/cancel-show"
import type { ReservationNoteRequest } from "@/types/api/reservation-note"
import { mapReservationDetail } from "@/lib/map-reservation-detail"
import { mapUpcomingShowDetails } from "@/lib/map-upcoming-show-details"
import type { ReservationHistoryItem } from "@/types/api/reservation-history"
import type { DailyTransactionItem } from "@/types/api/daily-transaction"
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
import type { PromotionFormValues } from "@/types/promotion-form"
import type { ReservationDetail } from "@/types/api/reservation-detail"
import type { ReservationPrintProperties } from "@/types/api/reservation-print"

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
    "DailyTransaction",
    "Dashboard",
    "SystemDefault",
    "Comedians",
    "ShowDefs",
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

    getReservationDetailById: builder.query<
      ReservationDetail,
      { connectionName: string; reservationId: string }
    >({
      query: ({ connectionName, reservationId }) => ({
        url: reservationApiPath(
          connectionName,
          reservationId,
          "GetReservationDetailById"
        ),
        headers: { Accept: "application/json" },
      }),
      transformResponse: (response: unknown) => mapReservationDetail(response),
      providesTags: (_result, _error, arg) => [
        { type: "Reservation", id: `detail:${arg.reservationId}` },
      ],
    }),

    getReservationPrintProperties: builder.query<
      ReservationPrintProperties,
      { connectionName: string; reservationId: string }
    >({
      query: ({ connectionName, reservationId }) => ({
        url: reservationApiPath(
          connectionName,
          reservationId,
          "GetReservationPrintProperties"
        ),
        headers: { Accept: "application/json" },
      }),
      transformResponse: (response: { Data: ReservationPrintProperties } | ReservationPrintProperties) => 
        'Data' in response ? response.Data : response,
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

    marketingFilterSearch: builder.mutation({
      query: ({
        connectionName,
        locationId,
        filters,
        pageNo,
      }: {
        connectionName: string
        locationId: string
        filters: MarketingFilterForm
        pageNo: number
      }) => ({
        url: administratorApiPath("MarketingFilterSearch"),
        method: "PUT",
        body: buildMarketingFilterSearchRequest({
          connectionName,
          locationId,
          filters,
          pageNo,
        }),
      }),
      transformResponse: (response: ApiMarketingFilterCustomer[]) => response,
    }),

    searchMarketingComedians: builder.mutation({
      query: (body: MarketingComedianSearchRequest) => ({
        url: reservationApiPath("ComicSearch"),
        method: "PUT",
        body,
      }),
      transformResponse: (response: ApiMarketingComedianSearchItem[]) => response,
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

    updateCustomer: builder.mutation({
      query: ({
        connectionName,
        locationId,
        lastUpdateId,
        form,
        customerId,
      }: {
        connectionName: string
        locationId: string
        lastUpdateId: string
        form: CustomerFormValues
        customerId: string
      }) => ({
        url: administratorApiPath("UpdateCustomer"),
        method: "POST",
        body: buildUpdateCustomerRequest({
          connectionName,
          locationId,
          lastUpdateId,
          form,
          customerId,
        }),
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Customer", id: arg.locationId },
      ],
    }),

    getCustomerById: builder.mutation({
      query: ({
        connectionName,
        locationId,
        customerId,
      }: {
        connectionName: string
        locationId: string
        customerId: string
      }) => ({
        url: reservationApiPath(
          connectionName,
          locationId,
          customerId,
          "GetCustomerById"
        ),
        method: "GET",
      }),
      transformResponse: (response: ApiCustomerDetail) => response,
    }),

    getCustomerDeleteDetail: builder.mutation({
      query: (body: CustomerRequest) => ({
        url: administratorApiPath("GetCustomerReservationBookedDetail"),
        method: "PUT",
        body,
      }),
      transformResponse: (response: ApiCustomerDetail) => response,
    }),

    archiveCustomer: builder.mutation({
      query: (body: CustomerRequest) => ({
        url: administratorApiPath("ArchiveCustomer"),
        method: "PUT",
        body,
      }),
      invalidatesTags: () => [
        { type: "Customer", id: "archive" },
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
        lastUpdateId,
        filters,
      }: {
        connectionName: string
        locationId: string
        lastUpdateId?: string
        filters: PromotionFilters
      }) => ({
        url: administratorApiPath("SearchPromotion"),
        method: "PUT",
        body: buildSearchPromotionRequest({
          connectionName,
          locationId,
          lastUpdateId,
          filters,
        }),
      }),
      transformResponse: (response: ApiPromotionSearchItem[]) => response,
      invalidatesTags: (_result, _error, arg) => [
        { type: "Promotion", id: arg.locationId },
      ],
    }),

    savePromotion: builder.mutation({
      query: ({
        connectionName,
        locationId,
        lastUpdateId,
        form,
      }: {
        connectionName: string
        locationId: string
        lastUpdateId: string
        form: PromotionFormValues
      }) => ({
        url: administratorApiPath("SavePromotion"),
        method: "POST",
        body: buildSavePromotionRequest({
          connectionName,
          locationId,
          lastUpdateId,
          form,
        }),
      }),
      transformResponse: (response: boolean) => response,
      invalidatesTags: (_result, _error, arg) => [
        { type: "Promotion", id: arg.locationId },
      ],
    }),

    getPromotionDetails: builder.mutation({
      query: ({
        connectionName,
        promotionId,
      }: {
        connectionName: string
        promotionId: string
      }) => ({
        url: administratorApiPath(
          connectionName,
          promotionId,
          "GetPromotionDetails"
        ),
        method: "GET",
      }),
      transformResponse: (response: ApiPromotionSearchItem) => response,
    }),

    updatePromotion: builder.mutation({
      query: ({
        connectionName,
        locationId,
        lastUpdateId,
        form,
        promotionId,
      }: {
        connectionName: string
        locationId: string
        lastUpdateId: string
        form: PromotionFormValues
        promotionId: string
      }) => ({
        url: administratorApiPath("UpdatePromotion"),
        method: "PUT",
        body: buildUpdatePromotionRequest({
          connectionName,
          locationId,
          lastUpdateId,
          promotionId,
          form,
        }),
      }),
      transformResponse: (response: boolean) => response,
      invalidatesTags: (_result, _error, arg) => [
        { type: "Promotion", id: arg.locationId },
      ],
    }),

    getReservationData: builder.query({
      query: ({
        connectionString,
        showId,
        includeCancelledReservations,
        isCheckedIn,
        isReservationForm,
      }: {
        connectionString: string
        showId: string
        includeCancelledReservations: boolean
        isCheckedIn: boolean
        isReservationForm: boolean
      }) => ({
        url: reservationApiPath(
          connectionString,
          showId,
          formatRouteBoolean(includeCancelledReservations),
          formatRouteBoolean(isCheckedIn),
          formatRouteBoolean(isReservationForm),
          "GetReservationData"
        ),
        headers: { Accept: "application/json" },
      }),
      transformResponse: (response: unknown) =>
        coerceApiArray<ReservationDataItem>(response),
      providesTags: (_result, _error, arg) => [
        {
          type: "Reservation",
          id: `${arg.showId}:${arg.includeCancelledReservations}:${arg.isCheckedIn}:${arg.isReservationForm}`,
        },
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
      transformResponse: (response: unknown) =>
        coerceApiArray<ShowSectionItem>(response),
      providesTags: (_result, _error, arg) => [
        { type: "ShowDetails", id: `sections:${arg.showId}` },
      ],
    }),

    getSystemDefaults: builder.query({
      query: ({
        connectionName,
        locationId,
      }: {
        connectionName: string
        locationId: string
      }) => ({
        url: systemApiPath(connectionName, locationId, "LoadSystemDefaults"),
        method: "GET",
      }),
      transformResponse: (response: unknown) =>
        coerceApiArray<ApiSystemDefaultItem>(response),
      providesTags: (_result, _error, arg) => [
        { type: "SystemDefault", id: `${arg.connectionName}:${arg.locationId}` },
      ],
    }),

    /** ClubMan AdjustFeesVM → PUT Adminstrator/UpdateShowAndPromotionFee */
    updateShowAndPromotionFee: builder.mutation({
      query: (request: UpdateShowAndPromotionFeeRequest) => ({
        url: administratorApiPath("UpdateShowAndPromotionFee"),
        method: "PUT",
        body: request,
      }),
      transformResponse: (response: unknown) => Boolean(response),
    }),

    loadDashboard: builder.query({
      query: ({
        connectionName,
        locationId,
      }: {
        connectionName: string
        locationId: string
      }) => ({
        url: systemApiPath(connectionName, locationId, "LoadDashboard"),
        method: "GET",
      }),
      transformResponse: (response: unknown) => response as ApiDashboardData,
      keepUnusedDataFor: 300,
      providesTags: (_result, _error, arg) => [
        { type: "Dashboard", id: `${arg.connectionName}:${arg.locationId}` },
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


    getReservationHistoryById: builder.query({
      query: ({
        connectionString,
        reservationId,
      }: {
        connectionString: string
        reservationId: string
      }) => ({
        url: reservationApiPath(
          connectionString,
          reservationId,
          "GetReservationHistoryById"
        ),
        headers: { Accept: "application/json" },
      }),
      transformResponse: (response: ReservationHistoryItem[]) => response,
      providesTags: (_result, _error, arg) => [
        { type: "Reservation", id: `history:${arg.reservationId}` },
      ],
    }),

    getReservationNoteById: builder.query({
      query: ({
        connectionString,
        reservationId,
      }: {
        connectionString: string
        reservationId: string
      }) => ({
        url: reservationApiPath(
          connectionString,
          reservationId,
          "GetReservationNotes"
        ),
        headers: { Accept: "application/json" },
      }),
      transformResponse: (response: unknown) => {
        if (typeof response === "string") {
          return response
        }

        if (response == null) {
          return ""
        }

        return String(response)
      },
      providesTags: (_result, _error, arg) => [
        { type: "Reservation", id: `note:${arg.reservationId}` },
      ],
    }),

    saveReservationNote: builder.mutation({
      query: (body: ReservationNoteRequest) => ({
        url: reservationApiPath("SaveReservationNotes"),
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        "Reservation",
        { type: "Reservation", id: `note:${arg.ReservationId}` },
      ],
    }),

    cancelReservation: builder.mutation({
      query: (body: CancelReservationRequest) => ({
        url: reservationApiPath("CancelReservation"),
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Reservation", "ShowDetails"],
    }),

    revertCancelReservation: builder.mutation({
      query: (body: CancelReservationRequest) => ({
        url: reservationApiPath("RevertCancelReservation"),
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Reservation", "ShowDetails"],
    }),

    getUpcomingShowDetails: builder.mutation({
      query: (body: UpcomingShowDetailsRequest) => ({
        url: reservationApiPath("GetUpComingShowDetails"),
        method: "PUT",
        body,
      }),
      transformResponse: (response: unknown) => mapUpcomingShowDetails(response),
    }),

    saveMoveReservation: builder.mutation({
      query: (body: MoveReservationRequest) => ({
        url: reservationApiPath("SaveMoveReservation"),
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Reservation", "ShowDetails"],
    }),

    reservationCheckIn: builder.mutation({
      query: (body: ReservationCheckInRequest) => ({
        url: reservationApiPath("ReservationCheckIn"),
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

    /** ClubMan ComedianVM.SaveComedian → POST Adminstrator/SaveComedian */
    saveComedian: builder.mutation({
      query: (
        body: ComedianRequestModel & {
          Image?: string | null
          ImageFileName?: string
        }
      ) => ({
        url: administratorApiPath("SaveComedian"),
        method: "POST",
        body,
      }),
      transformResponse: (response: unknown) => Boolean(response),
      invalidatesTags: ["Comedians"],
    }),

    /** ClubMan ShowTimesVM.Search → PUT Adminstrator/SearchDefShow */
    searchDefShow: builder.mutation({
      query: (body: ShowDefRequestModel) => ({
        url: administratorApiPath("SearchDefShow"),
        method: "PUT",
        body,
      }),
      transformResponse: (response: ApiDefShowItem[]) => response ?? [],
    }),

    /** ClubMan ShowTimesVM.AddSowTimes → POST Adminstrator/SaveShowDef */
    saveShowDef: builder.mutation({
      query: (body: ShowDefRequestModel) => ({
        url: administratorApiPath("SaveShowDef"),
        method: "POST",
        body,
      }),
      transformResponse: (response: unknown) => Boolean(response),
      invalidatesTags: ["ShowDefs"],
    }),

    /** ClubMan ShowTimesVM.UpdateSowTimes → PUT Adminstrator/UpdateShowDef */
    updateShowDef: builder.mutation({
      query: (body: ShowDefRequestModel) => ({
        url: administratorApiPath("UpdateShowDef"),
        method: "PUT",
        body,
      }),
      transformResponse: (response: unknown) => Boolean(response),
      invalidatesTags: ["ShowDefs"],
    }),

    /** ClubMan ShowTimesVM.DeleteShowTime → PUT Adminstrator/DeleteShowDefs */
    deleteShowDefs: builder.mutation({
      query: (body: ShowDefRequestModel) => ({
        url: administratorApiPath("DeleteShowDefs"),
        method: "PUT",
        body,
      }),
      transformResponse: (response: unknown) => Boolean(response),
      invalidatesTags: ["ShowDefs"],
    }),

    /** ClubMan ShowTimesVM.GetShowTimesInfo → GET Adminstrator/{conn}/{id}/GetDefShowInfo */
    getDefShowInfo: builder.query({
      query: ({
        connectionName,
        showDefId,
      }: {
        connectionName: string
        showDefId: string
      }) => ({
        url: administratorApiPath(connectionName, showDefId, "GetDefShowInfo"),
        method: "GET",
      }),
      transformResponse: (response: ApiDefShowItem[]) => response ?? [],
      providesTags: ["ShowDefs"],
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
      invalidatesTags: ["Calendar", "ShowDetails"],
    }),

    getDailyTransactionData: builder.query({
      query: ({
        connectionString,
        showId,
      }: {
        connectionString: string
        showId: string
      }) => ({
        url: reservationApiPath(
          connectionString,
          showId,
          "GetDailyTransactionData"
        ),
        headers: { Accept: "application/json" },
      }),
      transformResponse: (response: DailyTransactionItem[]) => response,
      providesTags: (_result, _error, arg) => [
        { type: "DailyTransaction", id: arg.showId },
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

    generateReport: builder.mutation<unknown, { endpoint: string; body: ReportRequestModel }>({
      query: ({ endpoint, body }) => ({
        url: `/clubman/api/Report/${endpoint}`,
        method: "PUT",
        body,
      }),
    }),

    getReportPermissionAccesses: builder.query<ReportPermissionAccess[], ReportRequestModel>({
      query: (body) => ({
        url: "/clubman/api/Report/GetReportPremissionAccesses",
        method: "PUT",
        body,
      }),
      transformResponse: (response: unknown) => {
        const rows = Array.isArray(response) ? response : []
        return rows.map((row) => {
          const r = row as Record<string, unknown>
          return {
            PermID: String(r.PermID ?? r.permID ?? ""),
            LocationID: (r.LocationID ?? r.locationID ?? null) as string | null,
            PermType: String(r.PermType ?? r.permType ?? "Report"),
            PermDesc: String(r.PermDesc ?? r.permDesc ?? ""),
            PermUserPos: String(r.PermUserPos ?? r.permUserPos ?? ""),
            PermAccess1: String(r.PermAccess1 ?? r.permAccess1 ?? ""),
          }
        })
      },
    }),

    getComedianList: builder.query<ApiReportComedian[], string>({
      query: (connectionName) => ({
        url: reportApiPath(connectionName, "GetComedianList"),
        method: "GET",
      }),
      transformResponse: (response: ApiReportComedian[]) => response ?? [],
      providesTags: ["Comedians"],
    }),

    getComedianInfo: builder.query<
      ApiComedianInfo,
      { connectionName: string; comicId: string }
    >({
      query: ({ connectionName, comicId }) =>
        calendarApiPath(connectionName, comicId, "GetComedianInfo"),
      transformResponse: (response: ApiComedianInfo | ApiComedianInfo[]) => {
        return Array.isArray(response) ? response[0] : response
      },
      providesTags: ["Comedians"],
    }),

    updateComedian: builder.mutation<
      unknown,
      {
        connectionName: string
        locationId: string
        username: string
        comicId: string
        form: ComicInfo
      }
    >({
      query: (params) => ({
        url: calendarApiPath("UpdateComedain"),
        method: "PUT",
        body: buildUpdateComedianRequest(params),
      }),
      invalidatesTags: ["Comedians"],
    }),

    updateComedianImage: builder.mutation<
      unknown,
      {
        connectionName: string
        locationId: string
        username: string
        comicId?: string
        base64Image: string
      }
    >({
      query: (params) => ({
        url: calendarApiPath("AddUpdateComedainImage"),
        method: "PUT",
        body: buildUpdateComedianImageRequest(params),
      }),
      invalidatesTags: ["Comedians"],
    }),

    deleteComedianImage: builder.mutation<
      unknown,
      {
        connectionName: string
        comicId: string
      }
    >({
      query: ({ connectionName, comicId }) => ({
        url: calendarApiPath(connectionName, comicId, "DeleteComedainImage"),
        method: "DELETE",
      }),
      invalidatesTags: ["Comedians"],
    }),

    cancelShow: builder.mutation<unknown, ShowRequestModel>({
      query: (body) => ({
        url: calendarApiPath("CancelShow"),
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        "Calendar",
        "ShowDetails",
        { type: "ShowDetails", id: `sections:${arg.CalendarShowId}` },
      ],
    }),

    unCancelShow: builder.mutation<unknown, ShowRequestModel>({
      query: (body) => ({
        url: calendarApiPath("UnCancelShow"),
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        "Calendar",
        "ShowDetails",
        { type: "ShowDetails", id: `sections:${arg.CalendarShowId}` },
      ],
    }),

    getShowData: builder.query<
      ApiShowData[],
      { connectionName: string; showId: string }
    >({
      query: ({ connectionName, showId }) =>
        calendarApiPath(connectionName, showId, "GetShowData"),
      providesTags: ["Calendar"],
    }),

    updateShow: builder.mutation<unknown, UpdateShowRequestModel>({
      query: (body) => ({
        url: calendarApiPath("UpdateShow"),
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        "Calendar",
        "ShowDetails",
        { type: "ShowDetails", id: `sections:${arg.ShowId}` },
      ],
    }),

    getShowProperties: builder.query<
      ApiShowProperties,
      { connectionName: string; showId: string }
    >({
      query: ({ connectionName, showId }) =>
        calendarApiPath(connectionName, showId, "GetShowProperties"),
      providesTags: ["Calendar"],
    }),
  }),
})

export const {
  useGetLocationsQuery,
  useAccountLoginMutation,
  useSearchCustomersMutation,
  useMarketingFilterSearchMutation,
  useSearchMarketingComediansMutation,
  useSearchReservationCustomersMutation,
  useSearchReservationBusinessCustomersMutation,
  useSaveCustomerMutation,
  useUpdateCustomerMutation,
  useGetCustomerByIdMutation,
  useGetCustomerDeleteDetailMutation,
  useArchiveCustomerMutation,
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
  useSavePromotionMutation,
  useGetPromotionDetailsMutation,
  useUpdatePromotionMutation,
  useGetReservationPromotionsMutation,
  useGetReservationDataQuery,
  useGetReservationDetailByIdQuery,
  useGetReservationPrintPropertiesQuery,
  useGetReservationHistoryByIdQuery,
  useGetReservationNoteByIdQuery,
  useSaveReservationNoteMutation,
  useGetShowDetailsByDateQuery,
  useGetShowSectionsQuery,
  useGetSystemDefaultsQuery,
  useGetSystemLookupQuery,
  useUpdateShowAndPromotionFeeMutation,
  useLoadDashboardQuery,
  useSaveReservationMutation,
  useUpdateReservationMutation,
  useCancelReservationMutation,
  useRevertCancelReservationMutation,
  useGetUpcomingShowDetailsMutation,
  useSaveMoveReservationMutation,
  useReservationCheckInMutation,
  useGetDailyTransactionDataQuery,
  useGetRecentSalesReportQuery,
  useGetCalendarDataQuery,
  useSearchComediansMutation,
  useSaveComedianMutation,
  useSearchDefShowMutation,
  useSaveShowDefMutation,
  useUpdateShowDefMutation,
  useDeleteShowDefsMutation,
  useGetDefShowInfoQuery,
  useLazyGetDefShowInfoQuery,
  useGetDefaultShowSectionsMutation,
  useSaveShowMutation,
  useGenerateReportMutation,
  useGetReportPermissionAccessesQuery,
  useGetComedianListQuery,
  useGetComedianInfoQuery,
  useUpdateComedianMutation,
  useUpdateComedianImageMutation,
  useDeleteComedianImageMutation,
  useCancelShowMutation,
  useUnCancelShowMutation,
  useGetShowDataQuery,
  useLazyGetShowDataQuery,
  useGetShowPropertiesQuery,
  useLazyGetShowPropertiesQuery,
  useUpdateShowMutation,
} = clubmanApi
