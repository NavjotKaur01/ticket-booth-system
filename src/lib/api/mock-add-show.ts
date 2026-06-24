import type { AddShowDialogData } from "@/types/calendar-show"

const mockAddShowDialogData: AddShowDialogData = {
  sectionRows: [],
  sectionLookups: [],
  performers: [
    { id: "bandit", name: "The Bandit" },
    { id: "funnie-comic", name: "Funnieest Comic in Little Rock" },
    { id: "office-trivia", name: "The Office trivia night" },
    { id: "amateur-comedy", name: "Amateur Comedy Competition" },
    { id: "ambrose", name: "Ambrose" },
    { id: "bb", name: "B.B" },
    { id: "bt", name: "BT" },
    { id: "buds-suds", name: "Buds and Suds Comedy Show!" },
    { id: "dante", name: "Dante" },
    { id: "jersey", name: "Jersey" },
    { id: "joe-fox", name: "Joe Fox" },
    { id: "kim", name: "Kim" },
    { id: "laugh-new-year", name: "Laugh in the New Year !!!" },
  ],
  ageRestrictions: [
    { value: "A", label: "A - All ages", description: "All ages" },
    { value: "Y", label: "Y - Over 21", description: "Over 21" },
    { value: "N", label: "N - Over 18", description: "Over 18" },
    { value: "S", label: "S - Special case", description: "Special case set min age" },
  ],
  showTimes: [
    {
      id: "tuesday-945",
      dayLabel: "Tuesday",
      timeRange: "9:45 PM - 10:00 PM",
      enabled: true,
      sections: [
        {
          id: "tuesday-945-back",
          section: "Back",
          price: 10,
          seats: 150,
          restrictShowPromo: false,
          web: true,
          walkupFee: null,
          phoneFee: null,
          webFee: null,
        },
        {
          id: "tuesday-945-front",
          section: "Front",
          price: 20,
          seats: 200,
          restrictShowPromo: false,
          web: true,
          walkupFee: null,
          phoneFee: null,
          webFee: null,
        },

      ],
    },
    {
      id: "tuesday-645",
      dayLabel: "Tuesday",
      timeRange: "6:45 PM - 7:00 PM",
      enabled: true,
      sections: [
        {
          id: "tuesday-945-balcony",
          section: "Balcony",
          price: 11,
          seats: 123,
          restrictShowPromo: false,
          web: true,
          walkupFee: null,
          phoneFee: null,
          webFee: null,
        },
        {
          id: "tuesday-645-back",
          section: "Back",
          price: 11,
          seats: 212,
          restrictShowPromo: false,
          web: true,
          walkupFee: 0,
          phoneFee: 0,
          webFee: 0,
        },

      ],
    },
  ],
}

export async function getAddShowDialogData(): Promise<AddShowDialogData> {
  // Temporary API seam: replace this Promise with the real Add Show endpoint later.
  await new Promise((resolve) => window.setTimeout(resolve, 200))
  return mockAddShowDialogData
}
