import type { ColumnDef } from "@tanstack/react-table"

import type { StandardRowAction } from "@/components/common/standard-row-actions-menu"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { dataTableActionsColumn } from "@/components/data-table/data-table-actions-column"
import type { ClubReservationSetting } from "@/types/club-reservation-setting"

type GetClubReservationSettingColumnsParams = {
  onEdit: (record: ClubReservationSetting) => void
  onDelete: (record: ClubReservationSetting) => void
}

export function getClubReservationSettingColumns({
  onEdit,
  onDelete,
}: GetClubReservationSettingColumnsParams): ColumnDef<ClubReservationSetting>[] {
  return [
    {
      accessorKey: "newReservation",
      header: ({ column }) => (
        <DataTableColumnHeader label="New Reservation" column={column} />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">{row.original.newReservation}</span>
      ),
    },
    dataTableActionsColumn<ClubReservationSetting>({
      ariaLabel: "Club reservation setting actions",
      hiddenActions: ["Add"] satisfies readonly StandardRowAction[],
      onAction: (record, action) => {
        if (action === "Edit") {
          onEdit(record)
          return
        }
        if (action === "Delete") {
          onDelete(record)
        }
      },
    }),
  ]
}
