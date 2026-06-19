import { PanelCard } from "@/components/common/panel-card"
import { DataTable } from "@/components/data-table/data-table"
import { pastCustomerRecords } from "@/data/past-customer-reports"
import { pastCustomerColumns } from "@/features/reports/past-customer-columns"

type PastCustomerReportProps = {
  dateFrom: string
  dateTo: string
}

function formatReportDate(value: string) {
  const [year, month, day] = value.split("-")
  if (!year || !month || !day) {
    return value
  }

  return `${month}/${day}/${year}`
}

export function PastCustomerReport({ dateFrom, dateTo }: PastCustomerReportProps) {
  return (
    <PanelCard>
      <div className="space-y-2 px-3 py-3">
        <div className="border-b pb-2 text-center">
          <h2 className="text-sm font-semibold text-foreground">
            Past Customer Report
          </h2>
          <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>
              Date Range:{" "}
              <span className="font-medium tabular-nums text-foreground">
                {formatReportDate(dateFrom)}
              </span>
            </span>
            <span>
              To:{" "}
              <span className="font-medium tabular-nums text-foreground">
                {formatReportDate(dateTo)}
              </span>
            </span>
          </div>
        </div>

        <DataTable
          columns={pastCustomerColumns}
          data={pastCustomerRecords}
          entityLabel="records"
        />
      </div>
    </PanelCard>
  )
}
