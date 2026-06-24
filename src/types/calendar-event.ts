export type CalendarEvent = {
  id: string
  showId: string
  comicId: string
  title: string
  performer: string
  start: Date
  end: Date
  seats: {
    sold: number
    comp: number
    capacity: number
  }
  time: string
  status: string
  cancelled: boolean
  location: string
  rowColor?: string | null
  buttonColor?: string | null
}
