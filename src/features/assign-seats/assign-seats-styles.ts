import { cn } from "@/lib/utils"
import type { AssignSeatColorFlag } from "@/features/assign-seats/assign-seats.types"

/** Desktop AssignSeatColorConverter cell backgrounds. */
export function cellColorClass(
  color: AssignSeatColorFlag,
  filled: boolean,
  isHold = false
) {
  if (isHold) {
    return "bg-[#c0c0c0] text-black"
  }
  if (!filled) {
    return "bg-white text-black hover:bg-[#cccccc]"
  }

  switch (color) {
    case "dinner":
      return "bg-orange-400 text-black"
    case "web":
      return "bg-red-500 text-white"
    case "promo":
      return "bg-blue-500 text-white"
    default:
      return "bg-[#f1f1f1] text-black"
  }
}

export const ASSIGN_SEATS_BLUE = "#155abb"
export const ASSIGN_SEATS_GRID = "#dbdbdb"
export const ASSIGN_SEATS_HEADER = "#eeeeee"
