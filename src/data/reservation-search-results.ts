import { parsePhoneSearchParts } from '@/lib/parse-phone-search-parts'

export type ReservationCustomerSearchResult = {
  id: string
  lastName: string
  firstName: string
  phoneNo: string
  areaCode: string
  phone1: string
  phone2: string
  email: string
  banned: boolean
}

export type ReservationBusinessSearchResult = {
  id: string
  businessName: string
  lastName: string
  firstName: string
  phoneNo: string
  areaCode: string
  phone1: string
  phone2: string
}

function withPhoneParts<
  T extends { phoneNo: string }
>(entry: T): T & { areaCode: string; phone1: string; phone2: string } {
  const phone = parsePhoneSearchParts(entry.phoneNo)

  return {
    ...entry,
    areaCode: phone.areaCode,
    phone1: phone.phone1,
    phone2: phone.phone2
  }
}

/** Sample customer matches — replace with API search results when wired up. */
export const reservationCustomerSearchResults: ReservationCustomerSearchResult[] =
  [
    withPhoneParts({
      id: 'c1',
      lastName: 'Smith',
      firstName: 'John',
      phoneNo: '(614) 555-0101',
      email: 'john.smith@email.com',
      banned: false
    }),
    withPhoneParts({
      id: 'c2',
      lastName: 'Smith',
      firstName: 'Jonathan',
      phoneNo: '(614) 555-0182',
      email: 'jonathan.smith@email.com',
      banned: false
    }),
    withPhoneParts({
      id: 'c3',
      lastName: 'Smithson',
      firstName: 'Mary',
      phoneNo: '(614) 555-0144',
      email: 'mary.smithson@email.com',
      banned: false
    }),
    withPhoneParts({
      id: 'c4',
      lastName: 'Smyth',
      firstName: 'Robert',
      phoneNo: '(614) 555-0199',
      email: 'robert.smyth@email.com',
      banned: false
    })
  ]

/** Sample business matches — replace with API search results when wired up. */
export const reservationBusinessSearchResults: ReservationBusinessSearchResult[] =
  [
    withPhoneParts({
      id: 'b1',
      businessName: 'Acme Corp',
      lastName: 'Johnson',
      firstName: 'Robert',
      phoneNo: '(216) 555-0100'
    }),
    withPhoneParts({
      id: 'b2',
      businessName: 'Acme Holdings',
      lastName: 'Johnson',
      firstName: 'Rebecca',
      phoneNo: '(216) 555-0102'
    }),
    withPhoneParts({
      id: 'b3',
      businessName: 'Abercrombie & Fitch',
      lastName: 'Davis',
      firstName: 'Sarah',
      phoneNo: '(614) 283-6500'
    }),
    withPhoneParts({
      id: 'b4',
      businessName: '84 Lumber',
      lastName: 'Miller',
      firstName: 'James',
      phoneNo: '(315) 000-0000'
    })
  ]
