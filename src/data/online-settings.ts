import type { OnlineSetting } from "@/types/online-setting"

export const onlineSettings: OnlineSetting[] = [
  {
    id: "1",
    settingsName: "bannermessage",
    defaultValue: "Welcome to Standup Media",
  },
  {
    id: "2",
    settingsName: "clubphone",
    defaultValue: "Standupmedia",
  },
  {
    id: "3",
    settingsName: "clubphoneext",
    defaultValue: "400",
  },
  {
    id: "4",
    settingsName: "dashboardurl",
    defaultValue: "http://dashboard.standup-media.com",
  },
  {
    id: "5",
    settingsName: "googlemap",
    defaultValue:
      "https://maps.google.com/maps?q=Standup+Media&output=embed",
  },
  {
    id: "6",
    settingsName: "groupeventsfile",
    defaultValue:
      '<span><a href="/files/group-events.pdf"><img src="/images/group-events.png" alt="Group Events" /></a></span>',
  },
]
