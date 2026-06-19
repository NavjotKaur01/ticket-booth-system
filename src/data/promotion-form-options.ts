export const ccRequiredOptions = [
  {
    id: "cc-required",
    label: "Credit Card Required to hold reservation",
  },
  {
    id: "cc-not-required",
    label: "Credit Card Not Required",
  },
] as const

export const discountOptions = [
  { id: "select", label: "Discount options" },
  { id: "percent-10", label: "10% Off" },
  { id: "percent-20", label: "20% Off" },
  { id: "fixed-5", label: "$5 Off" },
  { id: "bogo", label: "Buy One Get One" },
  { id: "comp", label: "Complimentary" },
] as const

export const weekDayOptions = [
  { id: "sun", label: "Sun" },
  { id: "mon", label: "Mon" },
  { id: "tue", label: "Tue" },
  { id: "wed", label: "Wed" },
  { id: "thu", label: "Thu" },
  { id: "fri", label: "Fri" },
  { id: "sat", label: "Sat" },
] as const
