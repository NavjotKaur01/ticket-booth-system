import { Checkbox } from "@/components/ui/checkbox"
import type { SystemRole } from "@/types/system-role"
import { cn } from "@/lib/utils"

type RolesManagementListProps = {
  roles: SystemRole[]
  selectedRoleIds: string[]
  onToggleRole: (roleId: string, checked: boolean) => void
  className?: string
}

export function RolesManagementList({
  roles,
  selectedRoleIds,
  onToggleRole,
  className,
}: RolesManagementListProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-xs text-muted-foreground">
        {selectedRoleIds.length} of {roles.length} roles selected
      </p>

      <div className="calendar-thin-scrollbar max-h-96 overflow-y-auto rounded-md border border-border p-2">
        <div className="grid gap-1 sm:grid-cols-2">
          {roles.map((role) => {
            const checked = selectedRoleIds.includes(role.id)
            const inputId = `system-role-${role.id}`

            return (
              <label
                key={role.id}
                htmlFor={inputId}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                  checked ? "bg-primary/10 text-primary" : "hover:bg-muted/50"
                )}
              >
                <Checkbox
                  id={inputId}
                  checked={checked}
                  onCheckedChange={(value) => onToggleRole(role.id, value === true)}
                />
                {role.name}
              </label>
            )
          })}
        </div>
      </div>
    </div>
  )
}
