declare module "react-big-calendar/lib/Month" {
  import type React from "react"
  import type { DateLocalizer, ViewStatic } from "react-big-calendar"

  const MonthView: React.ComponentType<any> &
    ViewStatic & {
      range?: (
        date: Date,
        options: { localizer: DateLocalizer }
      ) => { start: Date; end: Date }
    }

  export default MonthView
}

declare module "react-big-calendar/lib/TimeGrid" {
  import type React from "react"

  const TimeGrid: React.ComponentType<any>

  export default TimeGrid
}
