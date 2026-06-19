import type {
  NewsItem,
  QuickLink,
  ServiceFees,
  StatSummary,
  UserSession,
} from "@/types/dashboard"
import { dashboardNewsImage } from "@/constants/assets"
import { ROUTES, reportViewerUrl } from "@/constants/routes"

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
  },
  {
    id: "today",
    label: "Today Sold",
    value: 1,
  },
  {
    id: "week",
    label: "This Week Sold",
    value: 2,
  },
  {
    id: "month",
    label: "This Month Sold",
    value: 40,
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
  { label: "Manager Checkout", href: reportViewerUrl("manager-checkout") },
  { label: "Quick View Sales", href: reportViewerUrl("quick-view-sales") },
  { label: "Door Checkout", href: reportViewerUrl("door-checkout") },
  { label: "System Defaults", href: ROUTES.systemDefaults },
  { label: "Online Dashboard", href: "#" },
  { label: "Add a Comic", href: "#" },
]

export const newsItems: NewsItem[] = [
  {
    id: "1",
    title: "New Custom Sliders",
    date: "2/5/2025 12:00:00 AM",
    imageUrl: dashboardNewsImage(1),
    description:
      "We can customize from self loading to custom made onto your website",
  },
  {
    id: "2",
    title: "Online Seating",
    date: "2/20/2021 12:00:00 AM",
    imageUrl: dashboardNewsImage(2),
    description:
      "You can now let customers pick their own seat online",
  },
  {
    id: "3",
    title: "Limit Tickets purchased for a show",
    date: "10/31/2023 12:00:00 AM",
    imageUrl: dashboardNewsImage(3),
    description:
      "Steps to Setup Max Tickets for a show STEP 1: Go to Calendar and click the show for the date you want to set up. STEP 2: Right mouse click to bring up menu Select Reservation or from top menu click Reservation. STEP 3: Set Max Ticket in top right corner. Set up here any value more than 0 to make it work for reservations.",
  },
  {
    id: "4",
    title: "Section Fees",
    date: "3/19/2019 12:00:00 AM",
    imageUrl: dashboardNewsImage(4),
    description: "New Section Fees",
    fees: serviceFees,
  },
  {
    id: "5",
    title: "Scanner iOS 2.0",
    date: "9/4/2018 12:00:00 AM",
    imageUrl: dashboardNewsImage(5),
    description:
      "New Features Include: 1. Three Icons per Row - This allows us to enlarge the action buttons at the bottom. 2. Auto-close on confirmation - No need to manually close successful scans.",
  },
  {
    id: "6",
    title: "Ticket Text Changes",
    date: "1/18/2018 12:00:00 AM",
    imageUrl: dashboardNewsImage(6),
    description: "Customize your ticket message here!",
  },
]
