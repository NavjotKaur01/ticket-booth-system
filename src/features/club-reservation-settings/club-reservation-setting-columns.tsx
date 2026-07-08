import type { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Button } from "@/components/ui/button"
import type { ClubReservationSetting } from "@/types/club-reservation-setting"

type GetClubReservationSettingColumnsParams = {
  onEdit: (record: ClubReservationSetting) => void
}

export function getClubReservationSettingColumns({
  onEdit,
}: GetClubReservationSettingColumnsParams): ColumnDef<ClubReservationSetting>[] {
  return [
    {
      id: "edit",
      header: "#",
      enableSorting: false,
      cell: ({ row }) => (
        <Button
          type="button"
          variant="link"
          className="h-auto p-0 text-xs"
          onClick={() => onEdit(row.original)}
        >
          Edit
        </Button>
      ),
    },
    {
      accessorKey: "newReservation",
      header: ({ column }) => (
        <DataTableColumnHeader label="New Reservation" column={column} />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">{row.original.newReservation}</span>
      ),
    },
  ]
}
