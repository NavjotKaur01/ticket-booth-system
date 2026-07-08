import { useMemo } from "react"

import { DataTable } from "@/components/data-table/data-table"
import { getClubReservationSettingColumns } from "@/features/club-reservation-settings/club-reservation-setting-columns"
import type { ClubReservationSetting } from "@/types/club-reservation-setting"

type ClubReservationSettingDataTableProps = {
  data: ClubReservationSetting[]
  onEdit: (record: ClubReservationSetting) => void
}

export function ClubReservationSettingDataTable({
  data,
  onEdit,
}: ClubReservationSettingDataTableProps) {
  const columns = useMemo(() => getClubReservationSettingColumns({ onEdit }), [onEdit])

  return (
    <DataTable
      columns={columns}
      data={data}
      emptyMessage="No record found"
      entityLabel="records"
      pageSize={10}
      enablePagination={false}
    />
  )
}
