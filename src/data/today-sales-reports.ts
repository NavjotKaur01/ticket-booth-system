import type { TodaySalesSummary } from "@/types/today-sales-report"

export const todaySalesSummary: TodaySalesSummary = {
  ticketsSoldToday: 2,
  todaysShows: [
    {
      id: "1",
      showName: "Ryan Sickler",
      showDate: "6/18/2026 3:00:00 PM",
      reservations: 1,
      ticketsSold: 1,
      revenue: 20,
    },
    {
      id: "2",
      showName: "Ryan Sickler",
      showDate: "6/18/2026 7:25:00 PM",
      reservations: 0,
      ticketsSold: 1,
      revenue: 128,
    },
  ],
  recentSales: [
    {
      id: "1",
      agent: "admin",
      customer: "kumar, Sandeep",
      show: "Ryan Sickler 6/18/2026 3:00:00 PM",
      qty: 2,
      total: 128,
      paymentType: "Cash",
      createdOn: "6/18/2026 2:57:21 PM",
      email: "sandeep@i...",
      comment: "",
    },
  ],
}
