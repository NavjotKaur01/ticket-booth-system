import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const PAYMENT_NUMBERS = Array.from(
  { length: 15 },
  (_, index) => index + 1
)

type PaymentNumberFieldsetProps = {
  label: string
  selected: number | null
  onSelect: (value: number) => void
  className?: string
}

/** 1–15 square number grid — matches the desktop booth app. */
export function PaymentNumberFieldset({
  label,
  selected,
  onSelect,
  className,
}: PaymentNumberFieldsetProps) {
  return (
    <div className={cn("min-w-0 flex-1", className)}>
      <p className="mb-1.5 text-sm font-medium text-foreground">{label}</p>
      <div className="grid w-full grid-cols-5 gap-1.5 sm:gap-2">
        {PAYMENT_NUMBERS.map((num) => (
          <Button
            key={num}
            type="button"
            variant={selected === num ? "default" : "outline"}
            className="aspect-square w-full max-w-11 rounded-sm p-0 text-sm font-semibold tabular-nums"
            onClick={() => onSelect(num)}
          >
            {num}
          </Button>
        ))}
      </div>
    </div>
  )
}
