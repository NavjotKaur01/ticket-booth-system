import { MoreVertical } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Customer } from "@/types/customer"

type CustomerRowActionsMenuProps = {
  customer: Customer
  onEdit?: (customer: Customer) => void
  onDelete?: (customer: Customer) => void
}

export function CustomerRowActionsMenu({
  customer,
  onEdit,
  onDelete,
}: CustomerRowActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Customer actions"
          onClick={(event) => event.stopPropagation()}
        >
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[8rem]">
        <DropdownMenuItem onSelect={() => onEdit?.(customer)}>Edit</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onDelete?.(customer)}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
