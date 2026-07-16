import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type PaymentNumberFieldsetProps = {
  label: string
  selected: number | null
  onSelect: (value: number) => void
  /** Desktop Cash/swipe CC = 15; POS CC = 10. */
  maxNumber?: number
  disabled?: boolean
  className?: string
}

/** Number pad for Express Cash / Credit Card party size. */
export function PaymentNumberFieldset({
  label,
  selected,
  onSelect,
  maxNumber = 15,
  disabled = false,
  className,
}: PaymentNumberFieldsetProps) {
  const numbers = Array.from({ length: maxNumber }, (_, index) => index + 1)

  return (
    <div className={cn("min-w-0 flex-1", className)}>
      <p className="mb-1.5 text-sm font-medium text-foreground">{label}</p>
      <div className="grid w-full grid-cols-5 gap-1.5 sm:gap-2">
        {numbers.map((num) => (
          <Button
            key={num}
            type="button"
            variant={selected === num ? "default" : "outline"}
            className="aspect-square w-full max-w-11 rounded-sm p-0 text-sm font-semibold tabular-nums"
            disabled={disabled}
            onClick={() => onSelect(num)}
          >
            {num}
          </Button>
        ))}
      </div>
    </div>
  )
}
