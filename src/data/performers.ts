import type { Performer } from "@/types/performer"

function seedPerformer(
  partial: Pick<Performer, "id" | "firstName" | "lastName" | "stageName" | "active" | "hidden">
): Performer {
  return {
    ...partial,
    comicName: partial.stageName || [partial.lastName, partial.firstName].filter(Boolean).join(", "),
    locationId: "standupmedia",
    globalBio: "",
    localBio: "",
    isGlobalPic: false,
    isLocalPic: false,
  }
}

export const performerLocations = [
  { id: "standupmedia", label: "Standupmedia" },
] as const

export const performers: Performer[] = [
  seedPerformer({ id: "1", firstName: "", lastName: "", stageName: "The Bandit", active: true, hidden: false }),
  seedPerformer({ id: "2", firstName: "", lastName: "", stageName: "'the Office' trivia night", active: true, hidden: false }),
  seedPerformer({ id: "3", firstName: "", lastName: "", stageName: "2022 WFPC Finals", active: true, hidden: false }),
  seedPerformer({ id: "4", firstName: "", lastName: "", stageName: "3 FEATURES WEEK", active: true, hidden: false }),
  seedPerformer({ id: "5", firstName: "", lastName: "", stageName: "A Comedy Show", active: true, hidden: false }),
  seedPerformer({ id: "6", firstName: "", lastName: "", stageName: "After Dark", active: true, hidden: false }),
  seedPerformer({ id: "7", firstName: "", lastName: "", stageName: "Amateur Night", active: true, hidden: false }),
  seedPerformer({ id: "8", firstName: "", lastName: "", stageName: "Best of Boston", active: true, hidden: false }),
  seedPerformer({ id: "9", firstName: "", lastName: "", stageName: "Big Laughs Friday", active: true, hidden: false }),
  seedPerformer({ id: "10", firstName: "", lastName: "", stageName: "Boston Comedy All-Stars", active: true, hidden: false }),
  seedPerformer({ id: "11", firstName: "", lastName: "", stageName: "Comedy Central Presents", active: true, hidden: false }),
  seedPerformer({ id: "12", firstName: "", lastName: "", stageName: "Comedy Showcase", active: true, hidden: false }),
  seedPerformer({ id: "13", firstName: "", lastName: "", stageName: "Date Night Comedy", active: true, hidden: false }),
  seedPerformer({ id: "14", firstName: "", lastName: "", stageName: "Early Bird Special", active: true, hidden: false }),
  seedPerformer({ id: "15", firstName: "", lastName: "", stageName: "Feature Friday", active: true, hidden: false }),
  seedPerformer({ id: "16", firstName: "", lastName: "", stageName: "Friday Night Live", active: true, hidden: false }),
  seedPerformer({ id: "17", firstName: "", lastName: "", stageName: "Girls Night Out", active: true, hidden: false }),
  seedPerformer({ id: "18", firstName: "", lastName: "", stageName: "Headliner Series", active: true, hidden: false }),
  seedPerformer({ id: "19", firstName: "", lastName: "", stageName: "Late Night Laughs", active: true, hidden: false }),
  seedPerformer({ id: "20", firstName: "", lastName: "", stageName: "Midweek Madness", active: true, hidden: false }),
  seedPerformer({ id: "21", firstName: "", lastName: "", stageName: "New Talent Tuesday", active: true, hidden: false }),
  seedPerformer({ id: "22", firstName: "", lastName: "", stageName: "Open Mic Night", active: true, hidden: false }),
  seedPerformer({ id: "23", firstName: "", lastName: "", stageName: "Roast Battle", active: true, hidden: false }),
  seedPerformer({ id: "24", firstName: "", lastName: "", stageName: "Saturday Showcase", active: true, hidden: false }),
  seedPerformer({ id: "25", firstName: "", lastName: "", stageName: "Sunday Funday", active: true, hidden: false }),
  seedPerformer({ id: "26", firstName: "", lastName: "", stageName: "Thirsty Thursday", active: false, hidden: false }),
  seedPerformer({ id: "27", firstName: "", lastName: "", stageName: "Weekend Warriors", active: false, hidden: true }),
  seedPerformer({ id: "28", firstName: "John", lastName: "Doe", stageName: "Johnny Laughs", active: true, hidden: false }),
  seedPerformer({ id: "29", firstName: "Jane", lastName: "Smith", stageName: "Jane Spark", active: true, hidden: false }),
  seedPerformer({ id: "30", firstName: "", lastName: "", stageName: "Xmas Comedy Special", active: true, hidden: false }),
]
