import { MoreVertical } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { AdminUser } from "@/types/user-admin"

type AdminUserRowActionsMenuProps = {
  user: AdminUser
  onEdit: (user: AdminUser) => void
}

export function AdminUserRowActionsMenu({
  user,
  onEdit,
}: AdminUserRowActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="User actions"
        >
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[8rem]">
        <DropdownMenuItem onClick={() => onEdit(user)}>Edit</DropdownMenuItem>
        <DropdownMenuItem>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
