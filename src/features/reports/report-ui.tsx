import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/** Shared layout + table primitives for all report views. */

export const REPORT_SHELL_CLASS = "space-y-3 p-4"
export const REPORT_CARD_CLASS =
  "overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm"

export const REPORT_DRILL_DIALOG_CLASS =
  "flex max-h-[85vh] w-[calc(100%-2rem)] max-w-[calc(100%-2rem)] flex-col overflow-hidden p-0 sm:max-w-6xl"
export const REPORT_DRILL_HEADER_CLASS = "shrink-0 border-b px-5 py-4"
export const REPORT_DRILL_BODY_CLASS = "min-h-0 flex-1 overflow-auto px-5 py-4"
export const REPORT_DRILL_FOOTER_CLASS =
  "shrink-0 border-t px-5 py-3 text-right text-xs text-muted-foreground"

export function reportRowClass(index: number, className?: string) {
  return cn(index % 2 === 0 ? "bg-background" : "bg-muted/20", className)
}

export function ReportViewShell({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn(REPORT_SHELL_CLASS, className)}>{children}</div>
}

export function ReportHeader({
  title,
  subtitle,
  generatedAt,
}: {
  title: string
  subtitle: string
  generatedAt: string
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-2 rounded-xl border border-border/70 bg-muted/10 px-4 py-3">
      <div>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <p className="text-xs text-muted-foreground">Generated {generatedAt}</p>
    </div>
  )
}

export function ReportCard({
  children,
  className,
  padded,
}: {
  children: ReactNode
  className?: string
  padded?: boolean
}) {
  return (
    <div className={cn(REPORT_CARD_CLASS, padded && "p-4", className)}>
      {children}
    </div>
  )
}

export function ReportTableScroll({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cn("overflow-x-auto", className)}>{children}</div>
}

export function ReportTable({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <table className={cn("w-full border-collapse text-xs", className)}>{children}</table>
}

export function ReportSectionBar({ children }: { children: ReactNode }) {
  return (
    <div className="border-b border-border/70 bg-muted/60 px-3 py-1.5 text-xs font-semibold text-foreground">
      {children}
    </div>
  )
}

export function ReportUserBar({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-md border border-cyan-300 bg-cyan-100 px-3 py-1.5 text-xs font-semibold text-cyan-800 dark:border-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-200">
      {children}
    </div>
  )
}

export function ReportShowHeader({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 border-b border-border/70 bg-muted/20 px-4 py-2.5",
        className
      )}
    >
      {children}
    </div>
  )
}

export function ReportCenteredHeading({ children }: { children: ReactNode }) {
  return <p className="text-center text-sm font-semibold text-foreground">{children}</p>
}

export function ReportEmpty({ message = "No records found" }: { message?: string }) {
  return (
    <div className="flex min-h-64 items-center justify-center p-4 text-sm text-muted-foreground">
      {message}
    </div>
  )
}

export function ReportRecordCount({ count }: { count: number }) {
  return (
    <p className="text-right text-xs text-muted-foreground">
      {count} record{count !== 1 ? "s" : ""}
    </p>
  )
}

type CellAlign = { right?: boolean; center?: boolean }

export function ReportTh({
  children,
  right,
  center,
  className,
  colSpan,
  rowSpan,
}: {
  children?: ReactNode
  className?: string
  colSpan?: number
  rowSpan?: number
} & CellAlign) {
  return (
    <th
      colSpan={colSpan}
      rowSpan={rowSpan}
      className={cn(
        "border border-border bg-muted/50 px-3 py-2 font-semibold tracking-wide whitespace-nowrap",
        right ? "text-right" : center ? "text-center" : "text-left",
        className
      )}
    >
      {children}
    </th>
  )
}

export function ReportTd({
  children,
  right,
  center,
  bold,
  blue,
  red,
  className,
  colSpan,
  rowSpan,
}: {
  children?: ReactNode
  className?: string
  colSpan?: number
  rowSpan?: number
  bold?: boolean
  blue?: boolean
  red?: boolean
} & CellAlign) {
  return (
    <td
      colSpan={colSpan}
      rowSpan={rowSpan}
      className={cn(
        "border border-border px-3 py-2 text-xs whitespace-nowrap",
        right ? "text-right tabular-nums" : center ? "text-center" : "text-left",
        bold && "font-semibold",
        blue && "font-medium text-blue-600",
        red && "text-red-600",
        className
      )}
    >
      {children}
    </td>
  )
}
