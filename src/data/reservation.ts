import type {
  Reservation,
  ReservationCounts,
  SectionOption,
  ShowOption,
} from "@/types/reservation"

/** Static reservation data for the booth UI â€” replace with API calls when wired up. */
export const showOptions: ShowOption[] = [
  { id: "1", label: "7:30 PM Benson, Doug", time: "7:30 PM", subtitle: "Main Theater" },
  { id: "2", label: "9:30 PM Benson, Doug", time: "9:30 PM", subtitle: "Main Theater" },
  { id: "3", label: "11:00 PM Benson, Doug", time: "11:00 PM", subtitle: "Main Theater" },
]

const showOptionsByWeekday: Record<number, ShowOption[]> = {
  0: [
    { id: "sun-1", label: "6:00 PM Benson, Doug", time: "6:00 PM", subtitle: "Main Theater" },
    { id: "sun-2", label: "8:30 PM Benson, Doug", time: "8:30 PM", subtitle: "Main Theater" },
  ],
  1: [
    { id: "mon-1", label: "7:00 PM Benson, Doug", time: "7:00 PM", subtitle: "Main Theater" },
    { id: "mon-2", label: "10:00 PM Benson, Doug", time: "10:00 PM", subtitle: "Main Theater" },
  ],
  2: [
    { id: "tue-1", label: "7:30 PM Benson, Doug", time: "7:30 PM", subtitle: "Main Theater" },
    { id: "tue-2", label: "9:30 PM Benson, Doug", time: "9:30 PM", subtitle: "Main Theater" },
  ],
  3: [
    { id: "wed-1", label: "7:30 PM Benson, Doug", time: "7:30 PM", subtitle: "Main Theater" },
    { id: "wed-2", label: "9:45 PM Benson, Doug", time: "9:45 PM", subtitle: "Main Theater" },
  ],
  4: showOptions,
  5: [
    { id: "fri-1", label: "7:30 PM Benson, Doug", time: "7:30 PM", subtitle: "Main Theater" },
    { id: "fri-2", label: "9:45 PM Benson, Doug", time: "9:45 PM", subtitle: "Main Theater" },
    { id: "fri-3", label: "11:59 PM Benson, Doug", time: "11:59 PM", subtitle: "Main Theater" },
  ],
  6: [
    { id: "sat-1", label: "6:30 PM Benson, Doug", time: "6:30 PM", subtitle: "Main Theater" },
    { id: "sat-2", label: "8:45 PM Benson, Doug", time: "8:45 PM", subtitle: "Main Theater" },
    { id: "sat-3", label: "11:00 PM Benson, Doug", time: "11:00 PM", subtitle: "Main Theater" },
  ],
}

export function getShowOptionsForDate(showDate: string): ShowOption[] {
  const date = new Date(`${showDate}T00:00:00`)

  if (Number.isNaN(date.getTime())) {
    return showOptions
  }

  const scheduledShows = showOptionsByWeekday[date.getDay()] ?? showOptions
  return scheduledShows.map((show) => ({ ...show }))
}

export function formatSectionDesktopPrice (price: string) {
  return price.startsWith('$ ') ? price : `$ ${price.slice(1)}`
}

export function formatSectionSeatAvailability (seats: number, available: number) {
  return `Seats: ${seats} Available: ${available}`
}

export function formatSectionOptionLabel (option: Pick<
  SectionOption,
  'price' | 'name' | 'seats' | 'available'
>) {
  return `${formatSectionDesktopPrice(option.price)} ${option.name} ${formatSectionSeatAvailability(option.seats, option.available)}`
}

export const sectionOptions: SectionOption[] = [
  {
    id: "regular",
    label: formatSectionOptionLabel({
      price: "$10.00",
      name: "Regular",
      seats: 300,
      available: 121,
    }),
    price: "$10.00",
    name: "Regular",
    seats: 300,
    available: 121,
    tone: "regular",
  },
  {
    id: "vip",
    label: formatSectionOptionLabel({
      price: "$25.00",
      name: "VIP",
      seats: 50,
      available: 33,
    }),
    price: "$25.00",
    name: "VIP",
    seats: 50,
    available: 33,
    tone: "vip",
  },
]

export const promoOptions = [
  { id: "none", label: "Select promo code" },
  { id: "admit2", label: "Admit 2" },
  { id: "admit4", label: "Admit 4" },
  { id: "buy1get1", label: "Buy 1 Get 1" },
  { id: "comedy10", label: "COMEDY10" },
] as const

export const reservationCounts: ReservationCounts = {
  seats: 200,
  reservation: 8,
  available: 192,
  seated: 3,
  scanned: 2,
}

export const reservations: Reservation[] = [
  {
    id: "1",
    resStatus: "RSTATE01",
    isCancelled: false,
    lastName: "Rider",
    firstName: "Max",
    businessName: "",
    email: "sandeepchilana467@gmail.com",
    phoneNo: "(614) 555-0101",
    source: "Web",
    tables: "",
    seatNo: "A-12",
    notes: "",
    promo: "",
    din: "N",
    section: "Regular",
    qty: 1,
    seated: 0,
    scanner: 0,
    total: "$11.50",
    paid: "$11.50",
    createdBy: "sandeepchilana4",
    createdDt: "Jun 16, 2026 2:20 AM",
    lastUpdateBy: "",
    lastUpdateDt: "",
  },
  {
    id: "2",
    resStatus: "RSTATE01",
    isCancelled: false,
    lastName: "Johnson",
    firstName: "Sarah",
    businessName: "Acme Corp",
    email: "sarah.j@acmecorp.com",
    phoneNo: "(614) 555-0182",
    source: "Phone",
    tables: "T-4",
    seatNo: "",
    notes: "Birthday party",
    promo: "COMEDY10",
    din: "Y",
    section: "VIP",
    qty: 4,
    seated: 4,
    scanner: 4,
    total: "$102.00",
    paid: "$102.00",
    createdBy: "admin",
    createdDt: "Jun 17, 2026 10:15 AM",
    lastUpdateBy: "admin",
    lastUpdateDt: "Jun 17, 2026 6:30 PM",
  },
  {
    id: "3",
    resStatus: "RSTATE01",
    isCancelled: false,
    lastName: "Martinez",
    firstName: "Carlos",
    businessName: "",
    email: "carlos.m@email.com",
    phoneNo: "(614) 555-0144",
    source: "Walkup",
    tables: "",
    seatNo: "",
    notes: "",
    promo: "",
    din: "N",
    section: "Regular",
    qty: 2,
    seated: 0,
    scanner: 0,
    total: "$23.00",
    paid: "$23.00",
    createdBy: "booth1",
    createdDt: "Jun 18, 2026 11:42 AM",
    lastUpdateBy: "",
    lastUpdateDt: "",
  },
  {
    id: "4",
    resStatus: "RSTATE11",
    isCancelled: true,
    lastName: "Chen",
    firstName: "Emily",
    businessName: "",
    email: "emily.chen@gmail.com",
    phoneNo: "(614) 555-0199",
    source: "Web",
    tables: "",
    seatNo: "B-08",
    notes: "Wheelchair accessible",
    promo: "",
    din: "N",
    section: "Regular",
    qty: 2,
    seated: 2,
    scanner: 1,
    total: "$23.00",
    paid: "$23.00",
    createdBy: "webportal",
    createdDt: "Jun 15, 2026 4:55 PM",
    lastUpdateBy: "admin",
    lastUpdateDt: "Jun 18, 2026 7:00 PM",
  },
  {
    id: "5",
    resStatus: "RSTATE01",
    isCancelled: false,
    lastName: "Williams",
    firstName: "James",
    businessName: "Standupmedia",
    email: "j.williams@standupmedia.com",
    phoneNo: "(216) 555-0100",
    source: "Phone",
    tables: "",
    seatNo: "",
    notes: "Comp â€” manager approval",
    promo: "COMP",
    din: "Y",
    section: "VIP",
    qty: 2,
    seated: 0,
    scanner: 0,
    total: "$0.00",
    paid: "$0.00",
    createdBy: "admin",
    createdDt: "Jun 18, 2026 9:00 AM",
    lastUpdateBy: "admin",
    lastUpdateDt: "Jun 18, 2026 9:05 AM",
  },
  {
    id: "6",
    resStatus: "RSTATE01",
    isCancelled: false,
    lastName: "Patel",
    firstName: "Priya",
    businessName: "",
    email: "priya.patel@outlook.com",
    phoneNo: "(216) 555-0102",
    source: "Web",
    tables: "",
    seatNo: "C-15",
    notes: "",
    promo: "EARLYBIRD",
    din: "N",
    section: "Regular",
    qty: 3,
    seated: 0,
    scanner: 0,
    total: "$31.50",
    paid: "$31.50",
    createdBy: "webportal",
    createdDt: "Jun 14, 2026 8:30 PM",
    lastUpdateBy: "",
    lastUpdateDt: "",
  },
  {
    id: "7",
    resStatus: "RSTATE01",
    isCancelled: false,
    lastName: "Brown",
    firstName: "Michael",
    businessName: "",
    email: "mbrown@yahoo.com",
    phoneNo: "(614) 283-6500",
    source: "Walkup",
    tables: "",
    seatNo: "",
    notes: "",
    promo: "",
    din: "N",
    section: "Regular",
    qty: 1,
    seated: 1,
    scanner: 1,
    total: "$11.50",
    paid: "$11.50",
    createdBy: "booth2",
    createdDt: "Jun 18, 2026 6:15 PM",
    lastUpdateBy: "",
    lastUpdateDt: "",
  },
  {
    id: "8",
    resStatus: "RSTATE01",
    isCancelled: false,
    lastName: "Davis",
    firstName: "Laura",
    businessName: "Media Group LLC",
    email: "laura.davis@mediagroup.com",
    phoneNo: "(315) 000-0000",
    source: "Phone",
    tables: "T-2",
    seatNo: "",
    notes: "Group booking â€” 6 guests",
    promo: "",
    din: "Y",
    section: "VIP",
    qty: 6,
    seated: 0,
    scanner: 0,
    total: "$153.00",
    paid: "$76.50",
    createdBy: "admin",
    createdDt: "Jun 13, 2026 1:20 PM",
    lastUpdateBy: "admin",
    lastUpdateDt: "Jun 17, 2026 3:00 PM",
  },
]

export const reservationShowMeta = {
  comicName: "Benson, Doug",
  showDate: "Thursday, June 18, 2026",
  showDateInput: "2026-06-18",
}

