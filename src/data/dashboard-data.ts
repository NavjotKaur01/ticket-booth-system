import type {
  NewsItem,
  QuickLink,
  ServiceFees,
  StatSummary,
  UserSession,
} from "@/types/dashboard"

export const userSession: UserSession = {
  username: "admin",
  organization: "Standupmedia",
  lastLogin: "9/21/2016",
}

export const statSummaries: StatSummary[] = [
  {
    id: "yesterday",
    label: "Yesterday Ticket Sold",
    value: 1,
    accentClass: "bg-sky-400",
  },
  {
    id: "today",
    label: "Today Sold",
    value: 1,
    accentClass: "bg-emerald-500",
  },
  {
    id: "week",
    label: "This Week Sold",
    value: 2,
    accentClass: "bg-violet-500",
  },
  {
    id: "month",
    label: "This Month Sold",
    value: 40,
    accentClass: "bg-orange-500",
  },
]

export const serviceFees: ServiceFees = {
  walkup: "$1.50",
  phone: "$2.00",
  web: "$2.50",
}

export const quickLinks: QuickLink[] = [
  { label: "Standupmedia Support", href: "#" },
  { label: "Email Support", href: "#" },
  { label: "Manager Checkout", href: "#" },
  { label: "Quick View Sales", href: "#" },
  { label: "Door Checkout", href: "#" },
  { label: "System Defaults", href: "#" },
  { label: "Online Dashboard", href: "#" },
  { label: "Add a Comic", href: "#" },
]

export const newsItems: NewsItem[] = [
  {
    id: "1",
    title: "New Seating Chart Designer",
    date: "2/5/2025",
    description:
      "Design and manage venue seating layouts with the updated drag-and-drop chart editor.",
  },
  {
    id: "2",
    title: "Mobile Check-In App",
    date: "1/18/2025",
    description:
      "Scan tickets at the door with the ClubMan mobile check-in app for iOS and Android.",
  },
  {
    id: "3",
    title: "Updated Ticket Printing",
    date: "12/10/2024",
    description:
      "Print branded tickets with barcodes and custom layouts directly from the ticket booth.",
  },
  {
    id: "4",
    title: "Service Fee Reference",
    date: "11/2/2024",
    description: "Current default service fees by sales channel.",
    fees: serviceFees,
  },
  {
    id: "5",
    title: "Quick View Sales Report",
    date: "10/15/2024",
    description:
      "Access real-time sales totals from the Quick Links sidebar without leaving the dashboard.",
  },
  {
    id: "6",
    title: "Reservation Calendar Tips",
    date: "9/8/2024",
    description:
      "Use color-coded calendar entries to track holds, confirmed reservations, and comp tickets.",
  },
  {
    id: "7",
    title: "Door Checkout Workflow",
    date: "8/22/2024",
    description:
      "End-of-night door checkout reconciles cash, card, and comp totals in one step.",
  },
  {
    id: "8",
    title: "Online Dashboard Sync",
    date: "7/4/2024",
    description:
      "The online dashboard now syncs inventory and sales data every five minutes.",
  },
]
