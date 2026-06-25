import { Calendar } from "lucide-react"
import { useRef } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function formatShowDate(dateValue: string) {
  const date = new Date(`${dateValue}T00:00:00`)
  if (Number.isNaN(date.getTime())) {
    return dateValue
  }
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

type ShowDateFieldProps = {
  showDate: string
  onShowDateChange: (value: string) => void
  className?: string
}

/** Formatted show date with calendar button that opens the native date picker. */
export function ShowDateField({
  showDate,
  onShowDateChange,
  className,
}: ShowDateFieldProps) {
  const dateInputRef = useRef<HTMLInputElement>(null)

  function openDatePicker() {
    const input = dateInputRef.current
    if (!input) return

    if (typeof input.showPicker === "function") {
      try {
        input.showPicker()
        return
      } catch {
        // Fall through to click() if showPicker is blocked.
      }
    }

    input.click()
  }

  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      <span className="text-sm leading-none text-foreground">
        {formatShowDate(showDate)}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="size-7 shrink-0 text-muted-foreground hover:text-foreground"
        aria-label="Change show date"
        onClick={openDatePicker}
      >
        <Calendar className="size-4" />
      </Button>
      <input
        ref={dateInputRef}
        type="date"
        value={showDate}
        onChange={(event) => onShowDateChange(event.target.value)}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
      />
    </div>
  )
}
