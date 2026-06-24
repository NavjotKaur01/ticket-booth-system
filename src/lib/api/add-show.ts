import { buildDefaultSectionsQuery } from "@/lib/recurrence/build-default-sections-query"
import { toApiDateTime } from "@/lib/recurrence/recurrence-date-utils"
import { mapDefaultShowSectionsToDialogData } from "@/lib/map-default-show-sections"
import { mapSystemLookupsToSectionItems } from "@/lib/section-lookup"
import { dispatchEndpoint } from "@/lib/api/dispatch-endpoint"
import { clubmanApi } from "@/store/api/clubmanApi"
import type {
  ApiComedianSearchItem,
  ApiDefaultShowSection,
  SaveShowRequestModel,
} from "@/types/api/save-show"
import type { AddShowDialogData } from "@/types/calendar-show"
import type { ApiSystemLookupItem } from "@/types/api/system-lookup"
import type { RecurrenceState } from "@/types/recurrence"

type FetchAddShowDialogDataParams = {
  connectionString: string
  locationId: string
  recurrence: RecurrenceState
}

async function searchComedians(connectionString: string, locationId: string) {
  return dispatchEndpoint<ApiComedianSearchItem[], unknown>(
    clubmanApi.endpoints.searchComedians,
    {
      ConnectionString: connectionString,
      LocationId: locationId,
      LastName: "",
      FirstName: "",
      StageName: "",
      IsActiveComedian: false,
      IsComedianSerach: "",
    }
  )
}

async function fetchSystemLookups(connectionString: string) {
  return dispatchEndpoint<ApiSystemLookupItem[], string>(
    clubmanApi.endpoints.getSystemLookup,
    connectionString
  )
}

async function fetchSectionsForDay(
  connectionString: string,
  locationId: string,
  startDate: Date,
  endDate: Date,
  dayOfWeek: string
) {
  const body: SaveShowRequestModel = {
    ConnectionString: connectionString,
    LocationId: locationId,
    ShowDate: toApiDateTime(startDate),
    ShowArivalTime: toApiDateTime(startDate),
    LastUpdateDt: toApiDateTime(new Date()),
    LastUpdateId: "",
    IsShowAvailableOnWeb: true,
    ShowList: [],
    NewLookupList: [],
    StartDate: toApiDateTime(startDate),
    EndDate: toApiDateTime(endDate),
    DayOfWeek: dayOfWeek,
  }

  return dispatchEndpoint<ApiDefaultShowSection[], SaveShowRequestModel>(
    clubmanApi.endpoints.getDefaultShowSections,
    body
  )
}

export async function fetchAddShowDialogData({
  connectionString,
  locationId,
  recurrence,
}: FetchAddShowDialogDataParams): Promise<AddShowDialogData> {
  const query = buildDefaultSectionsQuery(recurrence)
  const [comedianResults, lookupResults] = await Promise.all([
    searchComedians(connectionString, locationId),
    fetchSystemLookups(connectionString),
  ])

  const performers = comedianResults.map((comedian) => ({
    id: comedian.ComicID,
    name:
      comedian.ComicName?.trim() ||
      comedian.StageName?.trim() ||
      [comedian.LastName, comedian.FirstName].filter(Boolean).join(", ") ||
      "Comedian",
  }))

  const sectionResponses = await Promise.all(
    query.dayNames.map((dayName) =>
      fetchSectionsForDay(
        connectionString,
        locationId,
        query.startDate,
        query.endDate,
        dayName
      )
    )
  )

  const sectionRows = sectionResponses.flat()
  const sectionLookups = mapSystemLookupsToSectionItems(lookupResults)

  return {
    ...mapDefaultShowSectionsToDialogData(sectionRows, performers),
    sectionLookups,
  }
}

export function saveShowRequest(request: SaveShowRequestModel) {
  return dispatchEndpoint<boolean, SaveShowRequestModel>(
    clubmanApi.endpoints.saveShow,
    request
  )
}
