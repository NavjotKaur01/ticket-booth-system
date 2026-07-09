export type AdminEventShowtime = {
  id: string
  showDate: string
  showDateLabel: string
  priceLabel: string
  hasNote?: boolean
}

export type AdminEventGroup = {
  id: string
  locationId: string
  title: string
  imageUrl: string
  showtimes: AdminEventShowtime[]
}

export type AdminEventFilters = {
  allShows: boolean
  date: string
  search: string
}

export const EMPTY_ADMIN_EVENT_FILTERS: AdminEventFilters = {
  allShows: true,
  date: "",
  search: "",
}
