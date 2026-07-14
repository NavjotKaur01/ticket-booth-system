import { Fragment } from "react"
import {
  ReportCard,
  ReportEmpty,
  ReportHeader,
  ReportCenteredHeading,
  ReportTable,
  ReportTableScroll,
  ReportTd,
  ReportTh,
  ReportViewShell,
} from "@/features/reports/report-ui"
import { buildComicTicketRevenueDocument } from "@/features/reports/comic-ticket-revenue-document"

type ComicTicketRevenueViewProps = {
  rawData: unknown
  subtitle: string
  generatedAt: string
}

function fmtCurrency(v: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(v)
}

export function ComicTicketRevenueView({
  rawData,
  subtitle,
  generatedAt,
}: ComicTicketRevenueViewProps) {
  const document = buildComicTicketRevenueDocument(rawData)

  if (!document || !document.shows.length) {
    return <ReportEmpty />
  }

  const grandTotal = document.grandTotal

  return (
    <ReportViewShell>
      <ReportHeader
        title="Comic Ticket Revenue"
        subtitle={subtitle}
        generatedAt={generatedAt}
      />

      <ReportCenteredHeading>
        Comic Name: <span className="font-bold">{document.comicName}</span>
      </ReportCenteredHeading>

      <ReportCard>
        {document.shows.map((show, idx) => (
          <Fragment key={idx}>
            {/* Show block separator */}
            {idx > 0 && <div className="border-t-2 border-border" />}

            {/* Show block content */}
            <div className="px-4 py-3">
              {/* Show Date and Time Metadata */}
              <p className="pl-1 pb-1 pt-1 font-semibold text-xs text-foreground">
                Show Date: {show.showDate}
              </p>
              <p className="pl-1 pb-3 font-semibold text-xs text-muted-foreground">
                Show Time: {show.showTime}
              </p>
              <ReportTableScroll>
                <ReportTable>
                  <thead>
                    <tr>
                      <ReportTh className="w-[40%] bg-muted/40 font-semibold pl-4">Date Sold</ReportTh>
                      <ReportTh right className="w-[15%] bg-muted/40 font-semibold">Paid</ReportTh>
                      <ReportTh right className="w-[15%] bg-muted/40 font-semibold">Discounted</ReportTh>
                      <ReportTh right className="w-[15%] bg-muted/40 font-semibold">Comped</ReportTh>
                      <ReportTh right className="w-[15%] bg-muted/40 font-semibold pr-4">Revenue</ReportTh>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <ReportTd className="w-[40%] font-semibold pl-4">Sub Total</ReportTd>
                      <ReportTd right className="w-[15%] font-semibold">{show.paid}</ReportTd>
                      <ReportTd right className="w-[15%] font-semibold">{show.discounted}</ReportTd>
                      <ReportTd right className="w-[15%] font-semibold">{show.comped}</ReportTd>
                      <ReportTd right className="w-[15%] font-semibold pr-4">{fmtCurrency(show.revenue)}</ReportTd>
                    </tr>
                  </tbody>
                </ReportTable>
              </ReportTableScroll>
            </div>
          </Fragment>
        ))}

        {/* Double separator before Grand Total */}
        <div className="flex flex-col gap-[2px] py-1 bg-background">
          <div className="border-t-2 border-border" />
        </div>

        {/* Grand Total Row */}
        <div className="px-4 pb-4 pt-2">
          <ReportTableScroll>
            <ReportTable>
              <tbody>
                <tr className="bg-muted/30 font-bold">
                  <ReportTd bold className="w-[40%] font-bold pl-4">Grand Total</ReportTd>
                  <ReportTd right bold className="w-[15%] font-bold">{grandTotal.paid}</ReportTd>
                  <ReportTd right bold className="w-[15%] font-bold">{grandTotal.discounted}</ReportTd>
                  <ReportTd right bold className="w-[15%] font-bold">{grandTotal.comped}</ReportTd>
                  <ReportTd right bold className="w-[15%] font-bold pr-4">{fmtCurrency(grandTotal.revenue)}</ReportTd>
                </tr>
              </tbody>
            </ReportTable>
          </ReportTableScroll>
        </div>
      </ReportCard>

      <p className="text-right text-xs text-muted-foreground mt-2">
        {document.shows.length} show{document.shows.length !== 1 ? "s" : ""}
      </p>
    </ReportViewShell>
  )
}
