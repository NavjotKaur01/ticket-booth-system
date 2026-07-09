import { dashboardNewsImage } from "@/constants/assets"
import type { AdminEventGroup } from "@/types/admin-event"

export const adminEventGroups: AdminEventGroup[] = [
  {
    id: "event-the-bandit",
    locationId: "standupmedia",
    title: "The Bandit",
    imageUrl: dashboardNewsImage(1),
    showtimes: [
      {
        id: "show-bandit-1",
        showDate: "2026-07-11",
        showDateLabel: "SAT, 07/11/2026 07:00 PM",
        priceLabel: "Price: $10.00",
      },
    ],
  },
  {
    id: "event-isak-allen",
    locationId: "standupmedia",
    title: "Isak Allen",
    imageUrl: dashboardNewsImage(2),
    showtimes: [
      {
        id: "show-isak-1",
        showDate: "2026-07-11",
        showDateLabel: "SAT, 07/11/2026 07:00 PM",
        priceLabel: "Price Range: $16.00 - $20.00",
        hasNote: true,
      },
      {
        id: "show-isak-2",
        showDate: "2026-07-11",
        showDateLabel: "SAT, 07/11/2026 09:30 PM",
        priceLabel: "Price Range: $16.00 - $20.00",
      },
      {
        id: "show-isak-3",
        showDate: "2026-07-12",
        showDateLabel: "SUN, 07/12/2026 07:00 PM",
        priceLabel: "Price Range: $16.00 - $20.00",
      },
    ],
  },
  {
    id: "event-office-trivia",
    locationId: "standupmedia",
    title: "'the Office' trivia night",
    imageUrl: dashboardNewsImage(3),
    showtimes: [
      {
        id: "show-office-1",
        showDate: "2026-07-08",
        showDateLabel: "WED, 07/08/2026 07:00 PM",
        priceLabel: "Price: $12.00",
      },
      {
        id: "show-office-2",
        showDate: "2026-07-15",
        showDateLabel: "WED, 07/15/2026 07:00 PM",
        priceLabel: "Price: $12.00",
      },
    ],
  },
  {
    id: "event-feature-friday",
    locationId: "standupmedia",
    title: "Feature Friday",
    imageUrl: dashboardNewsImage(4),
    showtimes: [
      {
        id: "show-feature-1",
        showDate: "2026-07-11",
        showDateLabel: "SAT, 07/11/2026 08:00 PM",
        priceLabel: "Price: $15.00",
      },
      {
        id: "show-feature-2",
        showDate: "2026-07-18",
        showDateLabel: "SAT, 07/18/2026 08:00 PM",
        priceLabel: "Price: $15.00",
        hasNote: true,
      },
    ],
  },
  {
    id: "event-open-mic",
    locationId: "standupmedia",
    title: "Open Mic Night",
    imageUrl: dashboardNewsImage(5),
    showtimes: [
      {
        id: "show-open-mic-1",
        showDate: "2026-07-08",
        showDateLabel: "WED, 07/08/2026 08:30 PM",
        priceLabel: "Price: $5.00",
      },
      {
        id: "show-open-mic-2",
        showDate: "2026-07-10",
        showDateLabel: "FRI, 07/10/2026 08:30 PM",
        priceLabel: "Price: $5.00",
      },
      {
        id: "show-open-mic-3",
        showDate: "2026-07-17",
        showDateLabel: "FRI, 07/17/2026 08:30 PM",
        priceLabel: "Price: $5.00",
      },
    ],
  },
  {
    id: "event-headliner",
    locationId: "standupmedia",
    title: "Headliner Series",
    imageUrl: dashboardNewsImage(6),
    showtimes: [
      {
        id: "show-headliner-1",
        showDate: "2026-07-12",
        showDateLabel: "SUN, 07/12/2026 07:30 PM",
        priceLabel: "Price Range: $20.00 - $35.00",
      },
      {
        id: "show-headliner-2",
        showDate: "2026-07-19",
        showDateLabel: "SUN, 07/19/2026 07:30 PM",
        priceLabel: "Price Range: $20.00 - $35.00",
      },
    ],
  },
]
