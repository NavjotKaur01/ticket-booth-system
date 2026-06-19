import { formatApiDateTime } from "@/lib/format-datetime"
import type { RecentSalesReportData } from "@/types/api/recent-sales"
import type { TodaySalesSummary } from "@/types/today-sales-report"

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim()
}

export function mapRecentSalesReport(
  data: RecentSalesReportData
): TodaySalesSummary {
  return {
    ticketsSoldToday: data.Summary.TicketsSoldToday,
    todaysShows: data.ShowBreakDown.map((show) => ({
      id: show.ShowID,
      showName: normalizeText(show.ShowName),
      showDate: formatApiDateTime(show.ShowDt),
      reservations: show.ReservationCount,
      ticketsSold: show.TicketCount,
      revenue: show.TotalAmount,
    })),
    recentSales: data.RecentSales.map((sale) => ({
      id: sale.ReservationID,
      agent: sale.EnteredBy.trim(),
      customer: sale.Customer.trim(),
      show: `${normalizeText(sale.ShowName)} ${formatApiDateTime(sale.ShowDate)}`,
      qty: sale.Qty,
      total: sale.Total,
      paymentType: sale.PaymentType.trim(),
      createdOn: formatApiDateTime(sale.CreatedOn),
      email: sale.Email.trim(),
      comment: sale.Comment.trim(),
    })),
  }
}
