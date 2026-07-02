import type { LucideIcon } from "lucide-react"
import type { FormEvent, KeyboardEvent, ReactNode } from "react"

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

export function createFilterSearchHandlers(onSearch: () => void) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSearch()
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault()
      onSearch()
    }
  }

  return { handleSubmit, handleInputKeyDown }
}

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
  labelPlacement = "above",
}: {
  label: string
  children: ReactNode
  className?: string
  htmlFor?: string
  labelPlacement?: "above" | "below"
}) {
  const labelEl = (
    <Label
      htmlFor={htmlFor}
      className={cn(
        "block text-xs font-medium",
        labelPlacement === "above" ? "mb-1" : "mt-1"
      )}
    >
      {label}
    </Label>
  )

  return (
    <div className={className}>
      {labelPlacement === "above" ? (
        <>
          {labelEl}
          {children}
        </>
      ) : (
        <>
          {children}
          {labelEl}
        </>
      )}
    </div>
  )
}

/** Displays calculated amounts — visually distinct from editable inputs. */
export function ReadOnlyValue({
  value,
  className,
}: {
  value: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex h-9 items-center rounded-md bg-muted/50 px-2.5 text-sm font-medium tabular-nums text-foreground",
        className
      )}
    >
      {value}
    </div>
  )
}

/** Compact pill for price summaries (subtotal, tax, total, etc.). */
export function AmountPill({
  label,
  value,
  emphasized = false,
  title,
}: {
  label: string
  value: string
  emphasized?: boolean
  title?: string
}) {
  return (
    <div
      title={title}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] tabular-nums",
        emphasized
          ? "border-primary/30 bg-primary/5"
          : "border-border/60 bg-muted/30"
      )}
    >
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          "font-semibold text-foreground",
          emphasized && "text-primary"
        )}
      >
        {value}
      </span>
    </div>
  )
}

/** Icon-only action with tooltip for compact toolbars. */
export function IconActionButton({
  label,
  icon: Icon,
  variant = "outline",
  type = "button",
  tabIndex,
  onClick,
}: {
  label: string
  icon: LucideIcon
  variant?: "outline" | "default" | "secondary" | "ghost"
  type?: "button" | "submit"
  tabIndex?: number
  onClick?: () => void
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type={type}
          variant={variant}
          size="icon-sm"
          aria-label={label}
          tabIndex={tabIndex}
          onClick={onClick}
        >
          <Icon className="size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  )
}
