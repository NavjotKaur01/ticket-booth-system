/** Static comedian profile for the reservation Comic Info modal — replace with API when wired up. */
export type ComicInfo = {
  lastName: string
  firstName: string
  stageName: string
  about: string
  notes: string
  email: string
  address: string
  address2: string
  city: string
  state: string
  zipCode: string
  country: string
  homePhone: string
  mobilePhone: string
  fax: string
  url: string
  altUrl: string
  artistType: string
  preferredContact: string
}

export const comicInfoByStageName: Record<string, ComicInfo> = {
  "Benson, Doug": {
    lastName: "Benson",
    firstName: "Doug",
    stageName: "Benson, Doug",
    about:
      "Doug Benson is a comedian, actor, and podcast host known for his laid-back style and love of film. He has appeared on numerous comedy specials and hosts the popular podcast Doug Loves Movies.",
    notes: "",
    email: "booking@dougbenson.com",
    address: "123 Comedy Lane",
    address2: "Suite 4B",
    city: "Los Angeles",
    state: "CA",
    zipCode: "90028",
    country: "US",
    homePhone: "(323) 555-0100",
    mobilePhone: "(323) 555-0101",
    fax: "(323) 555-0102",
    url: "https://www.dougbenson.com",
    altUrl: "",
    artistType: "Comedian",
    preferredContact: "email",
  },
  "The Bandit": {
    lastName: "",
    firstName: "",
    stageName: "The Bandit",
    about:
      "The Bandit is a high-energy stand-up comic known for sharp crowd work and storytelling. A regular on the club circuit with a fast-paced, conversational stage presence.",
    notes: "",
    email: "",
    address: "",
    address2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    homePhone: "",
    mobilePhone: "",
    fax: "",
    url: "",
    altUrl: "",
    artistType: "Comedian",
    preferredContact: "mobile",
  },
}

export function getComicInfo(stageName: string): ComicInfo {
  return (
    comicInfoByStageName[stageName] ?? {
      lastName: "",
      firstName: "",
      stageName,
      about: "",
      notes: "",
      email: "",
      address: "",
      address2: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      homePhone: "",
      mobilePhone: "",
      fax: "",
      url: "",
      altUrl: "",
      artistType: "",
      preferredContact: "email",
    }
  )
}
