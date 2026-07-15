import { useState } from 'react'
import { cn } from '@/lib/utils'
import dayjs from 'dayjs'
import {
  ReportDrillDialog,
  type DrillColumn
} from '@/features/reports/report-drill-dialog'
import type { ReportDrillContext } from '@/features/reports/reports.service'
import {
  ReportCard,
  ReportEmpty,
  ReportHeader,
  ReportRecordCount,
  ReportTable,
  ReportTableScroll,
  ReportViewShell
} from '@/features/reports/report-ui'

type AuditRow = {
  ReservationID?: string
  CreateDt?: string
  AdjustedDt?: string
  MovedBy?: string
  CreatedBy?: string
  ComicName?: string
  IsComp?: boolean | number | string
}

function fmtDt(v: string | undefined): string {
  if (!v) return '—'
  const d = dayjs(v)
  return d.isValid() ? d.format('MM/DD/YYYY hh:mm:ss A') : v
}

const DRILL_COLUMNS: DrillColumn[] = [
  { key: 'FirstName', label: 'First Name' },
  { key: 'LastName', label: 'Last Name' },
  { key: 'Amount', label: 'Amount', right: true },
  { key: 'PaymentType', label: 'Payment Type' },
  { key: 'Headliner', label: 'Headliner' },
  { key: 'ShowTym', label: 'Show Time' },
  { key: 'ShowDt', label: 'Show Date', format: 'date' }
]

type Props = {
  rawData: unknown
  subtitle: string
  generatedAt: string
  drillContext?: ReportDrillContext
}

export function AuditReportView({
  rawData,
  subtitle,
  generatedAt,
  drillContext
}: Props) {
  const rows = Array.isArray(rawData) ? (rawData as AuditRow[]) : []
  const [selectedRow, setSelectedRow] = useState<AuditRow | null>(null)

  if (!rows.length) {
    return <ReportEmpty />
  }

  return (
    <ReportViewShell>
      <ReportHeader
        title='Audit Report'
        subtitle={subtitle}
        generatedAt={generatedAt}
      />

      <ReportCard>
        <ReportTableScroll>
          <ReportTable>
            <thead>
              <tr>
                <th className='border border-border bg-muted/50 px-3 py-2 text-left text-[11px] font-semibold tracking-wide text-muted-foreground'>
                  Comic Last Name
                </th>
                <th className='border border-border bg-muted/50 px-3 py-2 text-left text-[11px] font-semibold tracking-wide text-muted-foreground'>
                  Created Date
                </th>
                <th className='border border-border bg-muted/50 px-3 py-2 text-left text-[11px] font-semibold tracking-wide text-muted-foreground'>
                  Adjusted Date
                </th>
                <th className='border border-border bg-muted/50 px-3 py-2 text-left text-[11px] font-semibold tracking-wide text-muted-foreground'>
                  Type
                </th>
                <th className='border border-border bg-muted/50 px-3 py-2 text-left text-[11px] font-semibold tracking-wide text-muted-foreground'>
                  Changed By
                </th>
                <th className='border border-border bg-muted/50 px-3 py-2 text-left text-[11px] font-semibold tracking-wide text-muted-foreground'>
                  Created By
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const type =
                  row.IsComp === true ||
                    row.IsComp === 1 ||
                    row.IsComp === 'true'
                    ? 'Comp'
                    : 'Move Reservation'
                const canDrill = Boolean(drillContext)
                return (
                  <tr
                    key={i}
                    className={cn(
                      i % 2 === 0 ? 'bg-background' : 'bg-muted/20',
                      canDrill && 'cursor-pointer hover:bg-muted/40'
                    )}
                    onDoubleClick={() => {
                      if (canDrill) {
                        setSelectedRow(row)
                      }
                    }}
                  >
                    <td className='border border-border px-3 py-2 text-xs'>
                      {row.ComicName ?? '—'}
                    </td>
                    <td className='border border-border px-3 py-2 text-xs'>
                      {fmtDt(row.CreateDt)}
                    </td>
                    <td className='border border-border px-3 py-2 text-xs'>
                      {fmtDt(row.AdjustedDt)}
                    </td>
                    <td
                      className={cn(
                        'border border-border px-3 py-2 text-xs text-blue-600'
                      )}
                    >
                      {type}
                    </td>
                    <td className='border border-border px-3 py-2 text-xs'>
                      {row.MovedBy ?? '—'}
                    </td>
                    <td className='border border-border px-3 py-2 text-xs'>
                      {row.CreatedBy ?? '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </ReportTable>
        </ReportTableScroll>
      </ReportCard>

      <ReportRecordCount count={rows.length} />

      {selectedRow && drillContext && (
        <ReportDrillDialog
          title='Audit Drill Down Report:'
          endpoint='GetAduitReportDrillDown'
          body={{
            Connection: drillContext.connectionName,
            StartDate: dayjs(drillContext.startDate).format('MM/DD/YYYY'),
            EndDate: dayjs(drillContext.endDate).format('MM/DD/YYYY'),
            LocaltionId: drillContext.locationId,
            ReservationId: selectedRow.ReservationID || (selectedRow as any).ReservationId,
            Type:
              selectedRow.IsComp === true ||
              selectedRow.IsComp === 1 ||
              selectedRow.IsComp === 'true'
                ? 'Comp'
                : 'Move Reservation'
          }}
          columns={DRILL_COLUMNS}
          footerTotals
          onClose={() => setSelectedRow(null)}
        />
      )}
    </ReportViewShell>
  )
}
