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

/** Shared compact layout for page filter toolbars. */
export const FILTER_ROW_CLASS =
  "flex flex-col gap-3 p-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-2"

/** Same as FILTER_ROW_CLASS without outer padding (nested inside padded panels). */
export const FILTER_ROW_INNER_CLASS =
  "flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-2"

export const FILTER_INPUT_CLASS = "h-9 w-full sm:w-44"
export const FILTER_EMAIL_CLASS = "h-9 w-full sm:w-48"
export const FILTER_PHONE_CLASS = "h-9 w-full sm:w-32"
export const FILTER_AREA_CLASS = "h-9 w-full sm:w-28"
export const FILTER_SELECT_CLASS = "h-9 w-full sm:w-44"
export const FILTER_SELECT_WIDE_CLASS = "h-9 w-full sm:w-48"

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
    <section className={cn("space-y-2", className)}>
      <h3 className="text-xs font-semibold text-foreground">{title}</h3>
      {children}
    </section>
  )
}

/** Standard label + control wrapper for dialog and page forms. */
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
      <Label htmlFor={htmlFor} className="mb-1 block text-xs font-medium">
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
  onClick,
}: {
  label: string
  icon: LucideIcon
  variant?: "outline" | "default" | "secondary" | "ghost"
  onClick?: () => void
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant={variant}
          size="icon-sm"
          aria-label={label}
          onClick={onClick}
        >
          <Icon className="size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  )
}
