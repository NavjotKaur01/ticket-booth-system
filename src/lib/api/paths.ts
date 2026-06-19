export function clubApiPath(clubSlug: string, ...segments: string[]) {
  return `/clubman/api/${clubSlug}/${segments.join("/")}`
}

export function reportApiPath(clubSlug: string, ...segments: string[]) {
  return `/clubman/api/Report/${clubSlug}/${segments.join("/")}`
}

export function reservationApiPath(...segments: string[]) {
  return `/clubman/api/Reservation/${segments.join("/")}`
}
