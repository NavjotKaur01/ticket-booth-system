import type { SystemDefault } from "@/types/system-default"

/** Legacy mock rows — Administrator page loads from LoadSystemDefaults. */
export const systemDefaults: SystemDefault[] = [
  {
    id: "1",
    screen: "Calendar",
    field: "grdSchedule",
    description: "Display today at top?",
    defaultValue: "Y",
    type: "YesNo",
    lookupType: "",
    lastUpdateId: "jeff6141",
    lastUpdateDt: "8/14/2025 10:22:15 AM",
  },
]

export const systemDefaultScreenOptions = [
  ...new Set(systemDefaults.map((item) => item.screen)),
]
