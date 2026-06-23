export type ReservationCustomerSearchResult = {
  id: string
  lastName: string
  firstName: string
  phoneNo: string
  email: string
}

export type ReservationBusinessSearchResult = {
  id: string
  businessName: string
  lastName: string
  firstName: string
  phoneNo: string
}

/** Sample customer matches — replace with API search results when wired up. */
export const reservationCustomerSearchResults: ReservationCustomerSearchResult[] =
  [
    {
      id: "c1",
      lastName: "Smith",
      firstName: "John",
      phoneNo: "(614) 555-0101",
      email: "john.smith@email.com",
    },
    {
      id: "c2",
      lastName: "Smith",
      firstName: "Jonathan",
      phoneNo: "(614) 555-0182",
      email: "jonathan.smith@email.com",
    },
    {
      id: "c3",
      lastName: "Smithson",
      firstName: "Mary",
      phoneNo: "(614) 555-0144",
      email: "mary.smithson@email.com",
    },
    {
      id: "c4",
      lastName: "Smyth",
      firstName: "Robert",
      phoneNo: "(614) 555-0199",
      email: "robert.smyth@email.com",
    },
  ]

/** Sample business matches — replace with API search results when wired up. */
export const reservationBusinessSearchResults: ReservationBusinessSearchResult[] =
  [
    {
      id: "b1",
      businessName: "Acme Corp",
      lastName: "Johnson",
      firstName: "Robert",
      phoneNo: "(216) 555-0100",
    },
    {
      id: "b2",
      businessName: "Acme Holdings",
      lastName: "Johnson",
      firstName: "Rebecca",
      phoneNo: "(216) 555-0102",
    },
    {
      id: "b3",
      businessName: "Abercrombie & Fitch",
      lastName: "Davis",
      firstName: "Sarah",
      phoneNo: "(614) 283-6500",
    },
    {
      id: "b4",
      businessName: "84 Lumber",
      lastName: "Miller",
      firstName: "James",
      phoneNo: "(315) 000-0000",
    },
  ]
