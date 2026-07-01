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

function fmtDt (v: string | undefined): string {
  if (!v) return '—'
  const d = dayjs(v)
  return d.isValid() ? d.format('MM/DD/YYYY HH:mm') : v
}

const DRILL_COLUMNS: DrillColumn[] = [
  { key: 'ShowDate', label: 'Show Date' },
  { key: 'ShowTym', label: 'Show Time' },
  { key: 'Headliner', label: 'Headliner' },
  { key: 'FirstName', label: 'First Name' },
  { key: 'LastName', label: 'Last Name' },
  { key: 'Amount', label: 'Amount', right: true },
  { key: 'PaymentType', label: 'Payment Type' }
]

type Props = {
  rawData: unknown
  subtitle: string
  generatedAt: string
  drillContext?: ReportDrillContext
}

export function AuditReportView ({
  rawData,
  subtitle,
  generatedAt,
  drillContext
}: Props) {
  const rows = Array.isArray(rawData) ? (rawData as AuditRow[]) : []
  const [selectedId, setSelectedId] = useState<string | null>(null)

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
                  Create Date
                </th>
                <th className='border border-border bg-muted/50 px-3 py-2 text-left text-[11px] font-semibold tracking-wide text-muted-foreground'>
                  Adjusted Date
                </th>
                <th className='border border-border bg-muted/50 px-3 py-2 text-left text-[11px] font-semibold tracking-wide text-muted-foreground'>
                  Moved By
                </th>
                <th className='border border-border bg-muted/50 px-3 py-2 text-left text-[11px] font-semibold tracking-wide text-muted-foreground'>
                  Created By
                </th>
                <th className='border border-border bg-muted/50 px-3 py-2 text-left text-[11px] font-semibold tracking-wide text-muted-foreground'>
                  Comic
                </th>
                <th className='border border-border bg-muted/50 px-3 py-2 text-left text-[11px] font-semibold tracking-wide text-muted-foreground'>
                  Type
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
                const canDrill = Boolean(drillContext && row.ReservationID)
                return (
                  <tr
                    key={i}
                    className={cn(
                      i % 2 === 0 ? 'bg-background' : 'bg-muted/20',
                      canDrill && 'cursor-pointer hover:bg-muted/40'
                    )}
                    onDoubleClick={() => {
                      if (canDrill) {
                        setSelectedId(row.ReservationID!)
                      }
                    }}
                  >
                    <td className='border border-border px-3 py-2 text-xs'>
                      {fmtDt(row.CreateDt)}
                    </td>
                    <td className='border border-border px-3 py-2 text-xs'>
                      {fmtDt(row.AdjustedDt)}
                    </td>
                    <td className='border border-border px-3 py-2 text-xs'>
                      {row.MovedBy ?? '—'}
                    </td>
                    <td className='border border-border px-3 py-2 text-xs'>
                      {row.CreatedBy ?? '—'}
                    </td>
                    <td className='border border-border px-3 py-2 text-xs'>
                      {row.ComicName ?? '—'}
                    </td>
                    <td
                      className={cn(
                        'border border-border px-3 py-2 text-xs',
                        type === 'Comp' && 'text-blue-600'
                      )}
                    >
                      {type}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </ReportTable>
        </ReportTableScroll>
      </ReportCard>

      <ReportRecordCount count={rows.length} />

      {selectedId && drillContext && (
        <ReportDrillDialog
          title='Audit Drill Down'
          endpoint='GetAduitReportDrillDown'
          body={{
            Connection: drillContext.connectionName,
            StartDate: dayjs(drillContext.startDate).format('MM/DD/YYYY'),
            EndDate: dayjs(drillContext.endDate).format('MM/DD/YYYY'),
            LocaltionId: drillContext.locationId,
            ShowId: selectedId
          }}
          columns={DRILL_COLUMNS}
          onClose={() => setSelectedId(null)}
        />
      )}
    </ReportViewShell>
  )
}
