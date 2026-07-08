import { Checkbox } from "@/components/ui/checkbox"
import { USER_SETUP_ROLES, type UserSetupRole } from "@/data/user-setup"
import { cn } from "@/lib/utils"

type UserRoleChecklistProps = {
  selectedRoles: UserSetupRole[]
  onToggleRole: (role: UserSetupRole, checked: boolean) => void
  className?: string
  disabled?: boolean
}

export function UserRoleChecklist({
  selectedRoles,
  onToggleRole,
  className,
  disabled = false,
}: UserRoleChecklistProps) {
  return (
    <div className={cn("space-y-2", className, disabled && "opacity-50")}>
      <p className="text-xs text-muted-foreground">
        {selectedRoles.length} of {USER_SETUP_ROLES.length} roles selected
      </p>

      <div
        className={cn(
          "calendar-thin-scrollbar max-h-80 overflow-y-auto rounded-md border border-border p-2",
          disabled && "pointer-events-none"
        )}
      >
        <div className="grid gap-1 sm:grid-cols-2">
          {USER_SETUP_ROLES.map((role) => {
            const checked = selectedRoles.includes(role)
            const inputId = `role-${role}`

            return (
              <label
                key={role}
                htmlFor={inputId}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                  checked ? "bg-primary/10 text-primary" : "hover:bg-muted/50"
                )}
              >
                <Checkbox
                  id={inputId}
                  checked={checked}
                  onCheckedChange={(value) => onToggleRole(role, value === true)}
                />
                {role}
              </label>
            )
          })}
        </div>
      </div>
    </div>
  )
}
