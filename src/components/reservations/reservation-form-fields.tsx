import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

/** Groups related form controls under a section heading. */
export function FormSection({
  title,
  children,
  className,
}: {
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn("space-y-3", className)}>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </section>
  )
}

/** Standard label + control wrapper used across the reservation form. */
export function FormField({
  label,
  children,
  className,
  htmlFor,
}: {
  label: string
  children: ReactNode
  className?: string
  htmlFor?: string
}) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium">
        {label}
      </Label>
      {children}
    </div>
  )
}

/** Displays calculated amounts — visually distinct from editable inputs. */
export function ReadOnlyValue({ value }: { value: string }) {
  return (
    <div className="flex h-9 items-center rounded-md bg-muted/50 px-2.5 text-sm font-medium tabular-nums text-foreground">
      {value}
    </div>
  )
}

/** Icon-only action with tooltip for compact toolbars. */
export function IconActionButton({
  label,
  icon: Icon,
  variant = "outline",
}: {
  label: string
  icon: LucideIcon
  variant?: "outline" | "default" | "secondary" | "ghost"
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant={variant}
          size="icon-sm"
          aria-label={label}
        >
          <Icon className="size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  )
}
