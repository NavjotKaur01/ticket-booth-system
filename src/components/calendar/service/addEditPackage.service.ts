import type { CalendarEvent } from "@/data/calendarEvents"

export type AddEditPackageDialogData = {
  eventId: string
  dateLabel: string
  timeLabel: string
  startTime: string
  arrivalTime: string
  price: string
  seats: string
  packageName: string
  comic: string
  packageText: string
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
    .format(date)
    .toLowerCase()
}

function getPackageText(event: CalendarEvent) {
  if (event.performer === "The Bandit" || event.performer === "Late Night Special") {
    return "The Copenhagen Bandit is a comedian born and raised in Joplin Missouri surrounded by redneck beer drinking family and friends who are often the people behind his jokes. From growing up in the 90s to crazy story's you can't believe but will always enjoy. This comic with over 280,000 followers is a must see."
  }

  return `${event.performer} brings a sharp, crowd-friendly comedy package for this show. Update this package copy once the live API returns the final event description.`
}

export async function getAddEditPackageDialogData(
  event: CalendarEvent
): Promise<AddEditPackageDialogData> {
  await new Promise((resolve) => window.setTimeout(resolve, 200))

  return {
    eventId: event.id,
    dateLabel: formatDate(event.start),
    timeLabel: event.time,
    startTime: formatTime(event.start),
    arrivalTime: formatTime(event.start),
    price: "$0.00",
    seats: "0",
    packageName: event.performer,
    comic: event.performer,
    packageText: getPackageText(event),
  }
}

