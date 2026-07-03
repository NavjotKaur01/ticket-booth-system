import { MoreVertical } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const STANDARD_ROW_ACTIONS = ["Add", "Edit", "Delete"] as const
export type StandardRowAction = "Add" | "Edit" | "Delete"

type StandardRowActionsMenuProps = {
  ariaLabel?: string
  hiddenActions?: readonly StandardRowAction[]
  onAction?: (action: StandardRowAction) => void
}

/** Standard three-dot row menu used across admin and main page tables. */
export function StandardRowActionsMenu({
  ariaLabel = "Row actions",
  hiddenActions = [],
  onAction,
}: StandardRowActionsMenuProps) {
  const visibleActions = STANDARD_ROW_ACTIONS.filter(
    (action) => !hiddenActions.includes(action)
  )

  if (visibleActions.length === 0) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label={ariaLabel}
        >
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[8rem]">
        {visibleActions.map((action) => (
          <DropdownMenuItem key={action} onSelect={() => onAction?.(action)}>
            {action}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
