import type { SumContactLead } from "@/types/sum-contact-lead"

export const sumContactLeads: SumContactLead[] = [
  {
    id: "lead-001",
    locationId: "standupmedia",
    fullName: "Max",
    venue: "Test",
    phone: "12121",
    city: "test",
    state: "test",
    email: "max@standupmedia.com",
    message: "Test",
    createdOn: "2/3/2025 7:00:45 AM",
  },
  {
    id: "lead-002",
    locationId: "standupmedia",
    fullName: "test",
    venue: "test",
    phone: "26151212",
    city: "test",
    state: "test",
    email: "test@a.com",
    message: "test max",
    createdOn: "2/3/2025 7:07:03 AM",
  },
  {
    id: "lead-003",
    locationId: "standupmedia",
    fullName: "Allan Johansen",
    venue: "System Audio",
    phone: "42424242",
    city: "Roskilde",
    state: "sds",
    email: "allan@example.com",
    message:
      "Hej, Min navn er Allan og jeg er interesseret i at høre mere om jeres system.",
    createdOn: "6/14/2016 8:52:26 AM",
  },
]
