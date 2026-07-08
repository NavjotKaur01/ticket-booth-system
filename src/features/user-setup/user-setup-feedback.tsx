import { AlertCircle, CheckCircle2 } from "lucide-react"

import { cn } from "@/lib/utils"

type UserSetupFeedbackProps = {
  message: string
  variant?: "success" | "error"
  className?: string
}

export function UserSetupFeedback({
  message,
  variant = "success",
  className,
}: UserSetupFeedbackProps) {
  const isSuccess = variant === "success"

  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-2 border-t px-4 py-3 text-sm",
        isSuccess
          ? "border-emerald-200/80 bg-emerald-50/80 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-100"
          : "border-destructive/20 bg-destructive/5 text-destructive",
        className
      )}
    >
      {isSuccess ? (
        <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
      ) : (
        <AlertCircle className="mt-0.5 size-4 shrink-0" />
      )}
      <span>{message}</span>
    </div>
  )
}
